# Contributing to Udhari

Thank you for considering contributing to udhari! This document provides guidelines and instructions to help you get started.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to foster an open and welcoming environment.

## How Can I Contribute?

### Reporting Bugs

- **Check existing issues** to see if someone has already reported the bug
- **Use the issue template** to provide all necessary information
- **Include screenshots** if applicable
- **Provide reproduction steps** with as much detail as possible

### Suggesting Features

- **Use the feature request template** for suggestions
- **Explain the use case** and how it would benefit users
- **Consider limitations** and potential implementation challenges

### Pull Requests

1. **Fork the repository**
2. **Create a branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for mobile development)

### Setting Up Your Development Environment

1. Clone your fork of the repository
```bash
git clone https://github.com/YOUR_USERNAME/udhari.git
cd udhari
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

### Mobile Development

To test the mobile app:

1. Build and sync with Capacitor
```bash
npm run build:mobile
```

2. Open in Android Studio
```bash
npm run open:android
```

## Project Structure

- `/app` - Next.js application code
  - `/components` - Reusable React components
  - `/store` - Zustand store and state management
- `/android` - Android platform-specific code
- `/assets` - Static assets and images
- `/public` - Public assets

## Coding Guidelines

### JavaScript/TypeScript

- Use TypeScript for all new code
- Follow the existing code style
- Add JSDoc comments for public APIs
- Use functional components with hooks

### CSS/Styling

- Use TailwindCSS classes when possible
- Extract common styles to component classes
- Keep styles close to their components

### Commit Messages

- Use conventional commit format (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, etc.)
- Keep messages clear and concise
- Reference issue numbers when applicable

## Testing

- Write tests for new features
- Run tests before submitting a PR
- Fix any failing tests before submission

## Documentation

- Update README.md if necessary
- Document new features or changes to existing functionality
- Comment complex code sections

## Questions?

If you have any questions, feel free to:
- Open an issue with the "question" label
- Contact the maintainers directly

Thank you for contributing to udhari!
