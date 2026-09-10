# BrainBerry — System Architecture

> Technical architecture of the BrainBerry voice-driven learning platform.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        UI["HTML/CSS/JS Pages"]
        Voice["Web Speech API"]
        Emotion["face-api.js"]
        Hands["MediaPipe Hands"]
        LS["localStorage"]
        SW["Service Worker"]
    end

    subgraph Firebase["Firebase Cloud"]
        Auth["Firebase Auth"]
        FS["Firestore"]
        FSUsers["users collection"]
        FSSync["bb_sync collection"]
        FSCodes["bb_connection_codes collection"]
    end

    subgraph Infra["Infrastructure"]
        Nginx["Nginx (Alpine)"]
        Docker["Docker Container"]
        GH["GitHub Actions CI/CD"]
        DH["Docker Hub"]
        Netlify["Netlify CDN"]
        Render["Render"]
    end

    UI --> Voice
    UI --> Emotion
    UI --> Hands
    UI --> LS
    UI --> Auth
    LS <-->|BB_Sync| FS
    Auth --> FSUsers
    FS --- FSUsers
    FS --- FSSync
    FS --- FSCodes
    SW --> UI
    Docker --> Nginx
    Nginx --> UI
    GH --> DH
    GH --> Docker
```

---

## Client-Side Architecture

BrainBerry is a **static web application** with no build step, no bundler, and no framework. Every page is a self-contained HTML file that loads its own CSS (inline or via `<link>`) and JavaScript (inline or via `<script>`).

### File Organisation

```
endevx/
├── index.html              # Login / landing page
├── register.html           # Multi-step registration
├── front.html              # Home dashboard (post-login)
├── Less.html               # Lessons hub
├── story.html              # Stories hub
├── chal.html               # Games hub
├── challen.html            # Challenges hub
├── parent.html             # Parent dashboard (desktop)
├── parent-app.html         # Parent PWA (desktop)
├── parent-mobile.html      # Parent PWA (mobile)
├── parent-download.html    # Parent app download page
│
├── assets/js/bb-user-data.js         # Per-user localStorage namespace utility
├── assets/js/parental-control.js     # Screen time + progress tracker
├── assets/js/profile-panel.js        # Slide-in profile sidebar with Firestore sync
├── assets/js/subscription.js         # Premium subscription gating (demo mode)
├── sw-parent.js            # Service worker for parent PWA
│
├── src/
│   └── js/
│       ├── assets/js/bb-sync.js      # Firebase Firestore real-time sync
│       └── bb-monitoring.js# Activity tracking and usage stats
│
├── config/
│   └── nginx.conf          # Nginx server configuration
│
├── assets/models/                 # ML model weight files (face-api.js)
├── assets/audio/                  # Audio assets (letter sounds, etc.)
│
├── Dockerfile              # Production Docker image (nginx:alpine)
├── docker-compose.yml      # Docker Compose for local run
├── package.json            # npm scripts (serve, docker)
├── netlify.toml            # Netlify deployment config
├── render.yaml             # Render deployment blueprint
└── .github/workflows/
    └── deploy.yml          # CI/CD pipeline
```

### Script Loading Order

Every learning page loads the core scripts in this order:

```
1. assets/js/bb-user-data.js          → Establishes per-user namespace
2. assets/js/parental-control.js      → Screen time tracking + BB_Progress API
3. assets/js/profile-panel.js         → Profile sidebar + Firestore user sync
4. assets/js/subscription.js          → Feature gating (on challenge/game pages)
5. assets/js/bb-monitoring.js  → Activity logging (auto page-view on load)
6. assets/js/bb-sync.js        → Real-time Firestore sync (dynamically loaded)
```

> [!IMPORTANT]
> `assets/js/bb-user-data.js` **must** be loaded before all other BrainBerry scripts. It establishes the `BB_UserData` namespace that all other modules depend on.

---

## Module Dependency Graph

```mermaid
graph LR
    BBUserData["BB_UserData<br/>(assets/js/bb-user-data.js)"]
    BBSync["BB_Sync<br/>(assets/js/bb-sync.js)"]
    BBMonitor["BB_Monitor<br/>(bb-monitoring.js)"]
    BBProgress["BB_Progress<br/>(assets/js/parental-control.js)"]
    BBScreenTime["BB_ScreenTime<br/>(assets/js/parental-control.js)"]
    BBSubscription["BB_Subscription<br/>(assets/js/subscription.js)"]
    ProfilePanel["Profile Panel<br/>(assets/js/profile-panel.js)"]
    ServiceWorker["Service Worker<br/>(sw-parent.js)"]

    BBUserData --> BBSync
    BBUserData --> BBMonitor
    BBUserData --> BBProgress
    BBUserData --> BBScreenTime
    BBUserData --> BBSubscription
    BBProgress --> BBSync
    BBScreenTime --> BBSync
    BBMonitor --> BBProgress
    ProfilePanel --> BBUserData
