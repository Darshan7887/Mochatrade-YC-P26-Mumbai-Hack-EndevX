/**
 * BrainBerry – Monitoring & Activity Tracking Module (BB_Monitor)
 * ───────────────────────────────────────────────────────────────
 * Lightweight activity and progress tracking hooks.
 * All data is stored per-user via BB_UserData (user-scoped localStorage).
 * Optionally synced to Firestore when BB_Sync is available.
 *
 * REQUIRES: bb-user-data.js to be loaded first.
 *
 * NO UI CHANGES – this module only collects data.
 *
 * Usage:
 *   BB_Monitor.logPageView('front.html')
 *   BB_Monitor.logLessonStart('phonics')
 *   BB_Monitor.logLessonComplete('phonics', 85)
 *   BB_Monitor.getActivityLog()
 *   BB_Monitor.getUsageStats()
 */
(function () {
  'use strict';

  var LOG_KEY = 'bb_activity_log';
  var STATS_KEY = 'bb_usage_stats';
  var MAX_LOG_ENTRIES = 500;

  /* ── Helpers ──────────────────────────────────────────────────── */

  function ud() {
    return window.BB_UserData || {
      getItem: function (k) { return localStorage.getItem(k); },
      setItem: function (k, v) { localStorage.setItem(k, v); }
    };
  }

  function now() {
    return new Date().toISOString();
  }

  function loadLog() {
    try {
      return JSON.parse(ud().getItem(LOG_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveLog(log) {
    /* Trim to max entries to prevent localStorage bloat */
    if (log.length > MAX_LOG_ENTRIES) {
      log = log.slice(log.length - MAX_LOG_ENTRIES);
    }
    ud().setItem(LOG_KEY, JSON.stringify(log));
  }

  function loadStats() {
    try {
      return JSON.parse(ud().getItem(STATS_KEY)) || {
        totalPageViews: 0,
        totalLessonsStarted: 0,
        totalLessonsCompleted: 0,
        totalSessionSeconds: 0,
        averageScore: 0,
        scores: [],
        firstSeen: now(),
        lastSeen: now()
      };
    } catch (e) {
      return {
        totalPageViews: 0,
        totalLessonsStarted: 0,
        totalLessonsCompleted: 0,
        totalSessionSeconds: 0,
        averageScore: 0,
        scores: [],
        firstSeen: now(),
        lastSeen: now()
      };
    }
  }

  function saveStats(stats) {
    stats.lastSeen = now();
    ud().setItem(STATS_KEY, JSON.stringify(stats));
  }

  /* ── Session Tracking ─────────────────────────────────────────── */

  var _sessionStart = Date.now();

  function getSessionDuration() {
    return Math.floor((Date.now() - _sessionStart) / 1000);
  }

  /* Save session duration when the user leaves the page */
  window.addEventListener('beforeunload', function () {
    var duration = getSessionDuration();
    if (duration > 2) { /* Only log meaningful sessions (>2 seconds) */
      var stats = loadStats();
      stats.totalSessionSeconds += duration;
      saveStats(stats);

      /* Log the session end */
      var log = loadLog();
      log.push({
        type: 'session_end',
        duration: duration,
        timestamp: now()
      });
      saveLog(log);
    }
  });

  /* ── Public API ───────────────────────────────────────────────── */

  window.BB_Monitor = {

    /**
     * Log a page view.
     * @param {string} pageName  e.g. 'front.html', 'Less.html'
     */
    logPageView: function (pageName) {
      var log = loadLog();
      log.push({
        type: 'page_view',
        page: pageName || window.location.pathname,
        timestamp: now()
      });
      saveLog(log);

      var stats = loadStats();
      stats.totalPageViews++;
      saveStats(stats);

      console.log('[BB_Monitor] 📄 Page view:', pageName || window.location.pathname);
    },

    /**
     * Log lesson start.
     * @param {string} lessonId  e.g. 'phonics', 'animals', 'NunInd'
     */
    logLessonStart: function (lessonId) {
      var log = loadLog();
      log.push({
        type: 'lesson_start',
        lesson: lessonId,
        timestamp: now()
      });
      saveLog(log);

      var stats = loadStats();
      stats.totalLessonsStarted++;
      saveStats(stats);

      console.log('[BB_Monitor] 📘 Lesson started:', lessonId);
    },

    /**
     * Log lesson completion with optional score.
     * @param {string} lessonId  e.g. 'phonics', 'animals'
     * @param {number} score     Optional score (0-100)
     */
    logLessonComplete: function (lessonId, score) {
      var log = loadLog();
      var entry = {
        type: 'lesson_complete',
        lesson: lessonId,
        timestamp: now()
      };
      if (typeof score === 'number') entry.score = score;
      log.push(entry);
      saveLog(log);

      var stats = loadStats();
      stats.totalLessonsCompleted++;
      if (typeof score === 'number') {
        stats.scores.push(score);
        /* Keep only last 50 scores to prevent bloat */
        if (stats.scores.length > 50) {
          stats.scores = stats.scores.slice(stats.scores.length - 50);
        }
        /* Recalculate average */
        var sum = stats.scores.reduce(function (a, b) { return a + b; }, 0);
        stats.averageScore = Math.round(sum / stats.scores.length);
      }
      saveStats(stats);

      /* Also update BB_Progress if available */
      if (window.BB_Progress && typeof window.BB_Progress.completeLesson === 'function') {
        window.BB_Progress.completeLesson();
      }

      console.log('[BB_Monitor] ✅ Lesson completed:', lessonId, score !== undefined ? 'Score: ' + score : '');
    },

    /**
     * Log a custom event.
     * @param {string} eventName  Custom event name
     * @param {object} metadata   Optional key-value metadata
     */
    logEvent: function (eventName, metadata) {
      var log = loadLog();
      var entry = {
        type: 'custom',
        event: eventName,
        timestamp: now()
      };
      if (metadata) entry.metadata = metadata;
      log.push(entry);
      saveLog(log);
      console.log('[BB_Monitor] 📌 Event:', eventName);
    },

    /**
     * Returns the full activity log array.
     * @returns {Array} List of activity entries
     */
    getActivityLog: function () {
      return loadLog();
    },

    /**
     * Returns aggregated usage statistics.
     * @returns {Object} Stats object
     */
    getUsageStats: function () {
      var stats = loadStats();
      stats.currentSessionSeconds = getSessionDuration();
      return stats;
    },

    /**
     * Clears all monitoring data for the current user.
     */
    reset: function () {
      ud().setItem(LOG_KEY, '[]');
      saveStats({
        totalPageViews: 0,
        totalLessonsStarted: 0,
        totalLessonsCompleted: 0,
        totalSessionSeconds: 0,
        averageScore: 0,
        scores: [],
        firstSeen: now(),
        lastSeen: now()
      });
      console.log('[BB_Monitor] 🗑️ Monitoring data reset');
    }
  };

  /* ── Auto-track current page view on load ─────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.BB_Monitor.logPageView();
    });
  } else {
    window.BB_Monitor.logPageView();
  }

})();
