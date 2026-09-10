# Changelog

All notable changes to BrainBerry are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- 🌐 Multi-language support — Marathi, Tamil, Bengali
- 📊 AI-powered personalized learning paths
- 🏆 Achievement system — badges, streaks, leaderboards
- 📱 React Native mobile app (iOS & Android)
- 🔊 Advanced voice AI with real-time pronunciation scoring
- 🧠 ML-based adaptive difficulty adjustment
- 👥 Teacher dashboard for classroom management
- 📝 Downloadable PDF progress reports for parents

---

## [1.0.0] — 2025-09-14

### 🎉 Initial Release

BrainBerry v1.0.0 — the first public release of a voice-driven, inclusive learning platform built for children with Specific Learning Difficulties (SLDs).

### Added

#### 🔐 Authentication
- Email/password registration and login
- Social login via **Google**, **Facebook**, and **Twitter** (OAuth 2.0)
- Auto-prompt for password setup when using social sign-in for the first time
- Secure session management via Firebase Authentication

#### 📚 Learning Modules
- **Phonics (Say & Repeat)** — Voice-based alphabet learning with Web Speech API recognition and Levenshtein distance fuzzy matching
- **Animals** — Interactive animal identification with sounds and video clips
- **Hindi Language Hub** — Hindi Swar (vowels) and Vyanjan (consonants) learning modules
- **Colors & Shapes** — Color identification and shape recognition with audio cues
- **Colour Mixing** — Interactive colour mixing experiment
- **Civic Sense** — Real-world civic responsibility scenarios
- **Counting & Numbers** — Number recognition with voice practice
- **Syllabus Words** — Vocabulary building with pronunciation practice
- **Golden Words & Sentences** — Core vocabulary with voice guidance

#### 📖 Interactive Stories
- 🦊 The Fox and the Grapes
- 🦁 The Lion and the Mouse
- 🐦 The Clever Crow

#### 🎮 Educational Games
- **Tetris** — Spatial reasoning and pattern recognition
- **Simon Says** — Memory and sequence recall
- **Memory Match** — Visual memory training
- **River Crossing** — Logic and problem-solving puzzle
- **Fill-in-the-Blanks (FIBC)** — Vocabulary and comprehension
- **Air Writing** — Fine motor skills via webcam hand tracking with MediaPipe Hands

#### 👨‍👩‍👧 Parental Controls
- PIN-protected parental dashboard
- Screen time limits with auto-lock overlay
- Lesson assignment system — lock/unlock specific modules
- Learning progress tracking (correct answers, wrong answers, completion)
- Connection code system for parent ↔ child device linking via Firestore
- Shared parent-assigned to-do list with completion tracking

#### 📱 Parent Applications (PWA)
- **Desktop Dashboard** (`parent-app.html`) — Full-featured parental control panel
- **Mobile App** (`parent-mobile.html`) — Mobile-optimized PWA with install shortcut
- **Download Page** (`parent-download.html`) — PWA installation guide
- Service Worker for offline support and installability

#### 🤖 AI & ML Features
- **Emotion Detection** — Real-time facial expression analysis via face-api.js (MTCNN + age/gender models)
- **Air Writing** — Webcam-based hand tracking with MediaPipe Hands
- **Voice Recognition** — Web Speech API with Levenshtein distance fuzzy matching for pronunciation feedback

#### 🔄 Data Sync Architecture
- **BB_UserData** — Per-user localStorage namespace (`bb_user:<email>:<key>`)
- **BB_Sync** — Firebase Firestore real-time sync engine (push/pull/`onSnapshot`)
- **BB_Monitor** — Activity tracking module (page views, lesson starts/completions, sessions)
- Local-first architecture: data saved instantly to localStorage, synced to cloud when online
- Real-time cross-device sync via Firestore `onSnapshot` — parent settings update child device instantly

#### ⚙️ Infrastructure
- **Docker** — Production image via `nginx:alpine` with health checks
- **docker-compose.yml** — One-command local deployment
- **GitHub Actions CI/CD** — Automated build → Docker health check → push to Docker Hub
- **Netlify** deployment with SPA routing, security headers, and asset caching
- **Render** deployment blueprint (`render.yaml`)
- **Nginx** configuration with gzip, caching, and MIME type support

#### 📁 Repository Structure
- Centralized Firebase config (`config/firebase-config.js`)
- Firestore Security Rules (`config/firestore.rules`)
- Nginx server configuration (`config/nginx.conf`)
- Complete documentation suite (`docs/`)
- GitHub repository files: `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `.env.example`

---

## Links

- [GitHub Repository](https://github.com/Darshan7887/brainberry)
- [Docker Hub](https://hub.docker.com/r/darshan7887/brainberry)
- [Unreleased]: https://github.com/Darshan7887/brainberry/compare/v1.0.0...HEAD
- [1.0.0]: https://github.com/Darshan7887/brainberry/releases/tag/v1.0.0
