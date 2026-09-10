# Security Policy

## Supported Versions

| Version | Supported          |
|-------- |------------------- |
| Latest  | :white_check_mark: |

We actively maintain and apply security patches to the latest version of BrainBerry. We recommend always running the most recent release.

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in BrainBerry, please report it responsibly by emailing:

📧 **brainberry.security@gmail.com**

### What to Include

- A description of the vulnerability.
- Steps to reproduce the issue.
- The potential impact or severity.
- Any suggested fixes, if you have them.

### Response Timeline

- **Acknowledgment**: Within 48 hours of your report.
- **Initial assessment**: Within 5 business days.
- **Resolution**: We aim to patch confirmed vulnerabilities within 14 days, depending on severity and complexity.

We will credit reporters in our release notes unless you prefer to remain anonymous.

---

## Firebase Security Model

BrainBerry uses **Firebase** for authentication, data storage, and real-time sync. Our security model is designed in accordance with Firebase's recommended practices.

### Client-Side API Keys Are Public by Design

You will find Firebase API keys in client-side JavaScript files (e.g., `config/firebase-config.js`). **This is intentional and not a security vulnerability.**

Firebase client-side API keys serve as **project identifiers** — they tell Google's servers which Firebase project your app belongs to. They are fundamentally different from traditional server-side secret keys.

**Security is NOT enforced by hiding these keys.** Instead, it is enforced by:

1. **Firebase Security Rules** — Firestore and Authentication rules control who can read and write data. See `config/firestore.rules` for our rule definitions.
2. **Domain Allowlisting** — Firebase API keys are restricted to authorized domains in the Google Cloud Console. Requests from unauthorized domains are rejected.
3. **Firebase App Check** (optional) — Provides additional protection against abuse by verifying that requests come from your genuine app.

> **Note:** If you find a Firebase API key in our source code, please do not report it as a vulnerability. This is the standard architecture for all Firebase web applications, including those built by Google.

### References

- [Firebase: Use API keys with Firebase](https://firebase.google.com/docs/projects/api-keys)
- [Firebase: Understand Firebase Security Rules](https://firebase.google.com/docs/rules)

---

## Authentication

BrainBerry uses **Firebase Authentication** to manage user accounts. The following sign-in providers are supported:

| Provider         | Method                          |
|----------------- |-------------------------------- |
| Email/Password   | Standard email registration     |
| Google           | OAuth 2.0 via Google Sign-In    |
| Facebook         | OAuth 2.0 via Facebook Login    |
| Twitter          | OAuth 1.0a via Twitter Sign-In  |

All authentication flows are handled by Firebase's client SDKs, which manage token generation, session persistence, and secure credential exchange.

---

## Data Handling

### Storage

- **User data** (name, email, age, preferences) is stored in **Firebase Firestore**.
- **Per-user access controls** are enforced via Firestore Security Rules — each user can only read and write their own documents.
- **Sync data** (settings, progress, connection codes) is stored in the `bb_sync` collection with authenticated-user access.
- **Local preferences** (screen time, assigned lessons, activity logs) are stored in the browser's `localStorage`, namespaced per user (`bb_user:<email>:<key>`).

### Data in Transit

- All communication with Firebase services uses **HTTPS/TLS** encryption.
- OAuth tokens are managed by Firebase and never exposed to application code.

### Data at Rest

- Firestore data is encrypted at rest by Google Cloud infrastructure.
- localStorage data is stored unencrypted on the user's device, which is standard for browser-based applications.

---

## Known Security Considerations

The following items are known limitations of the current architecture. They are documented here for transparency:

### 1. Parental PIN Stored Client-Side

The parental control PIN is stored in the browser's `localStorage` (`bb_parent_pin`). This means:

- A technically knowledgeable user with access to the device could inspect or modify the PIN via browser DevTools.
- This is acceptable for the current use case (parental controls for young children) but would not be suitable for high-security scenarios.

**Mitigation:** The PIN provides a sufficient barrier for the target audience (young children). Future versions may move PIN validation to a server-side function.

### 2. Subscription Checks Are Client-Side

Premium feature gating is currently enforced on the client side via the `assets/js/subscription.js` module. This means:

- A technically knowledgeable user could bypass subscription checks by modifying client-side code.
- The current implementation operates in demo mode and does not process real payments.

**Mitigation:** When real subscription billing is implemented, server-side validation via Firebase Cloud Functions or a payment provider webhook will be added.

### 3. Connection Codes

Connection codes that link parent and child accounts are stored in Firestore. While access requires authentication, the codes themselves are short alphanumeric strings.

**Mitigation:** Codes are single-use and tied to a specific user email. Rate limiting and expiration policies should be implemented for production use.

---

## Security Best Practices for Contributors

If you're contributing to BrainBerry, please follow these practices:

- **Never commit secrets** (`.env` files, private keys, service account JSON) to the repository.
- **Use environment variables** for any sensitive configuration. See `.env.example` for the expected format.
- **Validate all user inputs** on both client and server (Firestore Security Rules) sides.
- **Keep dependencies updated** to patch known vulnerabilities.
- **Follow the principle of least privilege** when writing Firestore Security Rules.

---

## Scope

This security policy covers the BrainBerry web application, parent PWA, and associated Firebase backend. It does not cover third-party services (Firebase, Google Cloud, Netlify, Render, Docker Hub) — please refer to their respective security policies for those platforms.

---

Thank you for helping keep BrainBerry safe for children and families. 💜
