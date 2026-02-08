# People Tracker Pages

Landing pages and deep link handler for the People Tracker mobile app.

**Live Site:** https://sendilb191.github.io/people-tracker-pages/

## Overview

People Tracker is a real-time location sharing app for friends and family. This repository contains the web pages used to:

- Showcase the app with a landing page
- Handle deep links to open the mobile app
- Provide APK download for Android users
- Host documentation for the mobile app
- Manage and upload releases

## Project Structure

```
people-tracker-pages/
├── css/
│   ├── common.css      # Shared styles (variables, base, header, buttons, forms)
│   ├── home.css        # Home page specific styles
│   ├── docs.css        # Documentation page styles
│   ├── open.css        # Download/open page styles
│   └── releases.css    # Releases page styles
├── js/
│   ├── docs.js         # Documentation page logic
│   ├── open.js         # Deep link handling logic
│   └── releases.js     # Releases page logic (fetch & upload)
├── index.html          # Main landing page
├── docs.html           # Documentation page
├── docs.md             # Markdown source for documentation
├── open.html           # Deep link handler / download page
├── releases.html       # Release management page
└── README.md
```

## Pages

| File            | Description                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `index.html`    | Main landing page with app branding and description                                                                         |
| `docs.html`     | Full documentation rendered from the mobile app README                                                                      |
| `docs.md`       | Markdown source for documentation (synced from mobile app repo)                                                             |
| `open.html`     | Deep link handler - attempts to open the app via `peopletracker://` URL scheme, falls back to APK download if not installed |
| `releases.html` | Displays APK releases and allows uploading new releases to GitHub                                                           |

## Deep Link Flow

When a user visits `open.html`:

1. The page attempts to open the app using the `peopletracker://open` URL scheme
2. If the app opens successfully, the user is redirected to the app
3. If the app is not installed (after 2.5s timeout), a fallback UI displays:
   - APK download button
   - Manual "Open App" button
   - Installation instructions

## Releases

The `releases.html` page allows you to:

- View all GitHub releases with APK download links
- Upload new releases directly from the browser (requires GitHub PAT with `repo` scope)

## URL Scheme

The app uses the custom URL scheme: `peopletracker://`

## Tech Stack

- Pure HTML/CSS/JavaScript
- CSS Variables for theming
- No build tools or dependencies required
- Mobile-responsive design
