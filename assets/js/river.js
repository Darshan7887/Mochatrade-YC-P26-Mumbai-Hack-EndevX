/* ═══════════════════════════════════════════════════════════
   RIVER CROSSING — BrainBerry Game Logic (river.js)
   Classic puzzle: Farmer, Fox, Sheep, Cabbage
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Constants ── */
  var ENTITIES = [
    { id: 'farmer',  emoji: '👨‍🌾', name: 'Farmer'  },
    { id: 'fox',     emoji: '🦊',   name: 'Fox'     },
    { id: 'sheep',   emoji: '🐑',   name: 'Sheep'   },
    { id: 'cabbage', emoji: '🥬',   name: 'Cabbage' }
  ];

  /* Dangerous pairs (without farmer present) */
  var DANGERS = [
    { a: 'fox',   b: 'sheep',   msg: '🦊 The Fox ate the Sheep!' },
    { a: 'sheep', b: 'cabbage', msg: '🐑 The Sheep ate the Cabbage!' }
  ];

  /* ── State ── */
  var leftBank  = [];   // entity ids on left
  var rightBank = [];   // entity ids on right
  var boatSide  = 'left';
  var passenger = null; // entity id in boat (besides farmer)
  var moves     = 0;
  var gameOver  = false;

  /* ── DOM refs ── */
  var $leftBank   = document.getElementById('rc-left-bank');
  var $rightBank  = document.getElementById('rc-right-bank');
  var $boat       = document.getElementById('rc-boat');
  var $boatLabel  = document.getElementById('rc-boat-label');
  var $msg        = document.getElementById('rc-msg');
  var $movesCount = document.getElementById('rc-moves-count');
  var $btnSail    = document.getElementById('rc-btn-sail');
  var $btnReset   = document.getElementById('rc-btn-reset');
  var $rulesToggle = document.getElementById('rc-rules-toggle');
  var $rulesBox    = document.getElementById('rc-rules-box');
  var $winOverlay  = document.getElementById('rc-win-overlay');
  var $winMoves    = document.getElementById('rc-win-moves');
  var $winPlayAgain = document.getElementById('rc-win-play-again');

  /* ── Helper: find entity object by id ── */
  function ent(id) {
    for (var i = 0; i < ENTITIES.length; i++) {
      if (ENTITIES[i].id === id) return ENTITIES[i];
    }
    return null;
  }

  /* ── Init / Reset ── */
  function init() {
    leftBank  = ENTITIES.map(function (e) { return e.id; });
    rightBank = [];
    boatSide  = 'left';
    passenger = null;
    moves     = 0;
    gameOver  = false;
    $winOverlay.classList.remove('rc-show');
    render();
    setMsg('Click a character on the left bank to board the boat.');
  }

  /* ── Render ── */
  function render() {
    $movesCount.textContent = moves;

    // Render banks
    renderBank($leftBank, leftBank);
    renderBank($rightBank, rightBank);

    // Boat label
    if (passenger) {
      $boatLabel.textContent = '👨‍🌾 + ' + ent(passenger).emoji + ' ' + ent(passenger).name;
    } else {
      $boatLabel.textContent = '👨‍🌾 alone';
    }

    // Sail button text
    if (boatSide === 'left') {
      $btnSail.textContent = '⛵ Row → Right';
    } else {
      $btnSail.textContent = '⛵ Row ← Left';
    }
  }

  function renderBank(container, bankArr) {
    container.innerHTML = '';
    // Only show non-farmer entities on banks (farmer is always implied with boat)
    var showFarmer = bankArr.indexOf('farmer') !== -1;

    bankArr.forEach(function (id) {
      var e = ent(id);
      var div = document.createElement('div');
      div.className = 'rc-entity';
      if (id === passenger) div.classList.add('selected');

      div.innerHTML = '<span>' + e.emoji + '</span>' +
                      '<span class="rc-entity-label">' + e.name + '</span>';

      // Click to board/unboard
      if (!gameOver) {
        div.addEventListener('click', function () {
          handleEntityClick(id, bankArr);
        });
      }

      container.appendChild(div);
    });
  }

  /* ── Entity click handler ── */
  function handleEntityClick(id, bankArr) {
    if (gameOver) return;

    // Determine which bank the boat is at
    var currentBank = boatSide === 'left' ? leftBank : rightBank;

    // Can only interact with entities on the same side as the boat
    if (bankArr !== currentBank) {
      setMsg('⚠️ The boat is on the other side!');
      return;
    }

    if (id === 'farmer') {
      // Farmer is always in the boat — clicking farmer unloads passenger
      if (passenger) {
        // Unload passenger back to bank
        currentBank.push(passenger);
        setMsg(ent(passenger).emoji + ' ' + ent(passenger).name + ' left the boat.');
        passenger = null;
      } else {
        setMsg('👨‍🌾 The farmer steers the boat. Pick a passenger!');
      }
      render();
      return;
    }

    // If this entity is the current passenger (selected), unload them
    if (passenger === id) {
      currentBank.push(passenger);
      setMsg(ent(passenger).emoji + ' ' + ent(passenger).name + ' got off the boat.');
      passenger = null;
      render();
      return;
    }

    // If boat already has a passenger, swap
    if (passenger) {
      currentBank.push(passenger);
      setMsg(ent(passenger).emoji + ' swapped with ' + ent(id).emoji);
    }

    // Board this entity
    var idx = currentBank.indexOf(id);
    if (idx !== -1) {
      currentBank.splice(idx, 1);
      passenger = id;
      setMsg(ent(id).emoji + ' ' + ent(id).name + ' boarded the boat!');
    }

    render();
  }

  /* ── Sail ── */
  function sail() {
    if (gameOver) return;

    var fromBank = boatSide === 'left' ? leftBank : rightBank;
    var toBank   = boatSide === 'left' ? rightBank : leftBank;

    // Remove farmer from current bank
    var farmerIdx = fromBank.indexOf('farmer');
    if (farmerIdx !== -1) fromBank.splice(farmerIdx, 1);

    // Add farmer to destination bank
    toBank.push('farmer');

    // Move passenger too
    if (passenger) {
      toBank.push(passenger);
      passenger = null;
    }

    // Switch boat side
    boatSide = boatSide === 'left' ? 'right' : 'left';
    moves++;

    // Check for danger on the bank we just LEFT
    var dangerResult = checkDanger(fromBank);
    if (dangerResult) {
      gameOver = true;
      render();
      setMsg(dangerResult, true);
      return;
    }

    // Check win
    if (rightBank.length === ENTITIES.length) {
      render();
      setMsg('🎉 Congratulations! Everyone crossed safely!');
      showWin();
      return;
    }

    render();
    setMsg('The boat arrived on the ' + boatSide + ' bank. Moves: ' + moves);
  }

  /* ── Check danger on a bank (no farmer present) ── */
  function checkDanger(bank) {
    if (bank.indexOf('farmer') !== -1) return null; // farmer is watching

    for (var i = 0; i < DANGERS.length; i++) {
      var d = DANGERS[i];
      if (bank.indexOf(d.a) !== -1 && bank.indexOf(d.b) !== -1) {
        return d.msg + ' 💀 Game Over!';
      }
    }
    return null;
  }

  /* ── Show win overlay ── */
  function showWin() {
    gameOver = true;
    $winMoves.textContent = moves;
    $winOverlay.classList.add('rc-show');
  }

  /* ── Set message ── */
  function setMsg(text, isDanger) {
    $msg.textContent = text;
    $msg.className = 'rc-message' + (isDanger ? ' rc-danger' : '');
  }

  /* ── Rules toggle ── */
  $rulesToggle.addEventListener('click', function () {
    var box = $rulesBox;
    if (box.classList.contains('rc-open')) {
      box.classList.remove('rc-open');
      $rulesToggle.textContent = '▼ Show Rules';
    } else {
      box.classList.add('rc-open');
      $rulesToggle.textContent = '▲ Hide Rules';
    }
  });

  /* ── Button events ── */
  $btnSail.addEventListener('click', sail);
  $btnReset.addEventListener('click', init);
  $winPlayAgain.addEventListener('click', init);

  /* ── Start ── */
  init();

})();
