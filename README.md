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
│   └── releases.js     # Releases page logic (Supabase storage)
├── debug/
│   └── test-upload.js  # Test script for Supabase upload
├── index.html          # Main landing page
├── docs.html           # Documentation page
├── docs.md             # Markdown source for documentation
├── open.html           # Deep link handler / download page
├── releases.html       # Release management page
├── .env.example        # Environment variables template
└── README.md
```

## Pages

| File            | Description                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `index.html`    | Main landing page with app branding and description                                                                         |
| `docs.html`     | Full documentation rendered from the mobile app README                                                                      |
| `docs.md`       | Markdown source for documentation (synced from mobile app repo)                                                             |
| `open.html`     | Deep link handler - attempts to open the app via `peopletracker://` URL scheme, falls back to APK download if not installed |
| `releases.html` | Displays APK releases and allows uploading new releases to Supabase Storage                                                 |

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

- View available APK releases from Supabase Storage
- Upload new APK releases (max 100MB, replaces previous version)

### Supabase Storage Setup

APK files are stored in Supabase Storage bucket: `people-tracker-app-apk`

**Configuration:**

1. Copy `.env.example` to `.env` and add your Supabase credentials
2. Ensure the storage bucket has public read/write policies

**Test upload functionality:**

```bash
npm install
node debug/test-upload.js
```

## URL Scheme

The app uses the custom URL scheme: `peopletracker://`

## Tech Stack

- Pure HTML/CSS/JavaScript
- CSS Variables for theming
- No build tools or dependencies required
- Mobile-responsive design
