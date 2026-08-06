# Contributing to Rubber Otter

Thank you for your interest in contributing to **Rubber Otter**! We welcome bug fixes, documentation improvements, hardware compatibility features, and new HID capabilities.

---

## 📜 Conventional Commits

We enforce the **Conventional Commits** specification for automated semantic versioning and changelog generation via Release Please.

Commit messages and Pull Request titles must follow this format:

```
<type>(<scope>): <short description>
```

### Supported Types

- `feat`: A new feature or firmware command (e.g. `feat(parser): add mouse scroll command support`)
- `fix`: A bug fix (e.g. `fix(parser): resolve WAIT_ETX state deadlock on corrupted byte`)
- `docs`: Documentation changes only (e.g. `docs(readme): add wiring diagram`)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Code changes that improve memory efficiency or execution speed
- `ci`: Changes to CI configuration workflows (e.g. `ci(github): add matrix build step`)

---

## 🛠️ Development & Building

1. **Clone Repository**:
   ```bash
   git clone https://github.com/USERNAME/RubberOtter.git
   cd RubberOtter
   ```

2. **PlatformIO Local Compilation**:
   ```bash
   # Build for Arduino Leonardo
   platformio run -e leonardo

   # Build for Pro Micro
   platformio run -e pro_micro
   ```

3. **Run CI Matrix Scripts**:
   ```bash
   chmod +x scripts/ci-local.sh
   ./scripts/ci-local.sh
   ```

---

## 🔀 Pull Request Process

1. Create a descriptive feature branch (`git checkout -b feat/my-new-feature`).
2. Verify that your code compiles cleanly across all PlatformIO targets.
3. Push your branch and open a Pull Request against `main` or `master`.
4. Ensure all automated GitHub Actions CI checks pass.
