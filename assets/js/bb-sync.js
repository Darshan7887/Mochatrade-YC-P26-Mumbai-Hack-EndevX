/**
 * BrainBerry – Real-time Sync Module (BB_Sync)
 * ─────────────────────────────────────────────
 * Provides Firebase Firestore-based real-time synchronisation
 * for parent ↔ child data (settings, connection codes, progress).
 *
 * This module uses the EXISTING Firebase config already initialised
 * elsewhere in the app (index.html, front.html, etc.).
 * It re-initialises Firebase only if needed (idempotent).
 *
 * REQUIRES: bb-user-data.js to be loaded first.
 *
 * Usage:
 *   BB_Sync.pushSettings()           – push local settings to Firestore
 *   BB_Sync.pullSettings()           – pull cloud settings into localStorage
 *   BB_Sync.syncConnectionCode(code) – store connection code in Firestore
 *   BB_Sync.validateConnectionCode(code, callback) – validate a code
 *   BB_Sync.startRealtimeSync()      – listen for live changes
 *   BB_Sync.stopRealtimeSync()       – stop listening
 */
(function () {
  'use strict';

  /* ── Firebase SDK (loaded from CDN, same version as site) ──────── */
  var _db = null;
  var _unsubscribe = null;

  /* Keys that should be synced to the cloud */
  var SYNC_KEYS = [
    'bb_parent_pin',
    'bb_assigned_lessons',
    'bb_screen_time_limit',
    'bb_screen_time_elapsed',
    'bb_progress',
    'bb_connection_code',
    'bb_todos'
  ];

  /* ── Helpers ──────────────────────────────────────────────────── */

  /** Get the BB_UserData utility (must be loaded first) */
  function ud() {
    return window.BB_UserData || {
      getItem: function (k) { return localStorage.getItem(k); },
      setItem: function (k, v) { localStorage.setItem(k, v); },
      removeItem: function (k) { localStorage.removeItem(k); }
    };
  }

  /** Get the current user email */
  function getUserEmail() {
    var raw = localStorage.getItem('bb_active_user') ||
              localStorage.getItem('userEmail');
    if (raw && raw.indexOf('@') !== -1) {
      return raw;
    }
    return null;
  }

  /** Sanitise an email for use as a Firestore document ID */
  function sanitiseEmail(email) {
    if (!email) return 'guest';
    return email.toLowerCase().trim().replace(/[.#$[\]\/]/g, '_');
  }

  /* ── Lazy Firebase Init ───────────────────────────────────────── */

  /**
   * Returns a Firestore db reference. Lazily initialises Firebase
   * only if no Firebase app is already running.
   */
  async function getDb() {
    if (_db) return _db;

    try {
      /* Dynamic import – same CDN used by the rest of the app */
      var appMod = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
      var fsMod  = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

      var firebaseConfig = {
        apiKey:            'AIzaSyADRJMnuBGNzU_LAOx0bYSg0UvCEXEC7vs',
        authDomain:        'brainberry-96454.firebaseapp.com',
        projectId:         'brainberry-96454',
        storageBucket:     'brainberry-96454.appspot.com',
        messagingSenderId: '819230645241',
        appId:             '1:819230645241:web:698aa272865737ee103b28',
        measurementId:     'G-VVHB92VP3H'
      };

      /* Reuse existing app if one is already initialised */
      var app;
      try {
        app = appMod.getApp();
      } catch (e) {
        app = appMod.initializeApp(firebaseConfig);
      }

      _db = fsMod.getFirestore(app);
      return _db;
    } catch (err) {
      console.warn('[BB_Sync] Firebase init failed (offline?):', err.message);
      return null;
    }
  }

  /* ── Push Local → Cloud ───────────────────────────────────────── */

  /**
   * Pushes user-scoped parental settings from localStorage to Firestore.
   * Call this whenever a parent saves settings.
   */
  async function pushSettings() {
    var email = getUserEmail();
    if (!email) { console.warn('[BB_Sync] No user logged in'); return; }

    var db = await getDb();
    if (!db) return;

    var data = {};
    SYNC_KEYS.forEach(function (key) {
      var val = ud().getItem(key);
      if (val !== null) data[key] = val;
    });
    data._updatedAt = new Date().toISOString();
    data._email = email;

    try {
      var fsMod = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      var docRef = fsMod.doc(db, 'bb_sync', sanitiseEmail(email));
      await fsMod.setDoc(docRef, data, { merge: true });
      console.log('[BB_Sync] ☁️ Settings pushed to cloud');
    } catch (err) {
      console.error('[BB_Sync] Push failed:', err.message);
    }
  }

  /* ── Pull Cloud → Local ───────────────────────────────────────── */

  /**
   * Pulls the latest settings from Firestore into user-scoped localStorage.
   * Call this on page load to get fresh data from the cloud.
   */
  async function pullSettings() {
    var email = getUserEmail();
    if (!email) return;

    var db = await getDb();
    if (!db) return;

    try {
      var fsMod = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      var docRef = fsMod.doc(db, 'bb_sync', sanitiseEmail(email));
      var snap = await fsMod.getDoc(docRef);

      if (snap.exists()) {
        var data = snap.data();
        SYNC_KEYS.forEach(function (key) {
          if (data[key] !== undefined && data[key] !== null) {
            ud().setItem(key, data[key]);
          }
        });
        console.log('[BB_Sync] 📦 Settings pulled from cloud');
      }
    } catch (err) {
      console.error('[BB_Sync] Pull failed:', err.message);
    }
  }

  /* ── Connection Code Sync ─────────────────────────────────────── */

  /**
   * Stores a connection code in Firestore under the user's document
   * AND under a dedicated lookup collection for validation.
   */
  async function syncConnectionCode(code) {
    var email = getUserEmail();
    if (!email || !code) return;

    var db = await getDb();
    if (!db) return;

    try {
      var fsMod = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');

      /* 1. Store in user's sync doc */
      ud().setItem('bb_connection_code', code);

      /* 2. Store in Firestore user doc */
      var userDoc = fsMod.doc(db, 'bb_sync', sanitiseEmail(email));
      await fsMod.setDoc(userDoc, {
        bb_connection_code: code,
        _email: email,
        _updatedAt: new Date().toISOString()
      }, { merge: true });

      /* 3. Store in lookup collection (code → email mapping) */
      var codeDoc = fsMod.doc(db, 'bb_connection_codes', code);
      await fsMod.setDoc(codeDoc, {
        email: email,
        createdAt: new Date().toISOString()
      });

      console.log('[BB_Sync] 🔗 Connection code synced:', code);
    } catch (err) {
      console.error('[BB_Sync] Code sync failed:', err.message);
    }
  }

  /**
   * Validates a connection code against Firestore.
   * Returns the linked email if valid, or null if invalid.
   * @param {string} code  The 6-digit connection code
   * @param {function} callback  function(email) – receives email or null
   */
  async function validateConnectionCode(code, callback) {
    if (!code) { callback(null); return; }

    var db = await getDb();
    if (!db) {
      /* Offline fallback: check all user-scoped localStorage keys */
      console.warn('[BB_Sync] Offline – cannot validate code against cloud');
      callback(null);
      return;
    }

    try {
      var fsMod = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      var codeDoc = fsMod.doc(db, 'bb_connection_codes', code);
      var snap = await fsMod.getDoc(codeDoc);

      if (snap.exists()) {
        var data = snap.data();
        console.log('[BB_Sync] ✅ Code valid, linked to:', data.email);
        callback(data.email);
      } else {
        console.log('[BB_Sync] ❌ Code not found');
        callback(null);
      }
    } catch (err) {
      console.error('[BB_Sync] Validation failed:', err.message);
      callback(null);
    }
  }

  /* ── Real-time Listener ───────────────────────────────────────── */

  /**
   * Starts a real-time Firestore listener on the user's sync document.
   * Any time the parent dashboard saves settings, the child's page
   * will automatically receive the update.
   * @param {function} onChange  Optional callback(data) on each update
   */
  async function startRealtimeSync(onChange) {
    var email = getUserEmail();
    if (!email) return;

    var db = await getDb();
    if (!db) return;

    /* Stop any existing listener first */
    stopRealtimeSync();

    try {
      var fsMod = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js');
      var docRef = fsMod.doc(db, 'bb_sync', sanitiseEmail(email));

      _unsubscribe = fsMod.onSnapshot(docRef, function (snap) {
        if (!snap.exists()) return;
        var data = snap.data();

        /* Apply synced data to user-scoped localStorage */
        SYNC_KEYS.forEach(function (key) {
          if (data[key] !== undefined && data[key] !== null) {
            ud().setItem(key, data[key]);
          }
        });

        console.log('[BB_Sync] 🔄 Real-time update received');
        if (typeof onChange === 'function') onChange(data);
      }, function (err) {
        console.error('[BB_Sync] Listener error:', err.message);
      });

      console.log('[BB_Sync] 📡 Real-time sync started for', email);
    } catch (err) {
      console.error('[BB_Sync] Could not start listener:', err.message);
    }
  }

  /**
   * Stops the real-time listener if one is active.
   */
  function stopRealtimeSync() {
    if (_unsubscribe) {
      _unsubscribe();
      _unsubscribe = null;
      console.log('[BB_Sync] 📡 Real-time sync stopped');
    }
  }

  /* ── Public API ───────────────────────────────────────────────── */
  window.BB_Sync = {
    pushSettings:          pushSettings,
    pullSettings:          pullSettings,
    syncConnectionCode:    syncConnectionCode,
    validateConnectionCode: validateConnectionCode,
    startRealtimeSync:     startRealtimeSync,
    stopRealtimeSync:      stopRealtimeSync
  };

})();
