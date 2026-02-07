# People Tracker Mobile

A React Native Android application for real-time location sharing. Users can see each other on a map and request instant location updates via push notifications. Built with React Native and Kotlin for native Android features.

## 🌍 Features

- **Google Sign-In** - Secure authentication with Google OAuth
- **On-Demand Location Sharing** - Share your location when requested via FCM push notification
- **Interactive Map** - View all users on an OpenStreetMap interface (via Leaflet in WebView)
- **Location Request System** - Request another user's live location via push notification
- **Activity History** - View sent/received location requests and their status
- **Works When App is Closed** - FCM wakes the app to respond to location requests
- **Live Updates** - Real-time location sync via Supabase Realtime
- **User List** - See all online users with "Request Location" button
- **Local GPS Tracking** - Track your position on the map when app is open

## 🛠️ Tech Stack

| Category           | Technology                        |
| ------------------ | --------------------------------- |
| Framework          | React Native 0.73                 |
| Language           | JavaScript + Kotlin               |
| Navigation         | React Navigation v7               |
| Database           | Supabase (PostgreSQL + Realtime)  |
| Push Notifications | Firebase Cloud Messaging (FCM)    |
| Maps               | Leaflet + OpenStreetMap (WebView) |
| Location           | Google Play Services Location     |
| On-Demand Service  | Native Kotlin Foreground Service  |
| Storage            | SharedPreferences (credentials)   |
| Auth               | Google Sign-In                    |
| Icons              | React Native Vector Icons         |

## 📁 Project Structure

```
people-tracker-app-mobile/
├── src/
│   ├── assets/
│   │   └── google-logo.png              # Local assets
│   ├── screens/
│   │   ├── LoginScreen.js               # Google Sign-In
│   │   ├── LoginScreen.styles.js
│   │   ├── TrackerScreen.js             # Main map view
│   │   ├── TrackerScreen.styles.js
│   │   ├── UsersScreen.js               # Online users list + request button
│   │   ├── UsersScreen.styles.js
│   │   ├── ProfileScreen.js             # Profile, permissions, API & battery stats
│   │   ├── ProfileScreen.styles.js
│   │   ├── ActivityScreen.js            # Location request history
│   │   └── ActivityScreen.styles.js
│   ├── hooks/
│   │   ├── useAllLocations.js           # Fetch all user locations
│   │   └── useLocationPermissions.js    # Permission management
│   ├── context/
│   │   └── UserContext.js               # User auth context
│   ├── lib/
│   │   └── supabase.js                  # Supabase client
│   └── services/
│       ├── CredentialsService.js        # JS wrapper for SharedPreferences
│       ├── FCMService.js                # Firebase Cloud Messaging service
│       └── GoogleAuthService.js         # Google Sign-In service
├── android/
│   └── app/src/main/java/com/peopletrackermobile/
│       ├── location/
│       │   └── SupabaseClient.kt             # Native Supabase HTTP client
│       ├── credentials/
│       │   ├── CredentialsModule.kt          # SharedPreferences bridge
│       │   └── CredentialsPackage.kt         # Package registration
│       └── firebase/
│           ├── LocationRequestMessagingService.kt  # FCM handler
│           └── LocationRequestService.kt          # On-demand location service
├── supabase/
│   └── functions/
│       └── send-location-request-notification/  # Edge function to send FCM
└── App.jsx                              # Main app with navigation
```

## ⚡ How Location Sharing Works

The app uses **on-demand location requests** rather than continuous background tracking:

### Location Request Flow

```
┌──────────────────────────────────────────────────────────────┐
│ User A wants to see User B's current location                │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  User A taps        │
                 │  "Request Location" │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Supabase creates   │
                 │  location_request   │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Edge Function      │
                 │  sends FCM push     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  User B's phone     │
                 │  wakes up (even if  │
                 │  app is closed)     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  LocationRequest    │
                 │  Service starts     │
                 │  (foreground)       │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Get GPS location   │
                 │  (30s timeout)      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Upload to Supabase │
                 │  Update request     │
                 │  status: fulfilled  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  User A sees        │
                 │  User B's location  │
                 │  on map             │
                 └─────────────────────┘
```

### App States

