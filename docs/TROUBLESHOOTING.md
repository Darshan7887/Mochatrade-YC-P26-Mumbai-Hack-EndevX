# 🔧 BrainBerry — Troubleshooting Guide

> Solutions for common issues when using or developing BrainBerry.

---

## Table of Contents

- [Voice Recognition Issues](#voice-recognition-issues)
- [Microphone Issues](#microphone-issues)
- [Video Playback Issues](#video-playback-issues)
- [Firebase & Authentication Issues](#firebase--authentication-issues)
- [Parental Controls Issues](#parental-controls-issues)
- [PWA Installation Issues](#pwa-installation-issues)
- [Connection Code Issues](#connection-code-issues)
- [Docker & Deployment Issues](#docker--deployment-issues)
- [Browser Compatibility](#browser-compatibility)
- [Development Issues](#development-issues)
- [FAQ](#faq)

---

## Voice Recognition Issues

### "Speech recognition not supported in this browser"

**Cause**: The Web Speech API is not available in your browser.

**Solution**:
- Use **Google Chrome 80+** (recommended) or **Microsoft Edge 80+**
- Firefox does NOT support the SpeechRecognition API
- Safari has limited support

### Voice recognition starts but doesn't detect speech

**Solutions**:
1. Speak clearly and at a normal volume
2. Ensure your microphone is not muted
3. Check that no other application is using the microphone
4. Try moving closer to the microphone
5. Reduce background noise
6. Check browser permissions (see Microphone Issues below)

### Voice recognition gives wrong results

**Note**: BrainBerry uses **Levenshtein distance fuzzy matching** with a 30% threshold. This means:
- Close pronunciations are accepted (e.g., "bee" for "B")
- Very different sounds will be rejected
- Speaking the full phrase (e.g., "A as in Apple") also works

---

## Microphone Issues

### Browser doesn't ask for microphone permission

**Cause**: The page is not served over HTTPS or localhost.

**Solutions**:
- Use `localhost` for local development (`npm start` serves on `localhost:3000`)
- Deploy to an HTTPS endpoint (Netlify, Render, etc.)
- Voice recognition requires a **secure context** (HTTPS or localhost)

### Microphone permission denied

**Chrome**:
1. Click the lock icon 🔒 in the address bar
2. Click "Site settings"
3. Set "Microphone" to "Allow"
4. Refresh the page

**Edge**: Same as Chrome.

**Firefox**: Click the microphone icon in the address bar → Allow

### Microphone works but voice recognition doesn't start

**Solutions**:
1. Check that you clicked the **🎤 Listen** button
2. Wait for "Listening... (speak now)" to appear
3. Only one recognition session can run at a time
4. Try refreshing the page
5. Check browser console for errors

---

## Video Playback Issues

### Videos don't play (background videos missing)

**Cause**: Video files (`.mp4`, `.mov`, `.webm`) are excluded from the Git repository via `.gitignore` due to their large size.

**Solutions**:
- For **local development**: Ensure video files are present in the project directory
- For **Docker deployment**: Video files must be included in the Docker build context (they're NOT excluded by `.dockerignore`)
- Missing videos will show a blank background but won't break functionality

### Videos play but have no sound

**Expected behavior**: Background videos are set to `muted` by default to comply with browser autoplay policies. Content videos (stories, animals) may have sound — click the video to unmute if needed.

### Videos don't autoplay on mobile

**Cause**: Mobile browsers restrict autoplay. BrainBerry uses `autoplay muted loop playsinline` attributes.

**Solutions**:
- Ensure `playsinline` attribute is present (already set)
- Videos must be `muted` to autoplay on mobile
- Tap the video to start playback if autoplay fails

---

## Firebase & Authentication Issues

### "Firebase login failed" error

**Solutions**:
1. Ensure you have an internet connection
2. Check that pop-ups are allowed in your browser
3. For Google login: make sure the Google popup fully opens
4. For Facebook login: ensure your Facebook account allows third-party apps
5. Check browser console for specific Firebase error codes

### Common Firebase error codes

| Error Code | Meaning | Solution |
|-----------|---------|----------|
| `auth/email-already-in-use` | Email is registered | Use login instead of register, or use a different email |
| `auth/wrong-password` | Incorrect password | Check your password and try again |
| `auth/user-not-found` | Email not registered | Create an account first |
| `auth/popup-closed-by-user` | OAuth popup was closed | Try again, don't close the popup |
| `auth/network-request-failed` | No internet | Check your connection |
| `auth/too-many-requests` | Rate limited | Wait a few minutes and try again |

### Data not syncing between devices

**Solutions**:
1. Ensure both devices are logged in with the **same email**
2. Check internet connection on both devices
3. Look for `[BB_Sync]` messages in browser console
4. Verify connection code is correctly linked
5. Try manually refreshing both pages

---

## Parental Controls Issues

### Forgot Parent PIN

**Solutions**:
- The PIN is stored in the browser's localStorage
- Open browser DevTools (F12) → Console
- Run: `localStorage.getItem('bb_user:' + localStorage.getItem('userEmail') + ':bb_parent_pin')`
- This shows the stored PIN

### Screen time lock won't dismiss

**Cause**: The screen time limit has been reached.

**Solutions**:
- Parent can extend the time limit from the parent dashboard
- Wait until the next day (counter resets)
- Parent can adjust settings from the parent mobile app

### Lesson lock not appearing / disappearing

**Solutions**:
1. Ensure `assets/js/bb-user-data.js` is loaded before `assets/js/parental-control.js`
2. Check that `bb_assigned_lessons` is set in localStorage
3. Verify Firebase Sync is connected: look for `[BB_Sync] 📡` messages
4. Try refreshing the page

---

## PWA Installation Issues

### "Add to Home Screen" prompt doesn't appear

**Requirements**:
- Must be served over **HTTPS**
- `manifest-parent.json` must be valid and accessible
- Service worker (`sw-parent.js`) must be registered
- Must visit the page at least twice (browser requirement)

**Solutions**:
1. Ensure you're using Chrome or Edge on mobile
2. Check that the page is served over HTTPS
3. Open DevTools → Application → Manifest to verify
4. Look for service worker registration in DevTools → Application → Service Workers

### PWA installed but shows old content

**Cause**: Service worker is serving cached content.

**Solutions**:
1. Open the installed app
2. Pull down to refresh (mobile) or press Ctrl+Shift+R (desktop)
3. Clear app cache: Settings → Apps → BrainBerry Parent → Clear Cache
4. Uninstall and reinstall the PWA

---

## Connection Code Issues

### Connection code "not found"

**Solutions**:
1. Ensure the code was generated recently (codes don't expire but must exist in Firestore)
2. Check that the generating device was online when creating the code
3. Verify the code was typed correctly (case-sensitive)
4. Check browser console for `[BB_Sync]` error messages

### Devices not syncing after code validation

**Solutions**:
1. Both devices must be logged in with their respective accounts
2. Ensure both devices have internet
3. Check console for `[BB_Sync] ✅ Code valid, linked to:` message
4. Try refreshing both pages

---

## Docker & Deployment Issues

### Docker build fails

**Common causes and solutions**:

```bash
# If nginx.conf is missing
# Ensure config/nginx.conf exists
ls config/nginx.conf

# If build context is too large (>500MB)
# Check .dockerignore excludes large media files
cat .dockerignore

# Rebuild without cache
docker build --no-cache -t brainberry:latest .
```

### Container starts but pages return 404

**Solutions**:
1. Check Nginx logs: `docker logs brainberry`
2. Verify files were copied: `docker exec brainberry ls /usr/share/nginx/html/`
3. Ensure `config/nginx.conf` has correct `root` directive
4. Check `.dockerignore` isn't excluding needed files

### Netlify deployment issues

**Common issues**:
- **Build command**: Leave empty (static site, no build step)
- **Publish directory**: Set to `.` (root)
- **Redirect issues**: Check `netlify.toml` for correct redirect rules

### Render deployment issues

**Common issues**:
- Ensure `render.yaml` exists with correct `dockerfilePath`
- Check that Render detected Docker environment
- View build logs for specific errors

---

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Voice Recognition | ✅ | ✅ | ❌ | ⚠️ |
| Voice Synthesis | ✅ | ✅ | ✅ | ✅ |
| Webcam (face-api) | ✅ | ✅ | ✅ | ⚠️ |
| MediaPipe Hands | ✅ | ✅ | ✅ | ❌ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| PWA Install | ✅ | ✅ | ❌ | ❌ |
| Firebase Auth | ✅ | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ | ✅ |

**Recommendation**: Use **Google Chrome 80+** for the best experience.

---

## Development Issues

### `npm start` doesn't work

**Solutions**:
```bash
# Ensure Node.js 18+ is installed
node --version

# npm start uses npx serve
npx -y serve@latest . -l 3000 --no-clipboard

# Or open index.html directly in browser
# (some features won't work without a server)
```

### Changes not reflected after editing

**Solutions**:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- If using service worker, unregister it in DevTools → Application → Service Workers

### Console shows "[BB_Sync] Firebase init failed (offline?)"

**Cause**: Firebase SDK couldn't load or initialize.

**Solutions**:
1. Check internet connection
2. Ensure Firebase CDN (`gstatic.com`) is not blocked
3. Check that `firebaseConfig` in the page matches your Firebase project
4. Verify Firebase project is active in Firebase Console

---

## FAQ

### Q: Can my child bypass parental controls?

**A**: The parent PIN and screen time controls are client-side (stored in localStorage). A technically savvy user could access browser DevTools to modify these values. For younger children, this provides adequate protection. For additional security, consider using device-level parental control software alongside BrainBerry.

### Q: Does BrainBerry work offline?

**A**: Partially. The parent mobile PWA caches pages for offline use. Learning modules require assets/audio/video files to be present locally. Firebase features (login, sync, cloud storage) require internet. localStorage-based features (progress, settings) work offline.

### Q: Is my child's data private?

**A**: Yes. User data is stored in Firebase Firestore with per-user access controls. Data is also stored locally in the browser's localStorage. See `SECURITY.md` for full details on the security model.

### Q: Why does BrainBerry need microphone access?

**A**: Voice recognition is a core feature of BrainBerry. The Web Speech API is used for interactive lessons where children practice pronunciation. Microphone data is processed locally in the browser and is NOT sent to BrainBerry servers.

### Q: Why does BrainBerry need camera access?

**A**: Camera access is used for two optional features:
1. **Emotion Detection** — Analyzes facial expressions to track engagement (using face-api.js, processed locally)
2. **Air Writing** — Tracks hand movements for writing practice (using MediaPipe, processed locally)

All camera processing happens **in the browser** — no video is sent to any server.

### Q: What browsers are supported?

**A**: Google Chrome 80+ is strongly recommended. Edge 80+ also works well. Firefox supports most features except voice recognition. Safari has limited support.
