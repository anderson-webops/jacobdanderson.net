#!/usr/bin/env python3
"""Exercise archive and destination replacement during extraction."""

import importlib.util
from io import BytesIO
from pathlib import Path
import stat
import tarfile
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch


EXTRACTOR_PATH = Path(__file__).resolve().parents[1] / "deploy/systemd/extract-runtime-artifact.py"
SPEC = importlib.util.spec_from_file_location("extract_runtime_artifact", EXTRACTOR_PATH)
assert SPEC and SPEC.loader
extractor = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(extractor)


def make_archive(path: Path, member_name: str, payload: bytes) -> None:
    with tarfile.open(path, "w:gz") as bundle:
        member = tarfile.TarInfo(member_name)
        member.size = len(payload)
        bundle.addfile(member, BytesIO(payload))


class ExtractorRaceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.workspace = TemporaryDirectory(prefix="portfolio-extractor-")
        self.addCleanup(self.workspace.cleanup)
        self.root = Path(self.workspace.name)
        self.archive = self.root / "reviewed.tar.gz"
        self.destination = self.root / "staging"
        self.destination.mkdir(mode=0o700)
        make_archive(self.archive, "./front-end/dist/index.html", b"reviewed\n")

    def test_regular_archive_preserves_readable_modes(self) -> None:
        extractor.extract_archive(str(self.archive), str(self.destination))
        output = self.destination / "front-end/dist/index.html"
        self.assertEqual(output.read_bytes(), b"reviewed\n")
        self.assertEqual(stat.S_IMODE(output.stat().st_mode), 0o644)
        self.assertEqual(stat.S_IMODE(output.parent.stat().st_mode), 0o755)
        self.assertEqual(stat.S_IMODE(self.destination.stat().st_mode), 0o755)

    def test_archive_path_replacement_cannot_change_validated_members(self) -> None:
        hostile_archive = self.root / "hostile.tar.gz"
        outside = self.root / "escaped"
        make_archive(hostile_archive, "../escaped", b"hostile\n")
        original_members = extractor.validated_members
        first_pass = True

        def replace_after_validation(bundle):
            nonlocal first_pass
            yield from original_members(bundle)
            if first_pass:
                first_pass = False
                self.archive.rename(self.root / "retained.tar.gz")
                hostile_archive.rename(self.archive)

        with patch.object(extractor, "validated_members", replace_after_validation):
            extractor.extract_archive(str(self.archive), str(self.destination))

        self.assertFalse(first_pass)
        self.assertEqual((self.destination / "front-end/dist/index.html").read_bytes(), b"reviewed\n")
        self.assertFalse(outside.exists())

    def test_destination_path_replacement_cannot_redirect_writes(self) -> None:
        retained_destination = self.root / "retained-staging"
        original_members = extractor.validated_members
        first_pass = True

        def replace_after_validation(bundle):
            nonlocal first_pass
            yield from original_members(bundle)
            if first_pass:
                first_pass = False
                self.destination.rename(retained_destination)
                self.destination.mkdir(mode=0o700)

        with patch.object(extractor, "validated_members", replace_after_validation):
            extractor.extract_archive(str(self.archive), str(self.destination))

        self.assertFalse(first_pass)
        self.assertEqual((retained_destination / "front-end/dist/index.html").read_bytes(), b"reviewed\n")
        self.assertEqual(list(self.destination.iterdir()), [])

    def test_unsafe_member_is_rejected_before_any_write(self) -> None:
        make_archive(self.archive, "../escaped", b"hostile\n")
        with self.assertRaisesRegex(SystemExit, "unsafe path"):
            extractor.extract_archive(str(self.archive), str(self.destination))
        self.assertEqual(list(self.destination.iterdir()), [])
        self.assertFalse((self.root / "escaped").exists())


if __name__ == "__main__":
    unittest.main()
