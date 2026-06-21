"""Reject dependencies with licenses outside the project's dependency policy."""

from __future__ import annotations

import importlib.metadata
import json
import re
from email.message import Message
from pathlib import Path
from typing import cast


ROOT = Path(__file__).resolve().parents[1]
PROHIBITED = re.compile(r"(?<!L)GPL|AGPL", re.IGNORECASE)


def declared_python_packages() -> set[str]:
    packages = set()
    for relative_path in ("backend/requirements.txt", "requirements-dev.txt"):
        for raw_line in (ROOT / relative_path).read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith(("#", "-")):
                continue
            packages.add(re.split(r"[<>=!~;\[]", line, maxsplit=1)[0])
    return packages


def python_violations() -> list[str]:
    violations = []
    for name in sorted(declared_python_packages()):
        try:
            metadata = cast(Message, importlib.metadata.metadata(name))
        except importlib.metadata.PackageNotFoundError:
            continue
        fields = dict(metadata.items())
        license_name = fields.get("License-Expression", "")
        if not license_name:
            classifiers = metadata.get_all("Classifier", [])
            license_name = ", ".join(
                value.removeprefix("License :: OSI Approved :: ")
                for value in classifiers
                if value.startswith("License :: OSI Approved :: ")
            )
        if not license_name:
            legacy_license = fields.get("License", "")
            if "\n" not in legacy_license and len(legacy_license) <= 100:
                license_name = legacy_license
        if license_name and PROHIBITED.search(license_name):
            violations.append(f"Python: {name} ({license_name})")
    return violations


def npm_violations() -> list[str]:
    lockfile = ROOT / "frontend" / "package-lock.json"
    data = json.loads(lockfile.read_text(encoding="utf-8"))
    violations = []
    for package_path, package in data.get("packages", {}).items():
        license_name = package.get("license", "")
        if license_name and PROHIBITED.search(license_name):
            name = package_path.removeprefix("node_modules/") or "frontend"
            violations.append(f"npm: {name} ({license_name})")
    return violations


def main() -> int:
    violations = sorted(python_violations() + npm_violations())
    if violations:
        print("Prohibited dependency licenses found:")
        print("\n".join(f"- {violation}" for violation in violations))
        return 1
    print("Dependency license compliance passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
