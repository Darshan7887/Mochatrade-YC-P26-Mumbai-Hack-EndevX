# 🍓 BrainBerry — System Architecture

> Visual architecture diagrams for the BrainBerry learning platform.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client (Browser)"]
        direction TB
        Login["index.html<br/>Login / Register"]
        Home["front.html<br/>Home Dashboard"]
        Lessons["Less.html<br/>Lessons Grid"]
        Parent["parent.html<br/>Parent Dashboard"]
        PWA["parent-mobile.html<br/>Parent PWA"]
        
        subgraph Modules["📚 Learning Modules"]
            Phonics["phonics.html"]
            Animals["animals.html"]
            Hindi["hindi.html"]
            Colors["color-shape.html"]
            Civic["civicsense.html"]
            Stories["story.html"]
        end
        
        subgraph Games["🎮 Games"]
            Tetris["tetris.html"]
            Simon["simongbg.html"]
            Memory["memory.html"]
            River["river.html"]
        end
        
        subgraph SharedJS["⚙️ Shared JS Modules"]
            UserData["assets/js/bb-user-data.js<br/>User Namespace"]
            Control["assets/js/parental-control.js<br/>Screen Time"]
            Profile["assets/js/profile-panel.js<br/>Profile Sidebar"]
            Sub["assets/js/subscription.js<br/>Plan Management"]
            Sync["assets/js/bb-sync.js<br/>Firestore Sync"]
            Monitor["bb-monitoring.js<br/>Activity Tracking"]
        end
    end
    
    subgraph Storage["💾 Storage"]
        LS["localStorage<br/>(User-Scoped)"]
        SW["Service Worker<br/>(Offline Cache)"]
    end
    
    subgraph Firebase["☁️ Firebase"]
        Auth["Firebase Auth<br/>Email / Google / Facebook / Twitter"]
        Firestore["Firestore DB<br/>bb_sync / users / bb_connection_codes"]
    end
    
    subgraph ML["🤖 ML Models"]
        FaceAPI["face-api.js<br/>Emotion Detection"]
        MediaPipe["MediaPipe Hands<br/>Air Writing"]
        Speech["Web Speech API<br/>Voice Recognition"]
    end
    
    Client --> Storage
    Client --> Firebase
    Client --> ML
    Sync --> Firestore
    Monitor --> LS
    UserData --> LS
    Control --> LS
    PWA --> SW
```

---

## Data Flow

```mermaid
sequenceDiagram
    participant Child as 👧 Child Device
    participant LS as 💾 localStorage
    participant FS as ☁️ Firestore
    participant Parent as 👨 Parent Device

    Note over Child,Parent: Registration & Login
    Child->>FS: Firebase Auth (email/social)
    FS-->>Child: Auth token + user profile

    Note over Child,Parent: Learning Session
    Child->>LS: Save progress (local-first)
    Child->>FS: Sync progress to cloud
    
    Note over Child,Parent: Parent Controls
    Parent->>FS: Set screen time, lock lessons
    FS-->>Child: Real-time update (onSnapshot)
    Child->>LS: Apply new settings locally
    
    Note over Child,Parent: Connection Code Flow
    Parent->>FS: Generate & store code
    Child->>FS: Validate code
    FS-->>Child: Return linked email
    Note over Child,Parent: Devices now linked!
```

---

## Module Dependency Graph

```mermaid
graph LR
    subgraph Core["Core (Load Order)"]
        A["assets/js/bb-user-data.js"] --> B["assets/js/parental-control.js"]
        A --> C["assets/js/profile-panel.js"]
        A --> D["assets/js/subscription.js"]
        A --> E["assets/js/bb-sync.js"]
        A --> F["bb-monitoring.js"]
    end
    
    B --> E
    C --> E
    
    subgraph Pages["Pages"]
        P1["index.html"] --> A
        P2["front.html"] --> A
        P3["parent.html"] --> A
        P4["Less.html"] --> A
        P5["All lesson pages"] --> A
    end
```

---

## Deployment Architecture

```mermaid
graph LR
    subgraph Dev["Development"]
        Code["Source Code"] --> GH["GitHub Repository"]
    end
    
    subgraph CICD["CI/CD (GitHub Actions)"]
        GH --> Build["Docker Build"]
        Build --> Test["Health Checks"]
        Test --> Push["Push to Docker Hub"]
    end
    
    subgraph Deploy["Deployment Targets"]
        Push --> DH["Docker Hub<br/>darshan7887/brainberry"]
        GH --> Netlify["Netlify<br/>(Static Site)"]
        GH --> Render["Render<br/>(Docker Service)"]
        GH --> Railway["Railway<br/>(Docker)"]
    end
    
    subgraph Runtime["Runtime"]
        DH --> Nginx["Nginx Alpine<br/>Port 80"]
        Nginx --> Static["Static HTML/CSS/JS"]
    end
```

---

## Voice Recognition Pipeline

```mermaid
graph LR
    A["🎤 Microphone Input"] --> B["Web Speech API<br/>SpeechRecognition"]
    B --> C["Transcript Text"]
    C --> D["Normalize<br/>(lowercase, strip special chars)"]
    D --> E["Levenshtein Distance<br/>Fuzzy Matching"]
    E --> F{Match?}
    F -->|✅ Yes| G["🔊 'Great job!'<br/>Score += 30"]
    F -->|❌ No| H["🔊 'Try again!'<br/>Repeat prompt"]
```
