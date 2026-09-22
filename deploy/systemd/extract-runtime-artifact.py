#!/usr/bin/env python3
"""Safely extract one reviewed jacobdanderson.net runtime archive."""

import os
from pathlib import Path, PurePosixPath
import shutil
import sys
import tarfile

MAX_MEMBERS = 50_000
MAX_EXPANDED_BYTES = 512 * 1024 * 1024
MAX_PATH_BYTES = 4_096
MAX_PATH_DEPTH = 64


def fail(message: str) -> None:
    raise SystemExit(message)


if len(sys.argv) != 3:
    fail("Usage: extract-runtime-artifact.py <runtime.tar.gz> <empty-destination>")

archive = Path(sys.argv[1]).resolve(strict=True)
destination_argument = Path(sys.argv[2])
if destination_argument.is_symlink() or not destination_argument.is_dir():
    fail("Extraction destination must be a real directory.")
destination = destination_argument.resolve(strict=True)
if any(destination.iterdir()):
    fail("Extraction destination must be empty.")

def validate_archive() -> None:
    seen: set[str] = set()
    member_count = 0
    total_size = 0
    with tarfile.open(archive, "r:gz") as bundle:
        for member in bundle:
            member_count += 1
            if member_count > MAX_MEMBERS:
                fail("Archive exceeds the bounded member-count limit.")
            name = member.name
            while name.startswith("./"):
                name = name[2:]
            if not name:
                if not member.isdir():
                    fail("Archive contains an empty non-directory entry.")
                name = "."
            relative = PurePosixPath(name)
            if relative.is_absolute() or ".." in relative.parts or "\\" in name or "\x00" in name:
                fail(f"Archive contains an unsafe path: {member.name}")
            try:
                path_bytes = len(name.encode("utf-8"))
            except UnicodeEncodeError:
                fail("Archive contains an invalid Unicode path.")
            if path_bytes > MAX_PATH_BYTES or len(relative.parts) > MAX_PATH_DEPTH:
                fail(f"Archive path exceeds the bounded length or depth: {member.name}")
            if name in seen:
                fail(f"Archive contains a duplicate path: {name}")
            seen.add(name)
            if not member.isdir() and not member.isfile():
                fail(f"Archive contains a link or special file: {name}")
            if member.isfile():
                total_size += member.size
            if total_size > MAX_EXPANDED_BYTES:
                fail("Archive exceeds the bounded expanded-size limit.")


validate_archive()

old_umask = os.umask(0o077)
try:
    with tarfile.open(archive, "r:gz") as bundle:
        for member in bundle:
            name = member.name
            while name.startswith("./"):
                name = name[2:]
            if not name:
                continue
            relative = PurePosixPath(name)
            target = destination.joinpath(*relative.parts)
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True, mode=0o755)
                continue
            target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
            source = bundle.extractfile(member)
            if source is None:
                fail(f"Archive file has no readable payload: {name}")
            descriptor = os.open(
                target,
                os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                0o644,
            )
            with source, os.fdopen(descriptor, "wb") as output:
                shutil.copyfileobj(source, output, length=1024 * 1024)
finally:
    os.umask(old_umask)

for directory, _directories, files in os.walk(destination):
    os.chmod(directory, 0o755)
    for filename in files:
        os.chmod(Path(directory, filename), 0o644)
