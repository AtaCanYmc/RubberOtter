# Contributing to Rubber Otter

Contributions to Rubber Otter are welcome. This document details development setup, Conventional Commits specifications, coding guidelines, and pull request procedures for this monorepo.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Please report violations through private maintainer channels.

## Conventional Commits

This repository enforces Conventional Commits 1.0.0. Semantic versioning, CHANGELOG generation, and release packaging are managed by Release Please based on commit structure.

Commit message format:

```text
<type>(<scope>): <subject>
```

### Allowed Types

- `feat`: A new user-facing feature or firmware command.
- `fix`: A bug fix in firmware, SDK, web workstation, or native apps.
- `docs`: Documentation changes only.
- `refactor`: Internal code changes without behavior modification.
- `perf`: Performance improvements in memory, parsing, or transport.
- `test`: Adding or correcting tests.
- `ci`: Changes to GitHub Actions workflows or automation scripts.
- `chore`: Maintenance tasks, dependency updates, or configuration.

### Monorepo Scopes

- `firmware`: C++ ATmega32U4 firmware in `firmware/`.
- `web`: React 18 PWA workstation in `web/`.
- `android`: Native Android Studio project in `android/`.
- `ios`: Native Xcode project in `ios/`.
- `python`: Python SDK, CLI, and OtterDeck in `python/`.
- `protocol`: STX/ETX framing specification and hex codes.
- `monorepo`: Root build scripts and Makefile tooling.

Example:

```text
feat(firmware): implement relative mouse wheel packet parsing
fix(python): handle Bleak disconnect during long macro execution
docs(readme): add hardware wiring table for Pro Micro
```

## Local Development Setup

### Prerequisites

- Node.js 20+ and npm 10+
- Python 3.10+
- PlatformIO Core CLI (for firmware compilation)
- Android Studio / JDK 21 (for Android builds)
- Xcode 15+ (macOS only, for iOS builds)

### Monorepo Commands

The root `Makefile` provides unified shortcuts for bootstrap, build, and test:

```bash
# Clone the repository
git clone https://github.com/AtaCanYmc/RubberOtter.git
cd RubberOtter

# Bootstrap Python virtualenv and npm dependencies
make install

# Run Python unit tests and TypeScript type checking
make test

# Build Web PWA bundle
make build-web

# Sync web bundle into native mobile targets
make mobile-sync
```

## Scoped Component Testing

Before opening a pull request, run the test suites for modified components:

### 1. Python SDK
```bash
python3 -m unittest discover -s python/tests -p "test_*.py"
```

### 2. Web Workstation
```bash
cd web
npm run lint
npm run build
```

### 3. Firmware Verification
```bash
cd firmware
platformio run
```

## Pull Request Checklist

1. Create a dedicated branch from `main`:
   ```bash
   git checkout -b feat/add-media-scancode
   ```
2. Implement your changes following existing code conventions and formatting.
3. Ensure all tests pass locally.
4. Verify no bracket placeholders or dead URLs are introduced.
5. Push your branch and open a Pull Request targeting `main`.
6. Confirm all GitHub Actions CI checks turn green.

