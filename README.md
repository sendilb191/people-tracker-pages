# People Tracker Pages

Landing pages and deep link handler for the People Tracker mobile app.

## Overview

People Tracker is a real-time location sharing app for friends and family. This repository contains the web pages used to:

- Showcase the app with a landing page
- Handle deep links to open the mobile app
- Provide APK download for Android users
- Host documentation for the mobile app

## Pages

| File         | Description                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `index.html` | Main landing page with app branding and description                                                                         |
| `docs.html`  | Full documentation rendered from the mobile app README                                                                      |
| `docs.md`    | Markdown source for documentation (synced from mobile app repo)                                                             |
| `open.html`  | Deep link handler - attempts to open the app via `peopletracker://` URL scheme, falls back to APK download if not installed |

## Deep Link Flow

When a user visits `open.html`:

1. The page attempts to open the app using the `peopletracker://open` URL scheme
2. If the app opens successfully, the user is redirected to the app
3. If the app is not installed (after 2.5s timeout), a fallback UI displays:
   - APK download button
   - Manual "Open App" button
   - Installation instructions

## Installation

1. Place the APK file in the `app/` directory as `people-tracker.apk`
2. Host the pages on any static web server

## URL Scheme

The app uses the custom URL scheme: `peopletracker://`

## Tech Stack

- Pure HTML/CSS/JavaScript
- No build tools or dependencies required
- Mobile-responsive design
