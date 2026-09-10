# 🧪 BrainBerry — Testing Guide

> How to test, verify, and validate the BrainBerry learning platform.

---

## Table of Contents

- [CI/CD Pipeline](#cicd-pipeline)
- [Local Testing with Docker](#local-testing-with-docker)
- [Local Development Testing](#local-development-testing)
- [Manual QA Checklist](#manual-qa-checklist)
- [Browser Compatibility](#browser-compatibility)
- [Firebase Integration Testing](#firebase-integration-testing)

---

## CI/CD Pipeline

BrainBerry uses **GitHub Actions** for continuous integration. The pipeline is defined in `.github/workflows/deploy.yml`.

### Pipeline Steps

| Step | Description | Trigger |
|------|-------------|---------|
| **1. Checkout** | Pulls the latest code from the repository | All triggers |
| **2. Build Docker Image** | Builds `brainberry:latest` using the Dockerfile | All triggers |
| **3. Start Container** | Runs the container on port 8080, waits 5 seconds for Nginx | All triggers |
| **4. Health Check** | Verifies `index.html` returns HTTP 200 | All triggers |
| **5. Page Verification** | Checks 9 key pages return HTTP 200 | All triggers |
| **6. Asset Verification** | Validates CSS/JS files load correctly | All triggers |
| **7. Container Logs** | Outputs Nginx logs for debugging (runs on failure too) | All triggers |
| **8. Cleanup** | Stops and removes the test container | All triggers |
| **9. Docker Hub Login** | Authenticates with Docker Hub using secrets | Push to `main` only |
| **10. Build & Push** | Pushes image to `darshan7887/brainberry:latest` | Push to `main` only |

### Triggers

- **Push to `main` branch** → Full pipeline (build + test + Docker Hub push)
- **Pull Request to `main`** → Build + test only (no push)

### Pages Verified by CI

```
index.html (landing page)
front.html (home dashboard)
Less.html (lessons grid)
parent.html (parental dashboard)
parent-app.html (parent desktop PWA)
phonics.html (phonics module)
animals.html (animals module)
hindi.html (Hindi module)
help.html (help page)
rewards.html (rewards page)
```

### Assets Verified by CI

```
assets/css/style.css (main stylesheet)
assets/js/bb-user-data.js (user data module)
assets/js/profile-panel.js (profile sidebar)
assets/js/parental-control.js (screen time engine)
```

---

## Local Testing with Docker

### Quick Test

```bash
# Build the image
docker build -t brainberry:test .

# Run the container
docker run -d --name bb-test -p 8080:80 brainberry:test

# Wait for Nginx to start
sleep 3

# Health check
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/
# Expected: 200

# Test key pages
for page in front.html Less.html parent.html phonics.html animals.html; do
  echo "$page → $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/$page)"
done

# View Nginx logs
docker logs bb-test

# Cleanup
docker stop bb-test && docker rm bb-test
```

### Using Docker Compose

```bash
docker compose up -d
# Visit http://localhost:8080
docker compose logs -f
docker compose down
```

---

## Local Development Testing

### Start the Dev Server

```bash
npm start
# Server runs at http://localhost:3000
```

### Verify Core Functionality

1. **Open** `http://localhost:3000` — Login page should render
2. **Check console** — No JavaScript errors should appear
3. **Navigate** to `front.html` — Home dashboard with lessons, to-do list
4. **Open** `Less.html` — Lessons grid with all module cards
5. **Open** `parent.html` — Parental dashboard (prompts for PIN)

---

## Manual QA Checklist

### Authentication Flow

- [ ] Registration form works (`register.html`)
- [ ] Email/password login works (`index.html`)
- [ ] Google OAuth login opens popup
- [ ] Facebook OAuth login opens popup
- [ ] Twitter OAuth login opens popup
- [ ] Login redirects to `front.html`
- [ ] User name/email stored in localStorage
- [ ] Profile sidebar shows user info

### Learning Modules

| Module | Page | Test |
|--------|------|------|
| **Phonics** | `phonics.html` | Letters display, audio plays, voice recognition works |
| **Animals** | `animals.html` | Animal cards display, sounds play, videos load |
| **Hindi Swar** | `hindi_swar.html` | Hindi vowels display with pronunciation |
| **Hindi Vyanjan** | `hindi_vyanjan.html` | Hindi consonants display with pronunciation |
| **Colors** | `color.html` | Color swatches display, audio plays |
| **Shapes** | `shapes.html` | Shape cards display, audio plays |
| **Color Mixing** | `colour-mixing.html` | Interactive mixing experiment works |
| **Civic Sense** | `civicsense.html` | Scenario cards display, voice works |
| **Counting** | `counting.html` | Number display, voice recognition works |
| **Syllabus Words** | `syllabuswords.html` | Word cards display with pronunciation |
| **Say & Repeat** | `l1/index.html` | Letter/word display, play/listen/next buttons work |

### Games

| Game | Page | Test |
|------|------|------|
| **Tetris** | `tetris.html` | Game starts, pieces fall, controls work |
| **Simon Says** | `simongbg.html` | Pattern plays, input accepted |
| **Memory Match** | `memory.html` | Cards flip, matches detected |
| **River Crossing** | `river.html` | Puzzle logic works, game completable |
| **Fill-in-the-Blanks** | `fibc.html` | Questions display, answers validated |
| **Air Writing** | `airwriting.html` | Webcam access, hand tracking |
| **Emotion Detection** | `emotion.html` | Webcam access, face detection overlay |

### Parental Controls

- [ ] Parent dashboard (`parent.html`) requires PIN
- [ ] Screen time limit can be set
- [ ] Screen time lock overlay appears when limit reached
- [ ] Lesson lock/unlock works from parent dashboard
- [ ] Locked lessons show lock overlay on `front.html`
- [ ] Connection code generation works
- [ ] Connection code validation works
- [ ] Real-time sync updates settings across devices

### Parent PWA

- [ ] `parent-mobile.html` loads on mobile browser
- [ ] PWA install prompt appears
- [ ] Service worker caches pages for offline use
- [ ] `parent-app.html` loads on desktop
- [ ] `parent-download.html` shows installation instructions

### Stories

- [ ] `clever-crow.html` — Story loads with narration
- [ ] `lion-mouse.html` — Story loads with narration
- [ ] `fox.html` — Story loads with narration

---

## Browser Compatibility

| Browser | Voice Recognition | Voice Synthesis | Webcam/ML | Status |
|---------|-------------------|-----------------|-----------|--------|
| **Chrome 80+** | ✅ Full support | ✅ Full support | ✅ Full support | **Recommended** |
| **Edge 80+** | ✅ Full support | ✅ Full support | ✅ Full support | Supported |
| **Firefox 70+** | ❌ No support | ✅ Full support | ✅ Full support | Partial |
| **Safari 14+** | ⚠️ Limited | ✅ Full support | ⚠️ Limited | Partial |
| **Mobile Chrome** | ✅ Full support | ✅ Full support | ✅ Full support | Supported |

> **Note**: Chrome is strongly recommended for the full BrainBerry experience due to its comprehensive Web Speech API support.

---

## Firebase Integration Testing

### Verify Firebase Auth

1. Open browser DevTools → Console
2. Navigate to `index.html`
3. Attempt login — check for Firebase Auth errors
4. Successful login should redirect to `front.html`
5. Check `localStorage` for `userEmail` and `userName` keys

### Verify Firestore Sync

1. Log in on Device A (parent dashboard)
2. Set screen time limit
3. Log in on Device B (child's device)
4. Verify settings appear on Device B
5. Check console for `[BB_Sync]` log messages

### Verify Connection Codes

1. Open parent dashboard (`parent.html`)
2. Generate a connection code
3. Open parent mobile app (`parent-mobile.html`)
4. Enter the connection code
5. Verify accounts are linked
6. Check console for `[BB_Sync] 🔗 Connection code synced` message

### Expected Console Messages

When working correctly, you should see:

```
[BB_Monitor] 📄 Page view: /front.html
[BB_Sync] 📦 Settings pulled from cloud
[BB_Sync] 📡 Real-time sync started for user@example.com
[BB_Sync] 🔄 Real-time update received
```
