# Contributing to BrainBerry

Welcome! We're thrilled that you're interested in contributing to **BrainBerry** — a voice-driven, interactive learning platform for children with special learning needs. Every contribution, whether it's fixing a typo or building a new learning module, makes a real difference.

Please take a moment to read through these guidelines before submitting your contribution.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Format](#commit-message-format)
- [Submitting Issues](#submitting-issues)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Code Review Process](#code-review-process)
- [Testing Requirements](#testing-requirements)

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally.
3. Create a new **branch** for your work (see [Branch Naming Conventions](#branch-naming-conventions)).
4. Make your changes and **commit** them (see [Commit Message Format](#commit-message-format)).
5. **Push** your branch to your fork.
6. Open a **Pull Request** against the `main` branch.

---

## Development Environment Setup

BrainBerry is a static web application served via Nginx. No build tools or bundlers are required for basic development.

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (for local development server)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Darshan7887/BrainBerry.git
cd BrainBerry

# Install dependencies (if any)
npm install

# Start the local development server
npm start
```

The application will be available at `http://localhost:3000` (or the port configured in your setup).

### Docker Setup (Optional)

```bash
# Build and run with Docker
docker build -t brainberry .
docker run -p 80:80 brainberry
```

---

## Code Style Guidelines

### HTML

- Use **semantic HTML5 elements** (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- Use descriptive `id` and `class` attributes.
- Include proper `alt` text on all images for accessibility.
- Maintain consistent indentation (2 spaces).

### JavaScript

- Use the **IIFE (Immediately Invoked Function Expression)** pattern to avoid polluting the global scope:
  ```javascript
  (function () {
    'use strict';
    // Module code here
  })();
  ```
- Use `'use strict';` at the top of every IIFE.
- Prefer `const` and `let` over `var`.
- Use descriptive variable and function names.
- Add JSDoc comments for public functions.
- Keep functions small and focused on a single responsibility.

### CSS

- Follow a **BEM-inspired** naming convention:
  ```css
  /* Block */
  .card { }

  /* Element */
  .card__title { }
  .card__body { }

  /* Modifier */
  .card--highlighted { }
  ```
- Use CSS custom properties (variables) for theming (colors, fonts, spacing).
- Avoid `!important` unless absolutely necessary.
- Use responsive design with mobile-first media queries.

### General

- No trailing whitespace.
- End files with a single newline.
- Use UTF-8 encoding for all files.

---

## Branch Naming Conventions

Use the following prefixes for branch names:

| Prefix       | Purpose                          | Example                          |
|------------- |--------------------------------- |--------------------------------- |
| `feature/`   | New feature or enhancement       | `feature/color-mixing-module`    |
| `fix/`       | Bug fix                          | `fix/audio-playback-safari`      |
| `docs/`      | Documentation changes            | `docs/update-readme`             |
| `refactor/`  | Code refactoring (no new features) | `refactor/modularize-firebase` |
| `hotfix/`    | Urgent production fix            | `hotfix/login-crash`             |
| `test/`      | Adding or updating tests         | `test/phonics-module`            |

**Rules:**
- Use lowercase letters.
- Separate words with hyphens (`-`).
- Keep names short but descriptive.

---

## Commit Message Format

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type         | Description                                |
|------------- |------------------------------------------- |
| `feat`       | A new feature                              |
| `fix`        | A bug fix                                  |
| `docs`       | Documentation changes                      |
| `style`      | Formatting, whitespace (no logic changes)  |
| `refactor`   | Code restructuring (no feature/fix)        |
| `perf`       | Performance improvements                   |
| `test`       | Adding or fixing tests                     |
| `chore`      | Build process, tooling, dependencies       |

### Examples

```
feat(phonics): add vowel recognition exercise

fix(auth): resolve Google sign-in redirect loop on mobile

docs(readme): add deployment instructions for Render

chore(ci): update Docker Hub push action to v3
```

---

## Submitting Issues

Before creating an issue, please search existing issues to avoid duplicates.

### Bug Reports

Use the **Bug Report** issue template. Include:
- A clear description of the bug.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Browser and device information.
- Screenshots or screen recordings if applicable.

### Feature Requests

Use the **Feature Request** issue template. Include:
- The problem you're trying to solve.
- Your proposed solution.
- Any alternatives you've considered.

---

## Submitting Pull Requests

1. Ensure your branch is up to date with `main`.
2. Fill out the **Pull Request template** completely.
3. Link any related issues using `Closes #<issue-number>`.
4. Ensure all checks pass before requesting review.
5. Keep pull requests focused — one feature or fix per PR.

### PR Checklist

- [ ] Code follows the project's style guidelines.
- [ ] Changes have been tested locally in at least two browsers.
- [ ] No breaking changes are introduced.
- [ ] Documentation has been updated if needed.
- [ ] Commit messages follow the conventional format.

---

## Code Review Process

1. All pull requests require at least **one approving review** before merging.
2. The primary maintainer (@Darshan7887) will review all PRs.
3. Reviewers may request changes — please address feedback promptly.
4. Once approved, the maintainer will merge the PR using **squash and merge**.
5. Please be respectful and constructive in all review discussions.

---

## Testing Requirements

- **Manual testing**: Test your changes in at least **two modern browsers** (Chrome and one other).
- **Mobile testing**: If your change affects the UI, test on a mobile device or using browser DevTools' responsive mode.
- **Accessibility**: Verify that interactive elements are keyboard-navigable and screen-reader friendly.
- **Voice interaction**: If modifying voice-driven features, test with the Web Speech API in a supported browser.
- **Parent PWA**: If modifying parental control features, test both the desktop and mobile PWA flows.

---

## Questions?

If you have questions about contributing, feel free to open a [Discussion](https://github.com/Darshan7887/BrainBerry/discussions) or reach out to the maintainers.

Thank you for helping make BrainBerry better for every child! 💜
