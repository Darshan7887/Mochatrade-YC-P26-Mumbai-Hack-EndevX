# BrainBerry — Deployment Guide

> Instructions for deploying BrainBerry across all supported platforms.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Docker Compose](#docker-compose)
- [Docker Hub](#docker-hub)
- [Netlify Deployment](#netlify-deployment)
- [Render Deployment](#render-deployment)
- [Railway Deployment](#railway-deployment)
- [SSL / HTTPS Considerations](#ssl--https-considerations)
- [Environment Setup](#environment-setup)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | ≥ 18.0.0 | Local dev server (`npx serve`) |
| **Docker** | ≥ 20.x | Container builds |
| **Git** | ≥ 2.x | Source control |

BrainBerry is a static web application with **no build step**. There is no webpack, Vite, or other bundler. The source files are served directly.

---

## Local Development

The simplest way to run BrainBerry locally is with the built-in npm script:

```bash
# Clone the repository
git clone https://github.com/Darshan7887/brainberry.git
cd brainberry

# Start the development server
npm start
```

This runs:

```bash
npx -y serve@latest . -l 3000 --no-clipboard
```

The site will be available at **http://localhost:3000**.

> [!IMPORTANT]
> **Voice recognition requires HTTPS** in production browsers. On `localhost`, Chrome allows microphone access over HTTP, but other browsers may not. For full voice support during development, use Chrome.

### Manual Alternative

If you prefer not to use npm, any static file server works:

```bash
# Python 3
python -m http.server 3000

# PHP
php -S localhost:3000
```

---

## Docker Deployment

### Build the Image

```bash
docker build -t brainberry:latest .
```

The Dockerfile uses `nginx:alpine` as the base image:

1. Removes default nginx content
2. Copies custom `config/nginx.conf` to `/etc/nginx/conf.d/default.conf`
3. Copies all web-servable files to `/usr/share/nginx/html/`
4. Cleans up non-servable files (Dockerfile, package.json, README, .github, .git, config, node_modules)
5. Exposes port 80
6. Configures a healthcheck (wget to localhost every 30s)

### Run the Container

```bash
docker run -d --name brainberry -p 8080:80 brainberry:latest
```

The site will be available at **http://localhost:8080**.

### npm Convenience Scripts

```bash
# Build
npm run docker:build

# Run (detached)
npm run docker:run

# Stop and remove
npm run docker:stop

# Restart (stop + rebuild + run)
npm run docker:restart

# View logs
npm run docker:logs
```

### Verify the Container

```bash
# Health check
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/
# Expected: 200

# Check a specific page
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/front.html
# Expected: 200
```

---

## Docker Compose

For a one-command deployment using the pre-built Docker Hub image:

```yaml
# docker-compose.yml
version: "3.8"

services:
  brainberry:
    image: darshan7887/brainberry:latest
    container_name: brainberry
    ports:
      - "8080:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

### Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Pull latest image and restart
docker compose pull && docker compose up -d
```

---

## Docker Hub

BrainBerry images are published to Docker Hub via the CI/CD pipeline.

| Property | Value |
|----------|-------|
| **Repository** | `darshan7887/brainberry` |
| **Latest tag** | `darshan7887/brainberry:latest` |
| **SHA tags** | `darshan7887/brainberry:<commit-sha>` |

### Pull and Run

```bash
docker pull darshan7887/brainberry:latest
docker run -d -p 8080:80 darshan7887/brainberry:latest
```

### CI/CD Pipeline (GitHub Actions)

The pipeline is defined in `.github/workflows/deploy.yml` and runs on every push or pull request to `main`:

```mermaid
flowchart LR
    Push["git push main"] --> Checkout["Checkout Code"]
    Checkout --> Build["docker build"]
    Build --> Start["Start Container"]
    Start --> Health["Health Check<br/>(index.html)"]
    Health --> Pages["Verify Key Pages<br/>(front, Less, parent,<br/>phonics, animals, etc.)"]
    Pages --> Assets["Verify Static Assets<br/>(CSS, JS files)"]
    Assets --> Logs["Show Container Logs"]
    Logs --> Cleanup["Stop Test Container"]
    Cleanup --> Login["Docker Hub Login"]
    Login --> Buildx["Docker Buildx Push"]
    Buildx --> Done["Push: latest + SHA tag"]
```

**Key pages verified in CI:**
- `front.html`, `Less.html`, `parent.html`, `parent-app.html`
- `phonics.html`, `animals.html`, `hindi.html`
- `help.html`, `rewards.html`

**Static assets verified:**
- `assets/js/bb-user-data.js`, `assets/js/profile-panel.js`, `assets/js/parental-control.js`

> [!NOTE]
> The Docker Hub push step only runs on pushes to `main` (not on pull requests). It uses GitHub Actions cache (`type=gha`) for build layer caching.

---

## Netlify Deployment

BrainBerry is configured for Netlify deployment via `netlify.toml`.

### Option 1: Drag-and-Drop

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site" → "Deploy manually"**
3. Drag the entire project folder into the drop zone
4. The site will be live in seconds

### Option 2: Netlify CLI

```bash
# Install the CLI
npm install -g netlify-cli

# Deploy (one-time)
netlify deploy --prod --dir .
```

### Option 3: Git Integration

1. Push the repository to GitHub
2. In Netlify, click **"Add new site" → "Import an existing project"**
3. Connect your GitHub account and select the repository
4. Set publish directory to `.` (root — no build command needed)
5. Click **"Deploy site"**

Every push to `main` will trigger an automatic deployment.

### Netlify Configuration (`netlify.toml`)

```toml
[build]
  publish = "."   # No build step needed

# Security headers on all pages
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Long cache for media files (30 days)
[[headers]]
  for = "assets/videos/*.mp4"
  [headers.values]
    Cache-Control = "public, max-age=2592000, immutable"
```

> [!WARNING]
> Netlify has a **100 MB per file** upload limit. Some video files in the repository (e.g. `lion_story.mp4` at 266 MB) may exceed this limit. Consider hosting large media files externally or using Git LFS if deploying to Netlify.

---

## Render Deployment

BrainBerry includes a `render.yaml` blueprint for one-click deployment to Render.

### Option 1: Blueprint Deploy

1. Push the repository to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect GitHub and select the repository
4. Render will detect `render.yaml` and create the service automatically

### Option 2: Manual Docker Service

1. Go to Render → **New** → **Web Service**
2. Connect your GitHub repository
3. Set the environment to **Docker**
4. Dockerfile path: `./Dockerfile`
5. Select the **Free** plan
6. Click **Create Web Service**

### Render Blueprint (`render.yaml`)

```yaml
services:
  - type: web
    name: brainberry
    env: docker
    dockerfilePath: ./Dockerfile
    plan: free
    healthCheckPath: /
    envVars: []
```

---

## Railway Deployment

Railway supports Docker-based deployments with minimal configuration.

### Steps

1. Sign in to [railway.app](https://railway.app)
2. Click **"New Project" → "Deploy from GitHub Repo"**
3. Connect your GitHub account and select the BrainBerry repository
4. Railway will auto-detect the `Dockerfile` and begin building
5. Once deployed, Railway provides a public URL (e.g. `brainberry-production.up.railway.app`)

### Configuration

Railway reads the `Dockerfile` automatically. No additional configuration files are needed. The free tier includes:

- 500 hours of execution per month
- 1 GB RAM
- Automatic HTTPS

---

## SSL / HTTPS Considerations

Several BrainBerry features **require HTTPS** in production:

| Feature | Reason |
|---------|--------|
| **Microphone access** | Web Speech API requires secure context |
| **Camera access** | face-api.js and MediaPipe need secure context for `getUserMedia` |
| **Service Worker** | PWA service workers only register on HTTPS (or localhost) |
| **Firebase Auth popups** | OAuth providers require HTTPS redirect URIs |

### Platform HTTPS Support

| Platform | HTTPS |
|----------|-------|
| **Netlify** | Automatic (free SSL via Let's Encrypt) |
| **Render** | Automatic (free SSL) |
| **Railway** | Automatic (free SSL) |
| **Docker (self-hosted)** | Manual — use a reverse proxy (Caddy, Traefik, or nginx with certbot) |
| **localhost** | Not required for Chrome (microphone works on localhost) |

### Self-Hosted HTTPS with Caddy

If running Docker on your own server, the easiest way to add HTTPS is with Caddy as a reverse proxy:

```bash
# Caddyfile
brainberry.yourdomain.com {
    reverse_proxy localhost:8080
}
```

```bash
caddy run
```

Caddy automatically provisions and renews Let's Encrypt certificates.

---

## Environment Setup

### Firebase Configuration

BrainBerry's Firebase configuration is embedded directly in the JavaScript files (client-side only). The Firebase project details are:

| Parameter | Value |
|-----------|-------|
| **API Key** | `AIzaSyADRJMnuBGNzU_LAOx0bYSg0UvCEXEC7vs` |
| **Auth Domain** | `brainberry-96454.firebaseapp.com` |
| **Project ID** | `brainberry-96454` |
| **Storage Bucket** | `brainberry-96454.appspot.com` |
| **Messaging Sender ID** | `819230645241` |
| **App ID** | `1:819230645241:web:698aa272865737ee103b28` |
| **Measurement ID** | `G-VVHB92VP3H` |

> [!NOTE]
> These are **client-side** Firebase API keys. They are safe to include in source code — Firebase Security Rules control access to data, not the API key. If you fork this project, you should create your own Firebase project and update these values.

### GitHub Actions Secrets

The CI/CD pipeline requires two secrets configured in GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username (e.g. `darshan7887`) |
| `DOCKERHUB_TOKEN` | Docker Hub access token |

Set these in: **Repository Settings → Secrets and variables → Actions → New repository secret**
