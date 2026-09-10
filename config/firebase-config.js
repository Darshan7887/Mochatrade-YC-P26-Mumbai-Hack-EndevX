/**
 * BrainBerry – Shared Firebase Configuration
 * ─────────────────────────────────────────────
 * This module centralizes the Firebase configuration used across
 * the entire BrainBerry platform (website, parent app, sync module).
 *
 * SECURITY NOTE:
 * Firebase client-side API keys are DESIGNED to be public.
 * They identify your Firebase project to Google's servers.
 * Security is enforced via:
 *   1. Firebase Security Rules (Firestore, Auth)
 *   2. Domain/app restrictions in Google Cloud Console
 *   3. Firebase App Check (optional)
 *
 * See SECURITY.md for full details.
 *
 * Usage:
 *   <script src="config/firebase-config.js"></script>
 *   // Access via window.BRAINBERRY_FIREBASE_CONFIG
 */
(function () {
  'use strict';

  window.BRAINBERRY_FIREBASE_CONFIG = {
    apiKey:            'AIzaSyADRJMnuBGNzU_LAOx0bYSg0UvCEXEC7vs',
    authDomain:        'brainberry-96454.firebaseapp.com',
    projectId:         'brainberry-96454',
    storageBucket:     'brainberry-96454.appspot.com',
    messagingSenderId: '819230645241',
    appId:             '1:819230645241:web:698aa272865737ee103b28',
    measurementId:     'G-VVHB92VP3H'
  };
})();