| State             | GPS Tracking                   | Location Sharing         |
| ----------------- | ------------------------------ | ------------------------ |
| App Active        | Local tracking for map display | None (on-demand only)    |
| App in Background | None                           | Responds to FCM requests |
| App Killed        | None                           | FCM wakes app to respond |

### Key Features

- **No continuous tracking** - No battery drain from constant GPS polling
- **Privacy-first** - Share location only when you receive a request
- **Works when closed** - FCM high-priority messages wake the app
- **Fast response** - Gets GPS and uploads in ~5-30 seconds
- **Reliable** - Uses wake locks to ensure completion even on battery-optimized devices

## 📲 Location Request System

Users can request another user's live location via push notification:

### How It Works

```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  User A      │    │  Supabase   │    │    FCM       │    │   User B     │
│  (Requester) │    │             │    │              │    │   (Target)   │
└──────┬───────┘    └──────┬──────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                  │                   │
       │ 1. Request        │                  │                   │
       │   location        │                  │                   │
       │──────────────────►│                  │                   │
       │                   │                  │                   │
       │                   │ 2. Trigger       │                   │
       │                   │   Edge Function  │                   │
       │                   │─────────────────►│                   │
       │                   │                  │                   │
       │                   │                  │ 3. Send FCM       │
       │                   │                  │   data message    │
       │                   │                  │──────────────────►│
       │                   │                  │                   │
       │                   │                  │      4. Wake up   │
       │                   │                  │      Get GPS      │
       │                   │                  │      Upload to DB │
       │                   │◄─────────────────────────────────────│
       │                   │                  │                   │
       │ 5. Realtime       │                  │                   │
       │   update          │                  │                   │
       │◄──────────────────│                  │                   │
       │                   │                  │                   │
```

### Key Features

- Works even when target app is killed (FCM data message wakes the app)
- Uses wake lock to ensure GPS acquisition completes
- Updates request status (pending → fulfilled/failed)
- Activity screen shows request history with status

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- Android Studio with SDK 34+
- Android Emulator or physical device
- Supabase account and project
- Google Cloud Console project (for Google Sign-In)
- Firebase project (for FCM push notifications)

### Installation

1. **Install dependencies:**

   ```bash
   cd people-tracker-app-mobile
   npm install
   ```

2. **Configure Supabase:**

   Edit `src/lib/supabase.js` with your credentials:

   ```javascript
   const SUPABASE_URL = "your-supabase-url";
   const SUPABASE_ANON_KEY = "your-supabase-anon-key";
   ```

3. **Configure Google Sign-In:**

   - Create a project in Google Cloud Console
   - Enable Google Sign-In API
   - Create OAuth 2.0 credentials (Android)
   - Add your SHA-1 fingerprint
   - Update `android/app/build.gradle` with your Web Client ID

4. **Configure Firebase (for location requests):**

   - Create a Firebase project
   - Add Android app with your package name
   - Download `google-services.json` to `android/app/`
   - See [docs/FCM_SETUP.md](docs/FCM_SETUP.md) for detailed instructions

5. **Run on Android:**
   ```bash
   npm run android
   ```

## 📱 Android Permissions

The app requires the following permissions:

| Permission                    | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| `ACCESS_FINE_LOCATION`        | Precise GPS location                      |
| `ACCESS_COARSE_LOCATION`      | Network-based location                    |
| `ACCESS_BACKGROUND_LOCATION`  | Location access when app is closed        |
| `FOREGROUND_SERVICE`          | Show notification during location request |
| `FOREGROUND_SERVICE_LOCATION` | Location-type foreground service          |
| `WAKE_LOCK`                   | Keep CPU awake during GPS acquisition     |
| `INTERNET`                    | Supabase and FCM communication            |

## 🔋 Battery Impact

The app has minimal battery impact since there is no continuous tracking:

- **App open**: Uses GPS only for map display (same as Google Maps)
- **App closed**: Zero battery usage unless someone requests your location
- **During location request**: ~5-30 seconds of GPS usage per request

## 🗄️ Database Schema

The app uses a single `users` table in Supabase:

```sql
-- Users table (stores user info + location + FCM token)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  photo_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_online BOOLEAN DEFAULT false,
  fcm_token TEXT,                    -- For push notifications
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location requests table (for tracking request history)
CREATE TABLE location_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  target_email TEXT NOT NULL,
  target_name TEXT,
  status TEXT DEFAULT 'pending',     -- pending, fulfilled, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fulfilled_at TIMESTAMP WITH TIME ZONE
);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE location_requests;
```

