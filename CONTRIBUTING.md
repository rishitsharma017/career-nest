# Contributing to CareerNest

Thanks for your interest in improving CareerNest. Contributions of any size are welcome.

## Getting started

1. **Fork** this repository and clone your fork.
2. Install dependencies with `npm install`.
3. Start the backend with `npm run server` and the frontend with `npm run dev`. See the [README](README.md#getting-started) for details.
4. Create a branch for your change:
   ```bash
   git checkout -b feature/short-description
   ```

## Making changes

- Keep each pull request focused on one feature or fix.
- Follow the existing code style and folder layout. Pages go in `src/pages`, reusable UI in `src/components` and API calls in `src/services`.
- Run the checks before you push:
  ```bash
  npm run lint
  npm run build
  ```
- If you change sample jobs in `src/data/jobs.js`, run `node sync-db.mjs` to regenerate `db.json`.

## Commit messages

Use short, descriptive messages in the imperative mood, for example:

```
Add salary range filter to job search
Fix navbar overflow on small screens
```

## Opening a pull request

1. Push your branch to your fork.
2. Open a pull request against `main`.
3. Describe what changed and why. Add screenshots for UI changes.
4. CI must pass (lint and build) before the pull request is merged.

## Reporting bugs and requesting features

Open an [issue](https://github.com/rishitsharma017/career-nest/issues) and include:

- What you expected to happen
- What actually happened
- Steps to reproduce it, and screenshots if relevant

Once your pull request is merged, you'll appear in the README's **Contributors** section automatically.
