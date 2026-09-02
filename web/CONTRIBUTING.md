# Contributing to RubberOtterWeb

Thank you for your interest in contributing to **RubberOtterWeb**! We welcome bug reports, feature suggestions, UI polish, and code contributions.

---

## 🚀 Getting Started

### 1. Fork & Clone
Fork the repository on GitHub and clone your fork locally:
```bash
git clone https://github.com/AtaCanYmc/RubberOtterWeb.git
cd RubberOtterWeb
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser. The app defaults to **Mock Hardware Simulator Mode** so you can immediately test all UI tabs, trackpad gestures, and packet logs without a physical HM-10 connected!

---

## 📝 Commit Conventions (Release Please Integration)

We enforce [Conventional Commits](https://www.conventionalcommits.org/) for automated changelog generation and Semantic Versioning via **Release Please**.

All commit messages and PR titles must follow this format:
```
<type>(<scope>): <short description>
```

### Allowed Types:
- `feat`: A new feature (bumps MINOR version)
- `fix`: A bug fix (bumps PATCH version)
- `docs`: Documentation changes
- `style`: Code style/formatting changes
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `ci`: Changes to CI/CD workflows or scripts
- `chore`: Maintenance tasks

### Examples:
- `feat(trackpad): add pinch-to-zoom gesture support`
- `fix(bluetooth): handle automatic reconnect retry timeout`
- `docs(readme): update wiring diagram for Arduino Pro Micro`

---

## 🧪 Verification & Building

Before submitting a Pull Request, make sure your code compiles cleanly without TypeScript errors:

```bash
# Type check & build Vite production bundle
npm run build
```

---

## 🔀 Pull Request Process

1. Create a descriptive feature branch: `git checkout -b feat/custom-gesture`
2. Make your changes adhering to TypeScript strict mode guidelines.
3. Commit your changes using Conventional Commit syntax.
4. Push to your fork and submit a Pull Request targeting the `main` branch.
5. Automated CI checks (`.github/workflows/ci.yml` & `.github/workflows/pr-title.yml`) will verify your code.
