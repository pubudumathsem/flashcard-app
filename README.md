# Simple Flashcards

A lightweight flashcard CRUD and study application built with plain HTML, CSS, and JavaScript.

## Features

- Add flashcards
- Read and search saved flashcards
- Edit flashcards
- Delete flashcards with confirmation
- Filter by category
- Study mode with flip, previous, next, and shuffle controls
- Dark mode
- Browser localStorage persistence
- Responsive layout

## Run locally

No installation is required.

1. Download or clone this repository.
2. Open `index.html` in a browser.

For a local development server, if Python is installed:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Important data note

Flashcards are stored only in the current browser using `localStorage`. Clearing browser site data or using another browser/device will not preserve the cards.

## Project structure

```text
flashcard-app/
├── index.html
├── styles.css
├── app.js
├── README.md
└── .gitignore
```
