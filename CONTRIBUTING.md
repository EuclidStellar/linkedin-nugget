# Contributing to Thinking AI: LinkedIn Post Generator

We welcome contributions from the community! This document outlines how you can help improve the project.

## How to Contribute

1. **Fork the Repository**: Create a fork of the [main repository](https://github.com/euclidstellar/linkedin-nugget) on GitHub.
2. **Clone Your Fork**: 
   ```bash
   git clone https://github.com/euclidstellar/linkedin-nugget.git
   cd linkedin-nugget
   ```
3. **Create a Branch**: Make a new branch for your changes.
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Changes**: Implement your feature or fix. Ensure you follow the project's coding standards.
5. **Test Your Changes**: Run the development server and verify functionality.
   ```bash
   npm run dev
   ```
6. **Commit and Push**: Commit your changes with a clear message and push to your fork.
   ```bash
   git add .
   git commit -m "Add your descriptive commit message"
   git push origin feature/your-feature-name
   ```
7. **Submit a Pull Request**: Open a PR on the main repository with a detailed description of your changes.

## Development Setup

- **Prerequisites**: Node.js v18.18.0+, npm/yarn/pnpm.
- **Install Dependencies**: `npm install`
- **Environment Variables**: Add `GOOGLE_API_KEY` to `.env.local` (see README.md for details).
- **Run Locally**: `npm run dev`

## Code Guidelines

- Use TypeScript for type safety.
- Follow ESLint and Prettier configurations.
- Write clear, concise commit messages.
- Ensure all changes are tested and do not break existing functionality.

## Reporting Issues

- Use GitHub Issues to report bugs or suggest features.
- Provide detailed steps to reproduce bugs, including your environment (OS, Node version, etc.).

## Code of Conduct

We adhere to a code of conduct to ensure a welcoming environment. Be respectful, inclusive, and constructive in all interactions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing!
