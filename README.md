# Car Race Game

A simple, dependency-free car dodging game that runs in your browser and deploys via GitHub Pages.

## Play
- Move left/right and avoid other cars. Your score increases for every car you pass.
- Desktop: Arrow Left/Right or A/D to move, Space to start/restart, P to pause.
- Mobile: Tap left/right side of the canvas or use the bottom buttons.

## Tech
- HTML5 Canvas, plain CSS and JavaScript
- No external build tools or dependencies
- HiDPI rendering support (Retina-friendly)

## Local run
Open index.html in any modern browser. No server is required.

## Deploy (GitHub Pages)
This repository includes a workflow at .github/workflows/pages.yml that deploys the site on every push to main.
After the first successful run, your site will be available at GitHub Pages URL shown in the workflow run summary.

## Files
- index.html – Page shell
- styles.css – Styles
- main.js – Game logic
- .github/workflows/pages.yml – GitHub Pages deployment