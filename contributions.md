# Contributing to ID8

This document provides a step-by-step guide for contributing to the project. It includes instructions for setting up your development environment, creating branches, and submitting pull requests.

## Table of Contents

- [Branch Naming Convention](#branch-naming-convention)
- [How to Contribute](#how-to-contribute)
  - [Step 1: Create a New Branch](#step-1-create-a-new-branch)
  - [Step 2: Develop Your Feature or Fix](#step-2-develop-your-feature-or-fix)
  - [Step 3: Sync with `main` Branch](#step-3-sync-with-main-branch)
  - [Step 4: Run Linting and Formatting](#step-4-run-linting-and-formatting)
  - [Step 5: Commit and Push Your Changes](#step-5-commit-and-push-your-changes)
  - [Step 6: Open a Pull Request](#step-6-open-a-pull-request)
- [Code Review Process](#code-review-process)
- [Best Practices](#best-practices)

## Branch Naming Convention

When starting a new branch, follow this naming convention:

`<your-username>/<feature-or-task>`

**Example:**

- pei/news-feed-page

## How to Contribute

### Step 1: Create a New Branch

To begin, create a new branch based on the `main` branch using the naming convention mentioned above.

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/ID8.git
   cd ID8.git
   ```
2. Switch to the `main` branch and pull the latest changes:
   ```bash
   git checkout main
   git pull origin main
   ```
3. Create a new branch for your work:
   ```bash
   git checkout -b <your-username>/<feature-or-task>
   ```

### Step 2: Develop Your Feature or Fix

With your new branch checked out, implement the changes or feature you're working on.

### Step 3: Sync with `main` Branch

Before pushing your changes, make sure your branch is synced with the most recent version of `main`:

```bash
git pull origin main
```

Resolve any conflicts that may arise during this process.

### Step 4: Run Linting and Formatting

To ensure code consistency, run the following commands before committing:

- `npm run lint` to catch any issues
- `npm run format` to fix formatting problems

### Step 5: Commit and Push Your Changes

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to ensure commit messages are clear and structured. Examples include:

- `feat: add new feature to news feed`
- `fix: correct typo in login page`

When your feature is ready and your branch is in sync, commit your changes with a descriptive message:

```bash
git add .
git commit -m "<type>: <description>"
```
Then push your branch to the remote repository:

`git push origin <your-username>/<feature-or-task>`

### Step 6: Open a Pull Request

After pushing your changes, create a pull request to merge them into the `main` branch.

1. Navigate to the repository on GitHub.
2. Click the "Compare & pull request" button.
3. Fill out the provided template to complete the PR.

## Code Review Process

After submitting a pull request, it will be reviewed by maintainers. At least one approval is required before merging. Be prepared to make any necessary changes based on the feedback. Once approved, you will be able to merge your branch into `main`.

## Best Practices

- **Use Clear Commit Messages**: Make sure each commit clearly explains the changes made.
- **Keep Your Branch Updated**: Regularly pull from `main` to reduce the chance of significant merge conflicts.

