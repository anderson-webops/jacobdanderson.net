#!/usr/bin/env python3
"""Safely extract one reviewed jacobdanderson.net runtime archive."""

from contextlib import ExitStack
import os
from pathlib import PurePosixPath
import shutil
import stat
import sys
import tarfile

MAX_MEMBERS = 50_000
MAX_EXPANDED_BYTES = 512 * 1024 * 1024
MAX_PATH_BYTES = 4_096
MAX_PATH_DEPTH = 64


def fail(message: str) -> None:
    raise SystemExit(message)


def validated_members(bundle: tarfile.TarFile):
    seen: set[str] = set()
    member_count = 0
    total_size = 0
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
            if member.size < 0:
                fail("Archive contains a negative file size.")
            total_size += member.size
        if total_size > MAX_EXPANDED_BYTES:
            fail("Archive exceeds the bounded expanded-size limit.")
        yield member, name, relative.parts


def open_directory(root_descriptor: int, parts: tuple[str, ...]) -> int:
    current_descriptor = os.dup(root_descriptor)
    try:
        for component in parts:
            try:
                os.mkdir(component, mode=0o700, dir_fd=current_descriptor)
            except FileExistsError:
                pass
            child_descriptor = os.open(
                component,
                os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW,
                dir_fd=current_descriptor,
            )
            os.close(current_descriptor)
            current_descriptor = child_descriptor
            os.fchmod(current_descriptor, 0o755)
        return current_descriptor
    except BaseException:
        os.close(current_descriptor)
        raise


def extract_archive(archive_path: str, destination_path: str) -> None:
    with ExitStack() as resources:
        archive_descriptor = os.open(archive_path, os.O_RDONLY | os.O_NOFOLLOW)
        archive_file = resources.enter_context(os.fdopen(archive_descriptor, "rb"))
        if not stat.S_ISREG(os.fstat(archive_descriptor).st_mode):
            fail("Runtime archive must be a regular file, not a link.")

        destination_descriptor = os.open(
            destination_path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
        )
        resources.callback(os.close, destination_descriptor)
        destination_stat = os.fstat(destination_descriptor)
        if destination_stat.st_uid != os.geteuid() or destination_stat.st_mode & 0o022:
            fail("Extraction destination must be owned by the extractor and not writable by others.")
        if os.listdir(destination_descriptor):
            fail("Extraction destination must be empty.")

        with tarfile.open(fileobj=archive_file, mode="r:gz") as bundle:
            for _member, _name, _parts in validated_members(bundle):
                pass

        archive_file.seek(0)
        old_umask = os.umask(0o077)
        try:
            with tarfile.open(fileobj=archive_file, mode="r:gz") as bundle:
                for member, name, parts in validated_members(bundle):
                    if member.isdir():
                        directory_descriptor = open_directory(destination_descriptor, parts)
                        os.close(directory_descriptor)
                        continue

                    parent_descriptor = open_directory(destination_descriptor, parts[:-1])
                    try:
                        source = bundle.extractfile(member)
                        if source is None:
                            fail(f"Archive file has no readable payload: {name}")
                        with source:
                            output_descriptor = os.open(
                                parts[-1],
                                os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                                0o600,
                                dir_fd=parent_descriptor,
                            )
                            with os.fdopen(output_descriptor, "wb") as output:
                                shutil.copyfileobj(source, output, length=1024 * 1024)
                                output.flush()
                                os.fchmod(output.fileno(), 0o644)
                    finally:
                        os.close(parent_descriptor)
        finally:
            os.umask(old_umask)
        os.fchmod(destination_descriptor, 0o755)


def main() -> None:
    if len(sys.argv) != 3:
        fail("Usage: extract-runtime-artifact.py <runtime.tar.gz> <empty-destination>")
    extract_archive(sys.argv[1], sys.argv[2])


if __name__ == "__main__":
    main()
