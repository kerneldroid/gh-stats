# GitHub Release Stats

A modern, responsive, and dynamic web application to inspect and analyze release download statistics for any public GitHub repository.

## Features

- **Total & Detailed Download Metrics:** Track download counts across all repository releases and individual assets.
- **Interactive Chronological History Chart:** Interactive SVG chart plotting download counts over time, complete with hover tooltips showing version tags and dates.
- **Dynamic Monet Theming:** Automatically extracts the dominant color from the repository owner's GitHub avatar and applies a smooth Material 3 dynamic color scheme across the entire UI.
- **Responsive Adaptive Layout:** Designed for both mobile and desktop screen sizes, with a compact bottom navigation dockbar on mobile devices.
- **Adaptive SVG Branding:** Custom logo that automatically inherits and adapts to active theme colors.
- **Automated Pages Deployment:** Powered by GitHub Actions for continuous delivery to GitHub Pages.

## Tech Stack

- **Framework:** Svelte 5 (Runes)
- **Styling & UI Components:** Material 3 Svelte (`m3-svelte`)
- **Build Tool:** Vite

## Getting Started

### Installation

Clone the repository and install the dependencies:

```bash
npm install --legacy-peer-deps
```

### Development Server

Start the local development server:

```bash
npm run dev
```

### Production Build

Compile and optimize the project for production:

```bash
npm run build
```
