# Contributing to RubberOtter

This document defines the commit convention, local environment setup, verification commands, and pull request checklist for RubberOtter.

Control PWA and Capacitor mobile contributions belong in [AtaCanYmc/RubberDeck](https://github.com/AtaCanYmc/RubberDeck).

## Code of Conduct

All contributors must follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Conventional Commits

RubberOtter enforces Conventional Commits 1.0.0. Release Please generates `CHANGELOG.md`, bumps versions across `version.txt`, `python/pyproject.toml`, `python/rubberotter/__init__.py`, and `site/index.html`, and publishes GitHub Releases and PyPI packages from commit types.

Format:

```text
<type>(<scope>): <subject>
```

### Allowed Types

- `feat`: New firmware command, SDK capability, CLI option, or flasher feature.
- `fix`: Bug fix in firmware, Python package, or static flasher site.
- `docs`: Documentation updates.
- `refactor`: Structural code change without behavior change.
- `perf`: Memory, parsing, or transport performance improvement.
- `test`: Test additions or updates.
- `ci`: GitHub Actions workflow or release automation updates.
- `chore`: Maintenance and dependency updates.

### Scopes

- `firmware`: ATmega32U4 C++ firmware in `firmware/`.
- `python`: `rubberotter` Python SDK, CLI, and MCP server in `python/`.
- `site`: Static Caterina 1200 bps Web Serial Flasher in `site/`.
- `protocol`: RubberOtter v1 framing and command specification in `docs/`.
- `security`: Security fixes and CodeQL remediations.

Examples:

```text
feat(firmware): add relative mouse wheel packet parsing
fix(python): handle Bleak disconnect during macro execution
docs(site): update Caterina 1200 bps reset instructions
```

## Local Development Setup

### Prerequisites

- Python 3.10+
- PlatformIO Core CLI (`pio` or `platformio`) for ATmega32U4 firmware builds

### Setup and Verification Commands

```bash
git clone https://github.com/AtaCanYmc/RubberOtter.git
cd RubberOtter

# Create virtualenv and install Python dependencies in editable mode
make install

# Run Python SDK, CLI, web dashboard, and MCP unit tests
make test

# Compile ATmega32U4 firmware across PlatformIO environments
make build-firmware
```

## Pull Request Checklist

1. Branch from `main` using a descriptive name such as `feat/avr109-hex-stream` or `fix/ble-reconnect`.
2. Run `make test` and verify all Python unit tests pass.
3. Run `cd firmware && platformio run` when modifying C++ firmware files.
4. Keep documentation free of placeholder values, dead URLs, and unverified claims.
5. Open a pull request targeting `main` and confirm all GitHub Actions checks pass.
