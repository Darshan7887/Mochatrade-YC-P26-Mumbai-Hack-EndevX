# BrainBerry — Project Overview

> **Making education fun and inclusive for every child.**

---

## Mission

BrainBerry exists to make education fun, engaging, and inclusive for children with Specific Learning Difficulties (SLDs). By combining voice-driven interaction, gamified lessons, emotion detection, and real-time parental controls, BrainBerry provides a safe, adaptive learning environment where every child can thrive at their own pace.

---

## Problem Statement

Children with Specific Learning Difficulties — including dyslexia, dyscalculia, dysgraphia, and attention disorders — face significant barriers in traditional education:

| Challenge | Impact |
|-----------|--------|
| **Text-heavy interfaces** | Children with dyslexia struggle to navigate conventional e-learning platforms |
| **Rigid pacing** | Fixed lesson progression leaves slower learners behind and faster learners disengaged |
| **Lack of multimodal input** | Traditional platforms rely solely on reading/typing, excluding children who learn better through voice, gesture, or visual cues |
| **No parental visibility** | Parents have limited insight into what their child is doing, how long they spend, or what progress they make |
| **Screen time concerns** | Uncontrolled device usage is a growing concern, yet few educational platforms offer built-in time limits |

---

## Solution

BrainBerry is a **voice-driven, gamified, interactive learning platform** delivered as a static web application. It runs entirely in the browser with no app-store installation required, and is backed by Firebase for authentication and cloud sync.

### Core Principles

1. **Voice-First** — Children interact primarily through speech (Web Speech API), reducing the reading/typing barrier.
2. **Gamified Learning** — Every module uses games, challenges, and rewards to sustain engagement.
3. **Emotion-Aware** — Real-time facial emotion detection (face-api.js) allows the platform to observe emotional engagement.
4. **Parental Control** — A dedicated parent dashboard (with PIN protection) provides screen time management, lesson locking, and progress tracking.
5. **Cross-Device Sync** — Firebase Firestore enables real-time synchronisation between the child's learning device and the parent's phone/desktop via connection codes.
6. **Offline-Capable** — Local-first architecture (localStorage) ensures the child can continue learning even without an internet connection.

---

## Target Audience

| Audience | Details |
|----------|---------|
| **Primary users** | Children ages 4–10 |
| **Special focus** | Children with dyslexia, dyscalculia, dysgraphia, ADHD, and other SLDs |
| **Secondary users** | Parents and guardians who monitor progress and set controls |
| **Educators** | Teachers who may use BrainBerry as a supplementary classroom tool |

---

## Key Differentiators

| Feature | Description |
|---------|-------------|
| **Voice Recognition** | Web Speech API enables hands-free, voice-driven interaction across all modules |
| **Emotion Detection** | face-api.js analyses the child's facial expressions in real time via the webcam |
| **Air Writing** | MediaPipe Hands tracks finger movement to let children "write" letters in the air |
| **Parental Controls** | PIN-protected dashboard with screen time limits, lesson locking, and to-do lists |
| **Real-Time Sync** | Firebase Firestore pushes parent-set restrictions instantly to the child's device |
| **Connection Codes** | A 6-digit code links a parent's phone to the child's learning device without sharing passwords |
| **Multi-Language** | Supports English Phonics as well as Hindi (Swar and Vyanjan) |
| **No Installation** | Runs in any modern browser; parent app is a PWA installable from the browser |

---

## Learning Modules

### Phonics

**File:** `phonics.html`

Interactive English phonics module where children learn letter sounds through voice recognition. The child hears a letter prompt, sees an animated visual, and speaks the letter sound aloud. The Web Speech API validates their pronunciation in real time.

### Animals

**File:** `animals.html`

A multimedia animal encyclopedia with video clips of real animals (elephants, dogs, cats, horses, lions, cows, monkeys, sheep, ducks, tigers). Each animal plays its sound, and children are encouraged to identify and name the animal via voice.

### Hindi — Swar (Vowels)

**File:** `hindi_swar.html`

Teaches Hindi vowels (स्वर) through visual cards, audio pronunciation, and voice-based practice. Children listen to each swar, repeat it, and receive immediate feedback.

### Hindi — Vyanjan (Consonants)

**File:** `hindi_vyanjan.html`

Teaches Hindi consonants (व्यंजन) with the same interactive voice-driven approach as the Swar module, covering the full set of Hindi consonants.