```

---

## Firebase Integration

### Firebase Configuration

BrainBerry uses a single Firebase project:

| Parameter | Value |
|-----------|-------|
| **Project ID** | `brainberry-96454` |
| **Auth Domain** | `brainberry-96454.firebaseapp.com` |
| **Firebase SDK Version** | `11.0.2` (BB_Sync), `9.22.2` (profile-panel fallback) |

### Authentication Providers

Firebase Auth is configured with four sign-in methods:

| Provider | Method |
|----------|--------|
| **Email/Password** | Native Firebase Auth |
| **Google** | OAuth 2.0 popup |
| **Facebook** | OAuth 2.0 popup |
| **Twitter** | OAuth 2.0 popup |

### Firestore Collections

```mermaid
erDiagram
    users {
        string uid PK
        string name
        string email
        string age
    }

    bb_sync {
        string sanitized_email PK
        string bb_parent_pin
        string bb_assigned_lessons
        string bb_screen_time_limit
        string bb_screen_time_elapsed
        string bb_progress
        string bb_connection_code
        string bb_todos
        string _email
        string _updatedAt
    }

    bb_connection_codes {
        string code PK
        string email
        string createdAt
    }

    users ||--o{ bb_sync : "linked by email"
    bb_sync ||--o| bb_connection_codes : "generates"
```

---

## Data Flow Architecture

### Local-First with Cloud Sync

BrainBerry uses a **local-first** architecture where localStorage is the primary data store and Firestore is the sync layer.

```mermaid
sequenceDiagram
    participant Child as Child's Browser
    participant LS as localStorage
    participant Sync as BB_Sync
    participant FS as Firestore
    participant Parent as Parent's Device

    Note over Child,Parent: Parent Sets Screen Time

    Parent->>FS: pushSettings() → bb_sync doc
    FS-->>Sync: onSnapshot (real-time)
    Sync->>LS: Write bb_screen_time_limit
    LS->>Child: Screen time HUD updates

    Note over Child,Parent: Child Completes a Lesson

    Child->>LS: BB_Progress.completeLesson()
    Child->>LS: BB_Monitor.logLessonComplete()
    LS->>Sync: pushSettings() (on save)
    Sync->>FS: Write to bb_sync doc
    FS-->>Parent: pullSettings() on next load
```

### localStorage Namespace Pattern

All user-scoped data follows the pattern:

```
bb_user:<email>:<key>
```

For example:
```
bb_user:alice@example.com:bb_parent_pin
bb_user:alice@example.com:bb_screen_time_limit
bb_user:alice@example.com:bb_progress
```

This ensures multiple child accounts on the same device each maintain their own isolated settings and progress data.

---

## Voice Recognition Pipeline

```mermaid
flowchart LR
    Mic["🎤 Microphone"] --> SpeechAPI["Web Speech API<br/>SpeechRecognition"]
    SpeechAPI --> Transcript["Transcript Text"]
    Transcript --> Matcher["Answer Matcher<br/>(per-module logic)"]
    Matcher -->|Correct| Feedback1["✅ Positive Feedback<br/>+ BB_Progress.recordCorrect()"]
    Matcher -->|Wrong| Feedback2["❌ Retry Prompt<br/>+ BB_Progress.recordWrong()"]
```

**Key details:**
- Uses `webkitSpeechRecognition` (Chrome) or `SpeechRecognition` (standard)
- Language is set per-module (`en-US` for English, `hi-IN` for Hindi)
- Continuous recognition mode is disabled to capture single utterances
- HTTPS is required for microphone access in production

---

## ML Pipeline — Emotion Detection

```mermaid
flowchart LR
    Camera["📷 Webcam"] --> FaceAPI["face-api.js"]
    FaceAPI --> Detection["Face Detection<br/>(TinyFaceDetector)"]
    Detection --> Expression["Expression Analysis"]
    Expression --> Emotions["Emotion Labels<br/>(happy, sad, angry,<br/>surprised, neutral,<br/>fearful, disgusted)"]
    Emotions --> UI["Emotion Display<br/>(emotion.html)"]
```

**Model files** are stored in the repository root and the `assets/models/` directory:
- `age_gender_model-shard1`
- `age_gender_model-weights_manifest.json`
- `mtcnn_model-shard1`
- `mtcnn_model-weights_manifest.json`
- Additional TinyFaceDetector and expression models in `assets/models/`

The main emotion detection UI is in `emotion.html`, which loads `face-api.js` (860 KB) and runs inference directly in the browser.

---

## ML Pipeline — Air Writing

```mermaid
flowchart LR
    Camera2["📷 Webcam"] --> MP["MediaPipe Hands"]
    MP --> Landmarks["Hand Landmarks<br/>(21 points)"]
    Landmarks --> IndexFinger["Index Finger Tip<br/>(landmark #8)"]
    IndexFinger --> Path["Finger Path<br/>Array"]
    Path --> Canvas["Trace Canvas<br/>(cyan glow trail)"]
```

**Implementation:** `assets/js/airwriting-opencv.js`
- Uses `@mediapipe/hands` from CDN
- Tracks the index finger tip (landmark 8) across frames
- Renders a glowing cyan trail on a 400×300 canvas
- Camera feed is mirrored on a separate canvas for visual feedback

---

## PWA Architecture (Parent App)

The parent mobile app (`parent-mobile.html`) is a Progressive Web App with:

### Web App Manifest (`manifest-parent.json`)

| Property | Value |
|----------|-------|
| `name` | BrainBerry Parent |
| `short_name` | BB Parent |
| `display` | standalone |
| `orientation` | portrait-primary |
| `theme_color` | #8b5cf6 |
| `background_color` | #0a021e |
| `start_url` | ./parent-mobile.html |

### Service Worker (`sw-parent.js`)

| Strategy | Scope |
|----------|-------|
| **Pre-cache** | `parent-mobile.html`, `manifest-parent.json`, `icon-192.png`, `icon-512.png` |
| **Cache-first** | Google Fonts, Firebase SDK CDN files |
| **Stale-while-revalidate** | All same-origin local files |
| **Network-only** | Firebase Auth API calls (`identitytoolkit`, `securetoken`, `firestore`) |

Cache name: `bb-parent-v1`

---

## Deployment Architecture

```mermaid
graph LR
    Dev["Developer"] -->|git push| GH["GitHub<br/>(main branch)"]
    GH -->|GitHub Actions| CI["CI Pipeline"]
    CI -->|docker build + test| Test["Health Check"]
    Test -->|pass| Push["Docker Hub<br/>darshan7887/brainberry"]

    Push -->|docker pull| Render["Render<br/>(Docker service)"]
    GH -->|auto deploy| Netlify["Netlify<br/>(static CDN)"]

    User["End User"] --> Netlify
    User --> Render
    User -->|self-hosted| DockerLocal["Docker<br/>localhost:8080"]
```

### Container Architecture

```
┌──────────────────────────────┐
│  Docker Container            │
│  ┌────────────────────────┐  │
│  │  nginx:alpine          │  │
│  │  Port 80               │  │
│  │  ┌──────────────────┐  │  │
│  │  │ /usr/share/nginx/ │  │  │
│  │  │ html/             │  │  │
│  │  │  ├── index.html   │  │  │
│  │  │  ├── front.html   │  │  │
│  │  │  ├── *.html       │  │  │
│  │  │  ├── *.js         │  │  │
│  │  │  ├── *.css        │  │  │
│  │  │  ├── *.mp4        │  │  │
│  │  │  └── assets/models/      │  │  │
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
│  Exposed: Port 80            │
│  Healthcheck: wget localhost │
└──────────────────────────────┘
```

### Nginx Configuration Highlights

| Feature | Configuration |
|---------|---------------|
| **Compression** | gzip level 6 for text, CSS, JS, JSON, SVG |
| **Media caching** | 30-day cache for mp4, png, jpg, mp3, fonts |
| **JS/CSS caching** | 7-day cache |
| **ML models** | 30-day cache + CORS headers (`Access-Control-Allow-Origin: *`) |
| **Security** | `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection` |
| **MIME types** | Custom block covering ML model shard files (`application/octet-stream`) |
| **Fallback** | `try_files $uri $uri/ /index.html` |
| **Hidden files** | Denied (`location ~ /\.`) |
