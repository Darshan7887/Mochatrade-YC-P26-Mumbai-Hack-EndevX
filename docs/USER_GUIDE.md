# 📖 BrainBerry — User Guide

> Complete guide for parents and children using the BrainBerry learning platform.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Navigating the Platform](#navigating-the-platform)
- [Learning Modules](#learning-modules)
- [Stories](#stories)
- [Games & Challenges](#games--challenges)
- [Rewards & Progress](#rewards--progress)
- [Parent Dashboard](#parent-dashboard)
- [Parent Mobile App](#parent-mobile-app)
- [Connection Code System](#connection-code-system)

---

## Getting Started

### Creating an Account

1. Open BrainBerry in your web browser (Chrome is recommended)
2. Click **"Join Free"** on the landing page
3. Fill in the registration form:
   - **Name**: Your child's name
   - **Age**: Your child's age
   - **Email**: A valid email address
   - **Password**: At least 6 characters
4. Click **"Register"**
5. You'll be redirected to the home dashboard

### Logging In

You can log in using:

- **Email & Password** — Enter your registered credentials
- **Google** — Click the Google icon for one-click login
- **Facebook** — Click the Facebook icon
- **Twitter/X** — Click the Twitter icon

> **First-time social login**: If you sign in with Google/Facebook/Twitter for the first time, you'll be asked to set an optional email password so you can log in either way.

### System Requirements

| Requirement | Details |
|-------------|---------|
| **Browser** | Chrome 80+ (recommended), Edge 80+, Firefox 70+ |
| **Microphone** | Required for voice-based lessons |
| **Webcam** | Required for emotion detection and air writing |
| **Internet** | Required for login, cloud sync, and some features |
| **HTTPS** | Required for voice recognition (use `localhost` for development) |

---

## Navigating the Platform

### Home Dashboard (`front.html`)

After logging in, you land on the home dashboard with three main sections:

| Section | Description |
|---------|-------------|
| **Character Card** (left) | Shows your learning avatar with level and XP progress bar. Click to open emotion detection. |
| **Lessons Panel** (center) | Lists all available lessons. Locked lessons show a 🔒 overlay. Click any unlocked lesson to start. |
| **To-Do List** (right) | Personal task list. Add, check off, and delete tasks. Syncs to the cloud when logged in. |

### Navigation Bar

The top navigation bar appears on every page:

| Link | Destination |
|------|-------------|
| **Home** | Home dashboard |
| **Challenges** | Challenge modes and activities |
| **Games** | Educational games hub |
| **Lessons** | Full lessons grid |
| **Rewards** | Rewards and achievements |
| **Help** | Help center with About, Contact, Feedback, and News |

### Profile Sidebar

Click your **profile picture** (top-right) to open the profile sidebar:

- View your name, age, and email
- Edit your profile information
- Sign out of your account
- Changes sync to Firebase in real-time

---

## Learning Modules

### Phonics (Say & Repeat)

**Page**: `phonics.html` and `l1/index.html`

1. A letter or word appears on screen
2. Click **🔊 Play** to hear the pronunciation
3. Click **🎤 Listen** to start voice recognition
4. Speak the letter/word clearly
5. Get instant feedback:
   - ✅ **Correct!** — You earn 30 points
   - ❌ **Try again!** — The correct pronunciation is repeated
6. Click **➡️ Next** to move to the next item

> **Tip**: Speak clearly and close to the microphone. Allow microphone access when prompted.

### Animals

**Page**: `animals.html`

- Browse interactive animal cards with images
- Hear animal sounds and learn animal names
- Watch short animal video clips
- Practice saying animal names with voice recognition

### Hindi (हिन्दी)

**Page**: `hindi.html` → `hindi_swar.html` (vowels) / `hindi_vyanjan.html` (consonants)

- Learn Hindi **Swar** (स्वर — vowels: अ, आ, इ, ई...)
- Learn Hindi **Vyanjan** (व्यंजन — consonants: क, ख, ग, घ...)
- Audio pronunciation for each character
- Voice recognition practice

### Colors & Shapes

**Pages**: `color.html`, `shapes.html`, `color-shape.html`, `colour-mixing.html`

- Identify colors with visual examples and audio cues
- Learn shape names with interactive cards
- **Colour Mixing**: Experiment with mixing two colors together to see the result
- Audio files play the color/shape name when clicked

### Civic Sense

**Page**: `civicsense.html`

- Learn real-world civic responsibility scenarios
- Topics include: traffic rules, cleanliness, helping others, respecting elders
- Interactive scenarios with voice-based responses
- Challenge mode available

### Counting & Numbers

**Pages**: `counting.html`, `no1.html`

- Practice counting with visual number displays
- Voice recognition to verify spoken numbers
- Progressive difficulty levels

### Syllabus Words

**Page**: `syllabuswords.html`

- Vocabulary building with curated word lists
- Pronunciation practice with speech recognition
- Audio playback for each word

---

## Stories

### Available Stories

| Story | Page | Summary |
|-------|------|---------|
| **The Clever Crow** | `clever-crow.html` | A thirsty crow finds a creative way to drink water |
| **The Lion and the Mouse** | `lion-mouse.html` | A small mouse helps a mighty lion |
| **The Fox and the Grapes** | `fox.html` | A fox learns about sour grapes |

Each story features:
- Narrated text with visual illustrations
- Background video/animations
- Interactive elements
- Moral of the story

---

## Games & Challenges

### Educational Games

| Game | Page | How to Play |
|------|------|-------------|
| **Tetris** | `tetris.html` | Classic block-stacking game. Use arrow keys to move, rotate, and drop pieces. |
| **Simon Says** | `simongbg.html` | Watch the pattern of colors/sounds, then repeat it. Patterns get longer each round. |
| **Memory Match** | `memory.html` | Flip cards to find matching pairs. Complete all pairs to win. |
| **River Crossing** | `river.html` | Logic puzzle — move all characters across the river following the rules. |
| **Fill-in-the-Blanks** | `fibc.html` | Complete sentences by speaking or typing the missing word. Uses voice recognition. |
| **Air Writing** | `airwriting.html` | Write letters in the air using your hand! Uses webcam and MediaPipe hand tracking. |

### Challenge Modes

- **Color Challenges** (`colorschallenge.html`) — Timed color identification
- **Civic Sense Challenge** (`civicchal1.html`) — Scenario-based civic sense quiz
- **General Challenges** (`challen.html`, `challenge4.html`) — Mixed learning challenges

---

## Rewards & Progress

**Page**: `rewards.html`

- View your learning achievements
- Track gems 💎 and coins 🪙 earned
- See completed lessons and scores
- Progress data is tracked by the `BB_Monitor` module and stored per-user

---

## Parent Dashboard

**Page**: `parent.html`

### Accessing the Dashboard

1. Navigate to `parent.html`
2. Enter your 4-digit **Parent PIN**
3. If no PIN is set, you'll be prompted to create one

### Screen Time Controls

1. Open the parent dashboard
2. Set a **daily screen time limit** (in minutes)
3. When the limit is reached, a lock overlay appears on the child's screen
4. The child cannot continue until the next day or the parent extends the limit

### Lesson Management

1. In the parent dashboard, view all available lessons
2. **Check** lessons to unlock them for your child
3. **Uncheck** lessons to lock them
4. Locked lessons show a "🔒 Locked by Parent" overlay on the child's dashboard
5. Changes sync instantly via Firebase

### Progress Tracking

- View correct/wrong answer counts per lesson
- See total lessons completed
- Track session duration and total learning time
- Activity log with timestamps

### To-Do List

- Assign tasks for your child
- Track completion status
- Tasks sync between parent and child devices

---

## Parent Mobile App

### Installation (PWA)

**Page**: `parent-download.html`

The Parent Mobile App is a **Progressive Web App (PWA)** — it works like a native app but installs directly from the browser:

1. Open `parent-mobile.html` on your mobile browser (Chrome recommended)
2. Tap **"Add to Home Screen"** when prompted (or use browser menu → "Install App")
3. The app icon appears on your home screen
4. Open the app — it works offline for cached content!

### Features

The mobile parent app (`parent-mobile.html`) includes:

- Full parental control dashboard
- Screen time management
- Lesson lock/unlock
- Connection code entry
- Progress viewing
- Optimized for portrait mobile screens

---

## Connection Code System

### How It Works

Connection codes link a parent's device to a child's device for real-time settings sync.

### For Parents (Generate Code)

1. Open the **Parent Dashboard** (`parent.html`)
2. Click **"Generate Connection Code"**
3. A 6-digit code is created and displayed
4. Share this code with the parent mobile app

### For Parent Mobile App (Enter Code)

1. Open the **Parent Mobile App** (`parent-mobile.html`)
2. Enter the 6-digit connection code
3. The app validates the code against Firebase
4. If valid, the devices are linked

### After Linking

- Settings changes on either device sync instantly
- Screen time limits, lesson assignments, and progress are shared
- Uses Firebase Firestore `onSnapshot` for real-time updates
- Works across any number of devices linked to the same account

---

## Tips for Best Experience

1. **Use Chrome** — Best support for voice recognition and all features
2. **Allow microphone access** — Required for voice-based learning
3. **Allow camera access** — Required for emotion detection and air writing
4. **Use HTTPS or localhost** — Voice recognition requires a secure context
5. **Stay online** — Cloud sync and authentication require internet
6. **Set up parental controls** — Create a PIN and configure screen time limits early
7. **Link devices** — Use connection codes to sync between parent and child devices