See `scripts/` folder for additional SQL setup scripts.

## 📝 Scripts

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `npm start`           | Start Metro bundler               |
| `npm run android`     | Build and run on Android          |
| `npm run lint`        | Run ESLint for JavaScript         |
| `npm run lint:fix`    | Fix ESLint issues                 |
| `npm run lint:kotlin` | Check Kotlin code via Gradle      |
| `npm run lint:all`    | Run all linters (ESLint + Kotlin) |
| `npm run format`      | Format code with Prettier         |
| `npm run validate`    | Run lint + bundle check           |

### Gradle Commands (Android)

```bash
cd android

# Code formatting
./gradlew spotlessCheck      # Check Kotlin formatting (ktlint)
./gradlew spotlessApply      # Auto-fix Kotlin formatting

# Static analysis
./gradlew detekt             # Run Detekt static analysis

# Dependency analysis
./gradlew buildHealth        # Find unused/misused dependencies
./gradlew :app:reason --id com.example:library  # Why is a dependency used
```

## 🔧 Code Quality Tools

### JavaScript/React Native

| Tool     | Purpose                     | Config File        |
| -------- | --------------------------- | ------------------ |
| ESLint   | Linting and code quality    | `eslint.config.js` |
| Prettier | Code formatting             | `.prettierrc`      |
| Knip     | Unused exports/dependencies | `knip.json`        |

### Kotlin/Android

| Tool                | Purpose                       | Config Location                    |
| ------------------- | ----------------------------- | ---------------------------------- |
| Spotless (ktlint)   | Kotlin code formatting        | `android/app/build.gradle`         |
| Detekt              | Static analysis + unused code | `android/config/detekt/detekt.yml` |
| Dependency Analysis | Unused library detection      | `android/build.gradle`             |

### Detekt Unused Code Rules

The Detekt configuration includes comprehensive unused code detection:

- `UnusedPrivateMember` - Unused private functions and properties
- `UnusedPrivateClass` - Unused private classes
- `UnusedPrivateProperty` - Unused private properties
- `UnusedParameter` - Unused function parameters (prefix with `_` to ignore)
- `UnusedImports` - Unused import statements
- `UselessCallOnNotNull` - Useless safe calls on non-null types

### Dependency Analysis Plugin

Detects unused or incorrectly configured Gradle dependencies:

```bash
cd android
./gradlew buildHealth
# Report: android/build/reports/dependency-analysis/build-health-report.txt
```

## 🔄 GitHub Actions CI

The project uses GitHub Actions for continuous integration:

### Workflows

| Workflow      | File                                | Triggers                    |
| ------------- | ----------------------------------- | --------------------------- |
| Android Build | `.github/workflows/android.yml`     | Push/PR to main, dev        |
| Kotlin Lint   | `.github/workflows/kotlin-lint.yml` | Push/PR with Kotlin changes |

### Kotlin Lint Workflow

Runs on changes to `android/**/*.kt` files:

1. **Spotless Check** - Kotlin formatting (ktlint)
2. **Detekt** - Static analysis with unused code detection
3. **Compile Check** - Verify Kotlin compiles
4. **Dependency Analysis** - Find unused libraries

Reports are uploaded as artifacts for review.

