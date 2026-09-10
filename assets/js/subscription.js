/**
 * BrainBerry – Premium Subscription Engine
 * ─────────────────────────────────────────
 * Include on: challen.html, chal.html (any page with gated content)
 * DO NOT include on parent.html (parent controls are in parent.html directly)
 *
 * localStorage key:
 *   bb_subscription → "free" | "monthly" | "yearly"
 *
 * Free plan limits:
 *   Challenges  → first 2 accessible, rest locked
 *   Games       → first 1 accessible, rest locked
 *   Customization → always locked on free
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     SECTION 1 – SUBSCRIPTION STATE
  ══════════════════════════════════════════════════════════════ */
  var SUB_KEY = 'bb_subscription';

  function ud() {
    return window.BB_UserData || {
      getItem: function(k){ return localStorage.getItem(k); },
      setItem: function(k,v){ localStorage.setItem(k,v); }
    };
  }

  function getSubscription() {
    return ud().getItem(SUB_KEY) || 'free';
  }

  function isPremium() {
    return true; // DEMO MODE: all features unlocked
    // var sub = getSubscription();
    // return sub === 'monthly' || sub === 'yearly';
  }

  /* Public API */
  window.BB_Subscription = {
    get: getSubscription,
    isPremium: isPremium,
    upgrade: function (plan) {
      if (plan !== 'monthly' && plan !== 'yearly') return;
      ud().setItem(SUB_KEY, plan);
    },
    downgrade: function () {
      ud().setItem(SUB_KEY, 'free');
    }
  };

  /* ══════════════════════════════════════════════════════════════
     SECTION 2 – LOCK OVERLAY STYLES
  ══════════════════════════════════════════════════════════════ */
  var lockStyles = `
    <style id="bb-sub-lock-style">
      .bb-premium-overlay {
        position: absolute;
        inset: 0;
        z-index: 50;
        background: rgba(14, 6, 38, 0.88);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        border-radius: inherit;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        text-align: center;
        pointer-events: all;
        cursor: default;
        animation: bb-sub-fadein 0.3s ease;
      }
      @keyframes bb-sub-fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .bb-premium-overlay .bb-lock-emoji {
        font-size: 2.2rem;
        line-height: 1;
      }
      .bb-premium-overlay .bb-lock-msg {
        font-family: "Fugaz One", "Arial Rounded MT Bold", sans-serif;
        font-size: 0.88rem;
        color: #e9d5ff;
        line-height: 1.4;
        max-width: 160px;
      }
      .bb-premium-overlay .bb-lock-badge {
        background: linear-gradient(135deg, #7c3aed55, #4b2aad55);
        border: 1px solid rgba(167,139,250,0.4);
        border-radius: 50px;
        padding: 3px 12px;
        font-size: 0.72rem;
        font-family: "Fugaz One", sans-serif;
        color: #a78bfa;
        letter-spacing: 0.4px;
      }
      /* Make the parent container relative for overlay positioning */
      .bb-lockable { position: relative !important; overflow: hidden !important; }
      /* Locked items: dim & disable pointer on the content beneath */
      .bb-lockable.bb-locked > *:not(.bb-premium-overlay) {
        pointer-events: none;
        user-select: none;
      }
    </style>
  `;

  /* Inject styles once */
  if (!document.getElementById('bb-sub-lock-style')) {
    document.head.insertAdjacentHTML('beforeend', lockStyles);
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 3 – LOCK HELPERS
  ══════════════════════════════════════════════════════════════ */

  /**
   * Inject a premium overlay into an element.
   * The element must already have position:relative (ensured via .bb-lockable).
   */
  function addLockOverlay(el) {
    if (el.querySelector('.bb-premium-overlay')) return; /* already locked */
    el.classList.add('bb-lockable', 'bb-locked');
    /* Kill the original onclick so clicking it doesn't navigate */
    el.dataset.bbOriginalOnclick = el.getAttribute('onclick') || '';
    el.removeAttribute('onclick');
    el.style.cursor = 'default';

    var overlay = document.createElement('div');
    overlay.className = 'bb-premium-overlay';
    overlay.innerHTML = `
      <div class="bb-lock-emoji">🔒</div>
      <div class="bb-lock-msg">Available in<br>Premium Plan</div>
      <div class="bb-lock-badge">💎 Upgrade to Unlock</div>
    `;
    el.appendChild(overlay);
  }

  /**
   * Remove the premium overlay if the user upgrades.
   */
  function removeLockOverlay(el) {
    var overlay = el.querySelector('.bb-premium-overlay');
    if (overlay) overlay.remove();
    el.classList.remove('bb-lockable', 'bb-locked');
    el.style.cursor = '';
    /* Restore onclick */
    var orig = el.dataset.bbOriginalOnclick;
    if (orig) {
      el.setAttribute('onclick', orig);
      delete el.dataset.bbOriginalOnclick;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 4 – PAGE-SPECIFIC LOCKING
  ══════════════════════════════════════════════════════════════ */

  /* Detect which page we're on */
  var path = window.location.pathname.toLowerCase();
  var isChallengePage = path.endsWith('challen.html');
  var isGamesPage     = path.endsWith('chal.html');

  /**
   * Apply or remove locks based on current subscription.
   * Called on page load and whenever subscription changes.
   */
  function applyFeatureLocks() {
    if (isChallengePage) lockChallenges();
    if (isGamesPage)     lockGames();
  }

  /* ── Challenges: allow first 2, lock the rest ── */
  function lockChallenges() {
    /* Selects all challenge containers in challen.html */
    var containers = document.querySelectorAll('.challenge-container');
    if (!containers.length) return;

    var FREE_LIMIT = 2; /* first N challenges are free */

    containers.forEach(function (el, idx) {
      if (isPremium()) {
        removeLockOverlay(el);
      } else {
        if (idx < FREE_LIMIT) {
          removeLockOverlay(el); /* free challenges – accessible */
        } else {
          addLockOverlay(el);    /* premium-only */
        }
      }
    });
  }

  /* ── Games: allow first 1, lock the rest ── */
  function lockGames() {
    /* Selects all game boxes in chal.html */
    var boxes = document.querySelectorAll('.trans-box');
    if (!boxes.length) return;

    var FREE_LIMIT = 1; /* first N games are free */

    boxes.forEach(function (el, idx) {
      if (isPremium()) {
        removeLockOverlay(el);
      } else {
        if (idx < FREE_LIMIT) {
          removeLockOverlay(el); /* free game – accessible */
        } else {
          addLockOverlay(el);    /* premium-only */
        }
      }
    });
  }

  /* ── Run locks after DOM is ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFeatureLocks);
  } else {
    applyFeatureLocks();
  }

  /* Expose so parent dashboard can trigger a UI refresh if needed */
  window.BB_Subscription.applyLocks = applyFeatureLocks;

})();