### Colors & Shapes

**Files:** `color.html`, `shapes.html`, `color-shape.html`

Children learn to identify and name colors and geometric shapes. The module uses bright, high-contrast visuals suitable for young learners, with voice prompts for identification.

### Colour Mixing

**Files:** `colormix.html`, `colour-mixing.html`

An interactive colour-mixing experiment where children combine primary colours and discover what secondary colours they produce. Drag-and-drop or voice-guided interaction.

### Civic Sense

**Files:** `civicsense.html`, `civicchal1.html`

Teaches children about basic civic responsibilities — hygiene (hand washing), queueing, traffic safety, garbage disposal, and respectful behaviour in public — through animated scenarios and video clips.

### Counting

**Files:** `counting.html`, `assets/js/counting.js`, `no1.html`

A numbers module that teaches counting through visual objects, audio cues, and voice interaction. Children count objects on screen and speak the number aloud.

---

## Interactive Stories

| Story | File | Description |
|-------|------|-------------|
| **The Clever Crow** | `clever-crow.html` | Animated retelling of the classic fable with voice narration and interactive checkpoints |
| **The Lion & The Mouse** | `lion-mouse.html` | Story with moral lessons, accompanied by video narration (`lion_story.mp4`) |
| **The Fox & The Grapes** | `fox.html` | Interactive Aesop's fable with comprehension questions |

All stories are accessible from the story hub (`story.html`).

---

## Games & Challenges

| Game | File(s) | Description |
|------|---------|-------------|
| **Tetris** | `tetris.html`, `assets/css/tetris.css`, `assets/js/teetris.js` | Classic block-stacking game adapted for children with colourful visuals |
| **Simon Says** | `simongbg.html` | Memory-based game where children follow colour/sound sequences |
| **Memory Match** | `memory.html`, `assets/js/memory.js` | Card-flipping memory game with themed image pairs |
| **River Crossing** | `river.html`, `assets/js/river.js`, `assets/css/river.css` | Logic puzzle game where the child must navigate characters across a river |
| **Fill-in-the-Blanks** | `fibc.html`, `assets/js/fibc.js` | Vocabulary building exercise with voice-based answers |
| **Air Writing** | `airwriting.html`, `assets/js/airwriting-opencv.js` | Write letters in the air using hand gestures tracked by MediaPipe Hands |

Games are accessed from the games hub (`chal.html` / `gamesbg.html`), and challenges from `challen.html`.

---

## Parent Features

| Feature | Description |
|---------|-------------|
| **Parent Dashboard** | `parent.html` — PIN-protected desktop dashboard for managing all parental controls |
| **Parent App (Desktop PWA)** | `parent-app.html` — Installable desktop progressive web app |
| **Parent Mobile App (PWA)** | `parent-mobile.html` — Mobile-optimised PWA with service worker (`sw-parent.js`) and manifest (`manifest-parent.json`) |
| **Screen Time Control** | Set daily time limits; a fullscreen lock overlay activates when time expires |
| **Lesson Locking** | Lock or unlock specific learning modules per child |
| **Connection Codes** | Generate a 6-digit code to link the parent's device to the child's account |
| **Progress Tracking** | View correct/wrong answers, lessons completed, and average scores |
| **To-Do Lists** | Assign learning tasks for the child |
| **Rewards** | `rewards.html` — View earned rewards and achievements |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (no build step) |
| **Voice** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Emotion Detection** | face-api.js (TensorFlow.js-based facial expression recognition) |
| **Hand Tracking** | MediaPipe Hands (for air writing) |
| **Authentication** | Firebase Auth (Email/Password, Google, Facebook, Twitter) |
| **Database** | Firebase Firestore (cloud) + localStorage (local-first) |
| **PWA** | Service Worker + Web App Manifest (parent mobile app) |
| **Web Server** | Nginx (Alpine-based Docker container) |
| **CI/CD** | GitHub Actions → Docker Hub |
| **Hosting** | Netlify, Render, Docker Hub (`darshan7887/brainberry`) |

---

## Contributors

| GitHub Handle | Role |
|---------------|------|
| **Darshan7887** | Lead Developer |
| **avishkar12006** | Contributor |
| **Saurav-20-30** | Contributor |
| **SkiteSight** | Contributor |

---

## License

MIT License — see the project `package.json` for details.