## 📂 Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        PEOPLE TRACKER APP                        │
├─────────────────────────────────────────────────────────────────┤
│   ┌──────────────────┐         ┌──────────────────────────┐     │
│   │   JS Layer       │◄───────►│    Kotlin Layer          │     │
│   │   (React Native) │  bridge │    (Native Android)      │     │
│   │                  │         │                          │     │
│   │  UserContext.js  │         │  LocationRequestService.kt     │
│   │  FCMService.js   │         │  - On-demand Service     │     │
│   │  - UI display    │         │  - GPS on request        │     │
│   │  - Credentials   │         │  - Single upload         │     │
│   │    via bridge    │         │  - Then stops            │     │
│   └────────┬─────────┘         └────────────┬─────────────┘     │
│            │                                │                    │
│            │     ┌──────────────────────┐   │                    │
│            └────►│  SharedPreferences   │◄──┘                    │
│                  │  (Single Source of   │                        │
│                  │   Truth for all data)│                        │
│                  └──────────┬───────────┘                        │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   SUPABASE    │    │   FIREBASE    │    │   SUPABASE    │
│   Database    │    │     FCM       │    │ Edge Function │
│ (users table) │    │ (push notif)  │    │(send FCM msg) │
└───────────────┘    └───────────────┘    └───────────────┘
```

### SharedPreferences Data

| Category            | Keys                                        |
| ------------------- | ------------------------------------------- |
| User Data           | `user_email`, `user_name`, `user_photo_url` |
| Service Credentials | `supabase_url`, `supabase_key`              |
| FCM                 | `fcm_token`                                 |

## 📋 Recent Updates (February 2026)

### Code Quality Enhancements

1. **Enhanced Detekt Unused Code Detection** - Added comprehensive rules for finding unused Kotlin code:

   - `UnusedPrivateClass`, `UnusedPrivateProperty`, `UnusedParameter`
   - `UnusedImports`, `UselessCallOnNotNull`
   - `UseCheckOrError`, `UseRequire` for idiomatic Kotlin

2. **Dependency Analysis Plugin** - Added Gradle plugin to detect unused libraries:

   - Run `./gradlew buildHealth` in android folder
   - Integrated into GitHub Actions CI pipeline
   - Reports uploaded as artifacts

3. **Updated GitHub Actions** - Added dependency analysis step to kotlin-lint workflow

### About Screen & Sharing

- Added About screen with app info, features, and tech stack
- WhatsApp invite button with download link
- Share button with app deep links
- Permissions blocker screen for required permissions

### Key Files Changed

- `android/config/detekt/detekt.yml` - Enhanced unused code rules
- `android/build.gradle` - Added dependency-analysis-gradle-plugin
- `.github/workflows/kotlin-lint.yml` - Added dependency analysis CI step
- `src/screens/AboutScreen.js` - New About screen

## 📝 Recent Updates (January 2026)

### Background Location Fix

Fixed critical issues preventing background location from working:

1. **FCM Service Registration** - Added `LocationRequestMessagingService` to `AndroidManifest.xml`:

   ```xml
   <service
       android:name=".firebase.LocationRequestMessagingService"
       android:exported="false">
       <intent-filter>
           <action android:name="com.google.firebase.MESSAGING_EVENT" />
       </intent-filter>
   </service>
   ```

2. **Supabase Upsert Fix** - Added `?on_conflict=email` query parameter to enable proper upsert behavior in Kotlin's `SupabaseClient.kt`

3. **Database Schema Update** - Added new columns for device tracking:

   ```sql
   ALTER TABLE users
   ADD COLUMN IF NOT EXISTS android_version integer,
   ADD COLUMN IF NOT EXISTS device_model text,
   ADD COLUMN IF NOT EXISTS kotlin_api_calls bigint DEFAULT 0,
   ADD COLUMN IF NOT EXISTS js_api_calls bigint DEFAULT 0,
   ADD COLUMN IF NOT EXISTS foreground_location_enabled boolean DEFAULT false,
   ADD COLUMN IF NOT EXISTS background_location_enabled boolean DEFAULT false,
   ADD COLUMN IF NOT EXISTS battery_optimization_disabled boolean DEFAULT false;
   ```

4. **Notification Permission (Android 13+)** - Added `POST_NOTIFICATIONS` permission to manifest and permission request on app load

5. **Debug Logging** - Added comprehensive debug logging to Kotlin services with logs viewable in Profile screen

### Tested Scenarios

| Scenario                     | Status     |
| ---------------------------- | ---------- |
| App in foreground            | ✅ Working |
| App in background            | ✅ Working |
| Screen locked                | ✅ Working |
| Battery optimization enabled | ✅ Working |

### Key Files Changed

- `android/app/src/main/AndroidManifest.xml` - FCM service registration, POST_NOTIFICATIONS permission
- `android/.../location/SupabaseClient.kt` - Fixed upsert URL with on_conflict param
- `android/.../firebase/LocationRequestMessagingService.kt` - FCM handler with debug logging
- `android/.../firebase/LocationRequestService.kt` - Foreground service with detailed logging
- `src/screens/ProfileScreen.js` - Added FCM debug logs section with Copy/Clear buttons
- `src/hooks/useLocationPermissions.js` - Added notification permission handling

## 📄 License

MIT
