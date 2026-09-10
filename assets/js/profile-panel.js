/**
 * BrainBerry – Global Profile Panel
 * Include this script on EVERY page (before </body>).
 * Features: slide-in panel, view/edit mode, sign-out, Firestore sync.
 */
(function () {

  /* ══════════════════════════════════════════════════════════════
     1. INJECT SIDEBAR HTML + STYLES
  ══════════════════════════════════════════════════════════════ */
  const sidebarHTML = `
  <style>
    /* ── Overlay ─────────────────────────────────────────────── */
    #bb-profile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.40);
      z-index: 1998;
      backdrop-filter: blur(3px);
    }
    #bb-profile-overlay.open { display: block; }

    /* ── Sidebar panel ───────────────────────────────────────── */
    #bb-profile-sidebar {
      position: fixed;
      top: 0;
      right: -340px;
      width: 300px;
      height: 100%;
      background: linear-gradient(160deg, rgba(75,42,173,0.97) 0%, rgba(30,15,80,0.99) 100%);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-left: 1px solid rgba(255,255,255,0.18);
      box-shadow: -6px 0 32px rgba(0,0,0,0.45);
      padding: 28px 22px 24px;
      transition: right 0.35s cubic-bezier(.4,0,.2,1);
      z-index: 1999;
      color: #fff;
      font-family: "Fugaz One", "Arial Rounded MT Bold", sans-serif;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.2) transparent;
    }
    #bb-profile-sidebar::-webkit-scrollbar { width: 4px; }
    #bb-profile-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
    #bb-profile-sidebar.open { right: 0; }

    /* ── Close button ────────────────────────────────────────── */
    #bb-profile-close {
      position: absolute;
      top: 14px; left: 14px;
      width: 32px; height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: none; color: #fff;
      font-size: 18px; line-height: 1;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
      z-index: 2;
    }
    #bb-profile-close:hover { background: rgba(255,255,255,0.3); }

    /* ── Avatar ──────────────────────────────────────────────── */
    #bb-profile-sidebar .bb-avatar {
      display: flex; flex-direction: column; align-items: center;
      margin: 36px 0 20px; gap: 10px;
    }
    #bb-profile-sidebar .bb-avatar img {
      width: 82px; height: 82px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.4);
      object-fit: cover;
      box-shadow: 0 4px 18px rgba(0,0,0,0.4);
    }
    #bb-profile-sidebar .bb-display-name {
      font-size: 1.12rem; font-weight: bold;
      color: #fff; letter-spacing: 0.5px; text-align: center;
    }

    /* ── Edit button (pencil) ────────────────────────────────── */
    #bb-edit-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      background: rgba(255,255,255,0.12);
      border: 1.5px solid rgba(255,255,255,0.28);
      border-radius: 50px;
      color: #fff;
      font-family: "Fugaz One", sans-serif;
      font-size: 0.82rem;
      padding: 7px 18px;
      cursor: pointer;
      margin: 0 auto 18px;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
      letter-spacing: 0.5px;
    }
    #bb-edit-btn:hover {
      background: rgba(255,255,255,0.22);
      border-color: #a78bfa;
      transform: scale(1.04);
    }

    /* ── Info rows (VIEW mode) ───────────────────────────────── */
    #bb-profile-sidebar .bb-info-row {
      display: flex; flex-direction: column; gap: 4px;
      background: rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      transition: border-color 0.2s;
    }
    #bb-profile-sidebar .bb-info-label {
      font-size: 0.68rem; color: #c9b9ff;
      text-transform: uppercase; letter-spacing: 1px;
    }
    #bb-profile-sidebar .bb-info-value {
      font-size: 0.95rem; color: #fff; word-break: break-all;
    }

    /* ── Input fields (EDIT mode) ────────────────────────────── */
    #bb-profile-sidebar .bb-info-row.editing {
      border-color: #a78bfa;
      background: rgba(167,139,250,0.12);
    }
    #bb-profile-sidebar .bb-edit-input {
      background: rgba(255,255,255,0.1);
      border: 1.5px solid rgba(167,139,250,0.5);
      border-radius: 6px;
      color: #fff;
      font-family: "Fugaz One", sans-serif;
      font-size: 0.9rem;
      padding: 6px 10px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    #bb-profile-sidebar .bb-edit-input:focus {
      border-color: #a78bfa;
      background: rgba(255,255,255,0.15);
    }
    #bb-profile-sidebar .bb-edit-input::placeholder { color: rgba(255,255,255,0.4); }

    /* ── Save/Cancel row ─────────────────────────────────────── */
    #bb-edit-actions {
      display: none;
      gap: 10px;
      margin-bottom: 10px;
    }
    #bb-edit-actions.visible { display: flex; }
    #bb-save-btn, #bb-cancel-btn {
      flex: 1;
      padding: 11px 0;
      border: none; border-radius: 50px;
      font-family: "Fugaz One", sans-serif;
      font-size: 0.88rem; cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      letter-spacing: 0.4px;
    }
    #bb-save-btn {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff;
      box-shadow: 0 4px 14px rgba(34,197,94,0.4);
    }
    #bb-save-btn:hover { transform: scale(1.04); box-shadow: 0 6px 20px rgba(34,197,94,0.6); }
    #bb-cancel-btn {
      background: rgba(255,255,255,0.12);
      color: #fff;
      border: 1.5px solid rgba(255,255,255,0.25);
    }
    #bb-cancel-btn:hover { background: rgba(255,255,255,0.2); }

    /* ── Save success toast ──────────────────────────────────── */
    #bb-save-toast {
      display: none;
      align-items: center; justify-content: center; gap: 6px;
      background: rgba(34,197,94,0.2);
      border: 1px solid rgba(34,197,94,0.4);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.82rem;
      color: #86efac;
      margin-bottom: 10px;
      text-align: center;
      animation: bb-fadeIn 0.3s ease;
    }
    #bb-save-toast.visible { display: flex; }
    @keyframes bb-fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Divider ─────────────────────────────────────────────── */
    #bb-profile-sidebar .bb-divider {
      height: 1px;
      background: rgba(255,255,255,0.15);
      margin: 12px 0;
    }

    /* ── Parent Dashboard button ─────────────────────────────── */
    #bb-parent-dashboard-btn {
      padding: 13px 0;
      background: linear-gradient(135deg, #7c3aed, #4b2aad);
      border: none; border-radius: 50px;
      color: #fff;
      font-family: "Fugaz One", sans-serif;
      font-size: 0.95rem; cursor: pointer;
      width: 100%;
      box-shadow: 0 4px 16px rgba(124,58,237,0.45);
      transition: transform 0.15s, box-shadow 0.15s;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    #bb-parent-dashboard-btn:hover { transform: scale(1.04); box-shadow: 0 6px 22px rgba(124,58,237,0.7); }
    #bb-parent-dashboard-btn:active { transform: scale(0.97); }

    /* ── Sign Out button ─────────────────────────────────────── */
    #bb-sign-out-btn {
      padding: 14px 0;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border: none; border-radius: 50px;
      color: #fff;
      font-family: "Fugaz One", sans-serif;
      font-size: 1rem; cursor: pointer;
      width: 100%;
      box-shadow: 0 4px 16px rgba(239,68,68,0.45);
      transition: transform 0.15s, box-shadow 0.15s;
      margin-top: 6px;
      letter-spacing: 0.5px;
    }
    #bb-sign-out-btn:hover { transform: scale(1.04); box-shadow: 0 6px 22px rgba(239,68,68,0.65); }
    #bb-sign-out-btn:active { transform: scale(0.97); }
  </style>

  <!-- Dimmed overlay -->
  <div id="bb-profile-overlay"></div>

  <!-- Sidebar panel -->
  <div id="bb-profile-sidebar">
    <button id="bb-profile-close" title="Close">✕</button>

    <!-- Avatar -->
    <div class="bb-avatar">
      <img src="assets/images/dp-cactus-20.png" alt="User Avatar" id="bb-profile-img"
           onerror="this.src='https://cdn-icons-png.flaticon.com/512/1177/1177568.png'">
      <div class="bb-display-name" id="bb-display-name">—</div>
    </div>

    <!-- ✏️ Edit toggle button -->
    <button id="bb-edit-btn">✏️ Edit Profile</button>

    <!-- Info rows — contain both view spans & hidden edit inputs -->
    <div class="bb-info-row" id="bb-row-name">
      <span class="bb-info-label">👤 Name</span>
      <span class="bb-info-value" id="bb-profile-name">—</span>
      <input class="bb-edit-input" id="bb-input-name" type="text" placeholder="Your name" style="display:none">
    </div>
    <div class="bb-info-row" id="bb-row-age">
      <span class="bb-info-label">🎂 Age</span>
      <span class="bb-info-value" id="bb-profile-age">—</span>
      <input class="bb-edit-input" id="bb-input-age" type="number" min="1" max="120" placeholder="Your age" style="display:none">
    </div>
    <div class="bb-info-row" id="bb-row-email">
      <span class="bb-info-label">✉️ Email</span>
      <span class="bb-info-value" id="bb-profile-email">—</span>
      <input class="bb-edit-input" id="bb-input-email" type="email" placeholder="Your email" style="display:none">
    </div>

    <!-- Save / Cancel (hidden until edit mode) -->
    <div id="bb-edit-actions">
      <button id="bb-save-btn">✅ Save</button>
      <button id="bb-cancel-btn">✕ Cancel</button>
    </div>

    <!-- Success toast -->
    <div id="bb-save-toast">✅ Profile updated!</div>

    <div class="bb-divider"></div>
    <button id="bb-parent-dashboard-btn">🔐 Parent Dashboard</button>
    <button id="bb-sign-out-btn">🚪 Sign Out</button>
  </div>
  `;

  /* Inject at end of body */
  document.body.insertAdjacentHTML('beforeend', sidebarHTML);

  /* ══════════════════════════════════════════════════════════════
     2. STATE
  ══════════════════════════════════════════════════════════════ */
  let isEditMode = false;

  /* ══════════════════════════════════════════════════════════════
     3. LOAD DATA → VIEW MODE
  ══════════════════════════════════════════════════════════════ */
  function loadProfileData() {
    const name  = localStorage.getItem('userName')  || 'Guest';
    const age   = localStorage.getItem('userAge')   || '—';
    const email = localStorage.getItem('userEmail') || 'Not logged in';

    document.getElementById('bb-display-name').textContent  = name;
    document.getElementById('bb-profile-name').textContent  = name;
    document.getElementById('bb-profile-age').textContent   = age;
    document.getElementById('bb-profile-email').textContent = email;

    // ─ Load avatar (per-user record takes priority over flat key) ────────
    var avatarUrl = _getAvatarUrl();
    if (avatarUrl) {
      document.getElementById('bb-profile-img').src = avatarUrl;
    }
  }

  function _getAvatarUrl() {
    var email = localStorage.getItem('brainberry_current_user') ||
                localStorage.getItem('bb_active_user') ||
                localStorage.getItem('userEmail');
    var url = '';
    if (email) {
      try {
        var bbUsers = JSON.parse(localStorage.getItem('brainberry_users') || '{}');
        if (bbUsers[email] && bbUsers[email].avatar) url = bbUsers[email].avatar;
      } catch(e) {}
    }
    if (!url) url = localStorage.getItem('userAvatar') || '';

    // Removed subfolder path logic since all files are in root
    return url;
  }

  /* ══════════════════════════════════════════════════════════════
     4. EDIT MODE ↔ VIEW MODE
  ══════════════════════════════════════════════════════════════ */
  function enterEditMode() {
    isEditMode = true;

    /* Pre-fill inputs with current values */
    document.getElementById('bb-input-name').value  = localStorage.getItem('userName')  || '';
    document.getElementById('bb-input-age').value   = localStorage.getItem('userAge')   || '';
    document.getElementById('bb-input-email').value = localStorage.getItem('userEmail') || '';

    /* Toggle visibility: hide spans, show inputs */
    ['name','age','email'].forEach(function(field) {
      document.getElementById('bb-profile-' + field).style.display = 'none';
      document.getElementById('bb-input-' + field).style.display   = 'block';
      document.getElementById('bb-row-' + field).classList.add('editing');
    });

    document.getElementById('bb-edit-actions').classList.add('visible');
    document.getElementById('bb-edit-btn').style.display   = 'none';
    document.getElementById('bb-save-toast').classList.remove('visible');

    /* Focus name input */
    document.getElementById('bb-input-name').focus();
  }

  function exitEditMode(save) {
    isEditMode = false;

    if (save) {
      const newName  = document.getElementById('bb-input-name').value.trim()  || localStorage.getItem('userName')  || 'Guest';
      const newAge   = document.getElementById('bb-input-age').value.trim()   || localStorage.getItem('userAge')   || '—';
      const newEmail = document.getElementById('bb-input-email').value.trim() || localStorage.getItem('userEmail') || '';

      /* Save to localStorage */
      localStorage.setItem('userName',  newName);
      localStorage.setItem('userAge',   newAge);
      if (newEmail) localStorage.setItem('userEmail', newEmail);

      /* Try to sync to Firestore if db is available globally (from front.html module) */
      tryFirestoreSync(newName, newAge, newEmail);

      /* Update display */
      document.getElementById('bb-display-name').textContent  = newName;
      document.getElementById('bb-profile-name').textContent  = newName;
      document.getElementById('bb-profile-age').textContent   = newAge;
      document.getElementById('bb-profile-email').textContent = newEmail || localStorage.getItem('userEmail');

      /* Show success toast */
      const toast = document.getElementById('bb-save-toast');
      toast.classList.add('visible');
      setTimeout(function() { toast.classList.remove('visible'); }, 2500);
    }

    /* Restore view mode */
    ['name','age','email'].forEach(function(field) {
      document.getElementById('bb-profile-' + field).style.display = '';
      document.getElementById('bb-input-' + field).style.display   = 'none';
      document.getElementById('bb-row-' + field).classList.remove('editing');
    });

    document.getElementById('bb-edit-actions').classList.remove('visible');
    document.getElementById('bb-edit-btn').style.display = '';
  }

  /* ══════════════════════════════════════════════════════════════
     5. FIRESTORE SYNC (best-effort — only if Firebase is loaded)
  ══════════════════════════════════════════════════════════════ */
  function tryFirestoreSync(name, age, email) {
    try {
      /* front.html exposes window.db; import() may work on other pages via CDN */
      if (window.db && window.firestoreSetDoc && window.firestoreDoc) {
        const email_key = email || localStorage.getItem('userEmail');
        if (!email_key) return;
        window.firestoreSetDoc(
          window.firestoreDoc(window.db, 'users', email_key),
          { name: name, age: age, email: email_key },
          { merge: true }
        ).then(function() {
          console.log('✅ Profile synced to Firestore');
        }).catch(function(e) {
          console.warn('⚠️ Firestore sync failed:', e);
        });
      } else {
        /* Fallback: dynamically import Firebase and sync */
        const email_key = email || localStorage.getItem('userEmail');
        if (!email_key) return;
        import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js')
          .then(function(fb) {
            import('https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js')
              .then(function(appFb) {
                /* Re-use existing app if already initialized */
                let app;
                try {
                  app = appFb.getApp();
                } catch(e) {
                  app = appFb.initializeApp({
                    apiKey: "AIzaSyADRJMnuBGNzU_LAOx0bYSg0UvCEXEC7vs",
                    authDomain: "brainberry-96454.firebaseapp.com",
                    projectId: "brainberry-96454",
                    storageBucket: "brainberry-96454.appspot.com",
                    messagingSenderId: "819230645241",
                    appId: "1:819230645241:web:698aa272865737ee103b28"
                  });
                }
                const db = fb.getFirestore(app);
                fb.setDoc(fb.doc(db, 'users', email_key), { name, age, email: email_key }, { merge: true })
                  .then(function() { console.log('✅ Profile synced to Firestore (dynamic)'); })
                  .catch(function(e) { console.warn('⚠️ Firestore sync failed:', e); });
              });
          }).catch(function() {
            console.log('ℹ️ Firestore unavailable — changes saved to localStorage only');
          });
      }
    } catch(e) {
      console.warn('⚠️ Firestore sync skipped:', e);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     6. OPEN / CLOSE
  ══════════════════════════════════════════════════════════════ */
  function openProfile() {
    /* Always start in view mode */
    if (isEditMode) exitEditMode(false);
    loadProfileData();
    document.getElementById('bb-profile-sidebar').classList.add('open');
    document.getElementById('bb-profile-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProfile() {
    /* If editing and user closes without saving, discard changes */
    if (isEditMode) exitEditMode(false);
    document.getElementById('bb-profile-sidebar').classList.remove('open');
    document.getElementById('bb-profile-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  window.toggleProfile = function () {
    const sidebar = document.getElementById('bb-profile-sidebar');
    if (sidebar.classList.contains('open')) closeProfile();
    else openProfile();
  };

  /* ══════════════════════════════════════════════════════════════
     7. WIRE UP ALL BUTTONS
  ══════════════════════════════════════════════════════════════ */
  document.getElementById('bb-profile-close').addEventListener('click', closeProfile);
  document.getElementById('bb-profile-overlay').addEventListener('click', function() {
    /* Prevent accidental data loss — only close if NOT editing */
    if (!isEditMode) closeProfile();
  });

  document.getElementById('bb-edit-btn').addEventListener('click', enterEditMode);
  document.getElementById('bb-save-btn').addEventListener('click', function() { exitEditMode(true); });
  document.getElementById('bb-cancel-btn').addEventListener('click', function() { exitEditMode(false); });

  /* Allow Enter key to save in any edit input */
  ['bb-input-name','bb-input-age','bb-input-email'].forEach(function(id) {
    document.getElementById(id).addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); exitEditMode(true); }
      if (e.key === 'Escape') { e.preventDefault(); exitEditMode(false); }
    });
  });

  /* Parent Dashboard */
  document.getElementById('bb-parent-dashboard-btn').addEventListener('click', function () {
    window.location.href = 'parent.html';
  });

  /* Sign Out
   * Only clear identity keys.  Parental-control data is stored under
   * a user-scoped namespace (bb_user:<email>:*) via bb-user-data.js,
   * so it stays safe in localStorage and reloads automatically when
   * the same user logs back in. */
  document.getElementById('bb-sign-out-btn').addEventListener('click', function () {
    // Clear only the identity keys — NOT parental control / progress data
    localStorage.removeItem('userName');
    localStorage.removeItem('userAge');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userAvatarKey');
    localStorage.removeItem('brainberry_current_user');
    window.location.href = 'index.html';
  });

  /* ══════════════════════════════════════════════════════════════
     8. AUTO-WIRE NAVBAR PROFILE IMAGE CLICK
  ══════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.profile img, .profile').forEach(function (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', openProfile);
    });
    document.querySelectorAll('#profileToggle, .profile-toggle').forEach(function (el) {
      el.addEventListener('click', openProfile);
    });
    loadProfileData();

    // Apply avatar to every navbar .profile img and #profileToggle on this page
    var avatarUrl = _getAvatarUrl();
    if (avatarUrl) {
      document.querySelectorAll('.profile img').forEach(function(img) {
        img.src = avatarUrl;
      });
      var toggle = document.getElementById('profileToggle');
      if (toggle && toggle.tagName === 'IMG') toggle.src = avatarUrl;
    }
  });

})();
