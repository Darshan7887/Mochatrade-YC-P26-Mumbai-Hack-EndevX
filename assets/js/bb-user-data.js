/**
 * BrainBerry – Per-User Data Namespace Utility
 * ─────────────────────────────────────────────
 * All parental-control settings are stored under a user-scoped key:
 *   bb_user:<email>:<setting_key>
 *
 * This means every user (child account) has their own:
 *   • Parent PIN
 *   • Lesson assignments (locked/unlocked)
 *   • Screen time limit & elapsed
 *   • Subscription plan
 *   • Learning progress
 *   • Completed lessons
 *   • To-Do list
 *
 * For a brand-new user (nothing set yet):
 *   • All lessons are UNLOCKED by default
 *   • No screen time limit
 *   • No PIN set (parent must set one)
 *   • Subscription: free
 *
 * Include this script BEFORE parental-control.js and parent.html scripts.
 */
(function () {
  'use strict';

  /**
   * Returns the current logged-in user's email (sanitised) as a namespace key.
   * Falls back to "guest" when no user is logged in.
   */
  function currentUserKey() {
    // bb_active_user is the canonical key used by both the website and the Parent App.
    // userEmail is the legacy fallback set by the website login flow.
    var email = localStorage.getItem('bb_active_user') ||
                localStorage.getItem('userEmail') || 'guest';
    // Sanitise: strip characters that could cause issues as key prefixes
    return 'bb_user:' + email.toLowerCase().trim() + ':';
  }

  /**
   * Builds a namespaced localStorage key for the given logical key name.
   * @param {string} key  e.g. 'bb_parent_pin'
   * @returns {string}    e.g. 'bb_user:alice@example.com:bb_parent_pin'
   */
  function userKey(key) {
    return currentUserKey() + key;
  }

  /**
   * Read a user-scoped value. Returns null if not found.
   */
  function getItem(key) {
    return localStorage.getItem(userKey(key));
  }

  /**
   * Write a user-scoped value.
   */
  function setItem(key, value) {
    localStorage.setItem(userKey(key), value);
  }

  /**
   * Remove a user-scoped value.
   */
  function removeItem(key) {
    localStorage.removeItem(userKey(key));
  }

  /**
   * Returns true if this user has NEVER had parental controls configured.
   * (i.e. no PIN stored and no assignment stored for this user)
   */
  function isNewUser() {
    return getItem('bb_parent_pin') === null &&
           getItem('bb_assigned_lessons') === null;
  }

  // ── Expose public API on window ──────────────────────────────────────────
  window.BB_UserData = {
    /**
     * Get the full namespaced key string (for direct localStorage use if needed).
     * Prefer using getItem/setItem/removeItem instead.
     */
    key: userKey,

    /** Read a user-scoped value */
    getItem: getItem,

    /** Write a user-scoped value */
    setItem: setItem,

    /** Delete a user-scoped value */
    removeItem: removeItem,

    /**
     * Returns true if the user has no parental control data set yet.
     * Useful to show "set up parent controls" on first visit.
     */
    isNewUser: isNewUser,

    /**
     * Returns the namespace prefix for the current user.
     * Useful for debugging.
     */
    currentPrefix: currentUserKey
  };

})();
