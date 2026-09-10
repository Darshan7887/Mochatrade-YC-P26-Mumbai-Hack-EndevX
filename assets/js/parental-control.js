/**
 * BrainBerry – Parental Control Engine
 * ─────────────────────────────────────
 * Include this script on EVERY learning page (before </body>).
 * REQUIRES bb-user-data.js to be loaded first.
 *
 * It provides:
 *   1. Screen Time tracking + full-screen lock when limit is hit.
 *   2. Global progress API: window.BB_Progress.recordCorrect() etc.
 *
 * All data is stored PER USER using BB_UserData (namespaced by email).
 * Keys used (under each user's namespace):
 *   bb_screen_time_limit   → number (seconds). 0 = no limit.
 *   bb_screen_time_elapsed → number (total seconds used so far).
 *   bb_progress            → JSON { correct, wrong, lessonsCompleted }
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     SECTION 1 – SCREEN TIME
  ══════════════════════════════════════════════════════════════ */

  /* ── Inject lock overlay styles + HTML ── */
  const lockCSS = `
    <style id="bb-lock-style">
      /* Fullscreen time-up overlay */
      #bb-lock-overlay {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: linear-gradient(145deg, rgba(20,8,60,0.97) 0%, rgba(75,42,173,0.97) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 22px;
        font-family: "Fugaz One", "Arial Rounded MT Bold", sans-serif;
        color: #fff;
        text-align: center;
        pointer-events: all;
        user-select: none;
      }
      #bb-lock-overlay.active {
        display: flex;
        animation: bb-lock-fadein 0.5s ease;
      }
      @keyframes bb-lock-fadein {
        from { opacity: 0; transform: scale(1.04); }
        to   { opacity: 1; transform: scale(1); }
      }
      #bb-lock-overlay .bb-lock-icon {
        font-size: 5rem;
        line-height: 1;
        animation: bb-lock-bounce 1.6s infinite ease-in-out;
      }
      @keyframes bb-lock-bounce {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-12px); }
      }
      #bb-lock-overlay .bb-lock-title {
        font-size: 2.2rem;
        text-shadow: 0 3px 12px rgba(0,0,0,0.5);
        max-width: 520px;
        line-height: 1.25;
      }
      #bb-lock-overlay .bb-lock-sub {
        font-size: 1.1rem;
        color: rgba(255,255,255,0.75);
        max-width: 380px;
        font-family: sans-serif;
        font-weight: 500;
        line-height: 1.5;
      }
      #bb-lock-overlay .bb-lock-badge {
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
        border-radius: 50px;
        padding: 10px 28px;
        font-size: 0.85rem;
        color: rgba(255,255,255,0.6);
        letter-spacing: 0.5px;
      }
      /* Screen time HUD (top-right corner, always visible when limit is active) */
      #bb-time-hud {
        display: none;
        position: fixed;
        top: 72px;
        right: 14px;
        z-index: 9000;
        background: rgba(75,42,173,0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 50px;
        padding: 5px 14px;
        font-family: "Fugaz One", sans-serif;
        font-size: 0.8rem;
        color: #fff;
        letter-spacing: 0.5px;
        pointer-events: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: color 0.3s;
      }
      #bb-time-hud.warning { color: #fbbf24; }
      #bb-time-hud.critical { color: #f87171; animation: bb-hud-blink 0.8s infinite; }
      @keyframes bb-hud-blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.5; }
      }
    </style>
    <!-- Lock overlay -->
    <div id="bb-lock-overlay">
      <div class="bb-lock-icon">⏰</div>
      <div class="bb-lock-title">Time's up!<br>Come back later 😊</div>
      <div class="bb-lock-sub">Your parent will unlock the app for you. Keep up the great learning!</div>
      <div class="bb-lock-badge">🔐 Ask a parent to reset your screen time</div>
    </div>
    <!-- HUD -->
    <div id="bb-time-hud"></div>
  `;

  /* Inject after body opens (safe even if called before DOMContentLoaded) */
  function injectLockUI() {
    document.body.insertAdjacentHTML('beforeend', lockCSS);
  }

  /* ── State ── */
  var _tickInterval = null;
  var _locked = false;

  /* ── Helpers (all reads/writes go through BB_UserData) ── */
  function ud() {
    /* Safely return BB_UserData – falls back to raw localStorage if the
       utility script somehow wasn't loaded yet. */
    return window.BB_UserData || {
      getItem: function(k){ return localStorage.getItem(k); },
      setItem: function(k,v){ localStorage.setItem(k,v); },
      removeItem: function(k){ localStorage.removeItem(k); }
    };
  }

  function getLimit()   { return parseInt(ud().getItem('bb_screen_time_limit') || '0', 10); }
  function getElapsed() { return parseInt(ud().getItem('bb_screen_time_elapsed') || '0', 10); }
  function setElapsed(v){ ud().setItem('bb_screen_time_elapsed', String(v)); }

  function formatRemaining(secs) {
    if (secs <= 0) return '0:00';
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ── Lock the screen ── */
  function lockScreen() {
    if (_locked) return;
    _locked = true;
    clearInterval(_tickInterval);
    var overlay = document.getElementById('bb-lock-overlay');
    var hud = document.getElementById('bb-time-hud');
    if (overlay) overlay.classList.add('active');
    if (hud) hud.style.display = 'none';
    /* Block all keyboard shortcuts too */
    document.addEventListener('keydown', function(e){ e.preventDefault(); e.stopPropagation(); }, true);
  }

  /* ── Update HUD display ── */
  function updateHUD(remaining) {
    var hud = document.getElementById('bb-time-hud');
    if (!hud) return;
    hud.style.display = 'block';
    hud.textContent = '⏱ ' + formatRemaining(remaining) + ' left';
    var limit = getLimit();
    var pct = remaining / limit;
    hud.classList.remove('warning', 'critical');
    if (pct <= 0.15)      hud.classList.add('critical');
    else if (pct <= 0.33) hud.classList.add('warning');
  }

  /* ── Main tick (every 1 second) ── */
  function tick() {
    var limit   = getLimit();
    if (!limit) return; /* No limit set – do nothing */

    var elapsed = getElapsed() + 1;
    setElapsed(elapsed);

    var remaining = limit - elapsed;
    if (remaining <= 0) {
      lockScreen();
    } else {
      updateHUD(remaining);
    }
  }

  /* ── Start the timer (called on page load) ── */
  function startScreenTimer() {
    var limit = getLimit();
    if (!limit) return; /* No limit configured by parent */

    var elapsed = getElapsed();

    /* Already past the limit (e.g. page was refreshed) */
    if (elapsed >= limit) {
      injectLockUI();
      /* Wait for DOM before showing */
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', lockScreen);
      } else {
        lockScreen();
      }
      return;
    }

    /* Normal path: inject UI then start ticking */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        injectLockUI();
        updateHUD(limit - elapsed);
        _tickInterval = setInterval(tick, 1000);
      });
    } else {
      injectLockUI();
      updateHUD(limit - elapsed);
      _tickInterval = setInterval(tick, 1000);
    }
  }

  /* SKIP screen time on parent.html itself */
  if (!window.location.pathname.endsWith('parent.html')) {
    startScreenTimer();
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 2 – PROGRESS TRACKER API
  ══════════════════════════════════════════════════════════════ */

  var PROGRESS_KEY = 'bb_progress';

  function loadProgress() {
    try {
      return JSON.parse(ud().getItem(PROGRESS_KEY)) || { correct: 0, wrong: 0, lessonsCompleted: 0 };
    } catch(e) {
      return { correct: 0, wrong: 0, lessonsCompleted: 0 };
    }
  }

  function saveProgress(p) {
    ud().setItem(PROGRESS_KEY, JSON.stringify(p));
  }

  /* Public API exposed on window.BB_Progress */
  window.BB_Progress = {
    /** Call after a correct answer */
    recordCorrect: function() {
      var p = loadProgress();
      p.correct++;
      saveProgress(p);
    },
    /** Call after a wrong answer */
    recordWrong: function() {
      var p = loadProgress();
      p.wrong++;
      saveProgress(p);
    },
    /** Call when a lesson / module is fully completed */
    completeLesson: function() {
      var p = loadProgress();
      p.lessonsCompleted++;
      saveProgress(p);
    },
    /** Returns a copy of the current progress object */
    get: function() {
      return loadProgress();
    },
    /** Resets all progress to zero */
    reset: function() {
      saveProgress({ correct: 0, wrong: 0, lessonsCompleted: 0 });
    }
  };

  /* ══════════════════════════════════════════════════════════════
     SECTION 3 – SCREEN TIME PUBLIC API (used by parent.html)
  ══════════════════════════════════════════════════════════════ */

  window.BB_ScreenTime = {
    /** Set limit in seconds. Pass 0 to disable. */
    setLimit: function(seconds) {
      ud().setItem('bb_screen_time_limit', String(seconds));
    },
    /** Reset elapsed time back to 0. */
    reset: function() {
      setElapsed(0);
      ud().removeItem('bb_screen_time_start');
    },
    /** Returns { limit, elapsed, remaining } in seconds. */
    getStatus: function() {
      var limit   = getLimit();
      var elapsed = getElapsed();
      return {
        limit:     limit,
        elapsed:   elapsed,
        remaining: Math.max(0, limit - elapsed)
      };
    }
  };

  /* ══════════════════════════════════════════════════════════════
     SECTION 4 – AUTO-START REAL-TIME SYNC ON CHILD PAGES
     ──────────────────────────────────────────────────────────────
     This ensures that when a parent changes settings (screen time,
     assigned lessons, etc.) from their phone, the child's page
     picks up the update INSTANTLY via Firestore onSnapshot.

     It dynamically loads bb-sync.js if not already present, then
     starts the real-time listener with a callback that re-evaluates
     screen-time limits whenever new data arrives from the cloud.
  ══════════════════════════════════════════════════════════════ */

  function autoStartSync() {
    /* Don't run on parent pages */
    var path = window.location.pathname;
    if (path.indexOf('parent') !== -1) return;

    function beginSync() {
      if (!window.BB_Sync || !window.BB_Sync.startRealtimeSync) return;

      BB_Sync.startRealtimeSync(function(data) {
        /* Re-read screen-time values that were just written to localStorage */
        var limit = getLimit();
        var elapsed = getElapsed();

        if (limit && elapsed >= limit && !_locked) {
          injectLockUI();
          lockScreen();
        } else if (limit && !_locked) {
          updateHUD(limit - elapsed);
        }
        console.log('[BB_PC] 🔄 Parent settings applied in real-time');
      });
    }

    /* If BB_Sync is already loaded, just start */
    if (window.BB_Sync) {
      beginSync();
      return;
    }

    /* Otherwise, dynamically inject the sync script */
    var scriptPath = 'assets/js/bb-sync.js';
    var s = document.createElement('script');
    s.src = scriptPath;
    s.onload = function() {
      /* Give BB_Sync IIFE a tick to execute */
      setTimeout(beginSync, 100);
    };
    s.onerror = function() {
      console.warn('[BB_PC] Could not load bb-sync.js — offline sync disabled');
    };
    document.head.appendChild(s);
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoStartSync);
  } else {
    autoStartSync();
  }

})();
