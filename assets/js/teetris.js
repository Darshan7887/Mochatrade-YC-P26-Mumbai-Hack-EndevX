/**
 * tetris.js — Full Tetris engine
 * Completely self-contained IIFE; no globals exported.
 *
 * Sections:
 *   1. Constants & Configuration
 *   2. Tetromino definitions
 *   3. Game state
 *   4. Grid utilities
 *   5. Piece logic (spawn, move, rotate, lock)
 *   6. Line clearing & scoring
 *   7. Rendering (canvas)
 *   8. Game loop
 *   9. Controls (keyboard + touch)
 *  10. UI helpers
 *  11. Bootstrap
 */

(function () {
    "use strict";

    /* ═══════════════════════════════════════════════════
       1. CONSTANTS & CONFIGURATION
       ═══════════════════════════════════════════════════ */
    const COLS = 10;
    const ROWS = 20;
    const BLOCK = 30;          // px per cell on main board
    const NEXT_BLOCK = 22;         // px per cell on next-piece preview
    const CANVAS_W = COLS * BLOCK;
    const CANVAS_H = ROWS * BLOCK;

    /** Drop interval in ms for each level (0-indexed, capped at level 15) */
    const LEVEL_SPEEDS = [
        800, 720, 640, 560, 480, 400, 330, 270, 210,
        160, 120, 100, 80, 65, 50, 40,
    ];

    const LINES_PER_LEVEL = 10;

    /** Score for clearing N lines at once (classic Tetris scoring) */
    const LINE_SCORES = [0, 100, 300, 500, 800];

    /* ═══════════════════════════════════════════════════
       2. TETROMINO DEFINITIONS
       ═══════════════════════════════════════════════════ */
    //  Each shape is a 4×4 grid of 0/1
    const TETROMINOES = {
        I: {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            color: "#00e5ff",
            glow: "rgba(0,229,255,0.55)",
        },
        O: {
            shape: [
                [1, 1],
                [1, 1],
            ],
            color: "#ffcc00",
            glow: "rgba(255,204,0,0.55)",
        },
        T: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],
            color: "#cc00ff",
            glow: "rgba(204,0,255,0.55)",
        },
        L: {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ],
            color: "#ff9100",
            glow: "rgba(255,145,0,0.55)",
        },
        J: {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ],
            color: "#448aff",
            glow: "rgba(68,138,255,0.55)",
        },
        S: {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
            ],
            color: "#69f0ae",
            glow: "rgba(105,240,174,0.55)",
        },
        Z: {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ],
            color: "#ff5252",
            glow: "rgba(255,82,82,0.55)",
        },
    };

    const PIECE_KEYS = Object.keys(TETROMINOES);

    /* ═══════════════════════════════════════════════════
       3. GAME STATE
       ═══════════════════════════════════════════════════ */
    let grid = [];   // 2D array [row][col] → null | color string
    let current = null; // { shape, color, glow, x, y }
    let nextPiece = null;
    let score = 0;
    let lines = 0;
    let level = 0;
    let gameOver = false;
    let paused = false;
    let started = false;
    let dropTimer = 0;
    let lastTime = 0;
    let rafId = null;

    /* ═══════════════════════════════════════════════════
       4. GRID UTILITIES
       ═══════════════════════════════════════════════════ */
    function createGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }

    function isValidPos(shape, ox, oy) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const gr = oy + r;
                const gc = ox + c;
                if (gc < 0 || gc >= COLS || gr >= ROWS) return false;
                if (gr >= 0 && grid[gr][gc]) return false;
            }
        }
        return true;
    }

    /* ═══════════════════════════════════════════════════
       5. PIECE LOGIC
       ═══════════════════════════════════════════════════ */
    function randomPiece() {
        const key = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
        const def = TETROMINOES[key];
        // Deep-clone shape
        return {
            shape: def.shape.map(r => [...r]),
            color: def.color,
            glow: def.glow,
        };
    }

    function spawnPiece() {
        current = nextPiece || randomPiece();
        nextPiece = randomPiece();

        current.x = Math.floor((COLS - current.shape[0].length) / 2);
        current.y = 0;

        // Game over: new piece collides immediately
        if (!isValidPos(current.shape, current.x, current.y)) {
            triggerGameOver();
        }
    }

    function rotateCW(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const result = Array.from({ length: cols }, () => Array(rows).fill(0));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                result[c][rows - 1 - r] = shape[r][c];
            }
        }
        return result;
    }

    /** Wall-kick: try rotated piece, nudge left/right if needed */
    function tryRotate() {
        if (!current || gameOver || paused) return;
        const rotated = rotateCW(current.shape);
        const kicks = [0, -1, 1, -2, 2];
        for (const kick of kicks) {
            if (isValidPos(rotated, current.x + kick, current.y)) {
                current.shape = rotated;
                current.x += kick;
                return;
            }
        }
    }

    function moveLeft() { if (current && isValidPos(current.shape, current.x - 1, current.y)) current.x--; }
    function moveRight() { if (current && isValidPos(current.shape, current.x + 1, current.y)) current.x++; }

    function softDrop() {
        if (!current || gameOver || paused) return;
        if (isValidPos(current.shape, current.x, current.y + 1)) {
            current.y++;
            score += 1;
            updateScoreUI();
        } else {
            lockPiece();
        }
        dropTimer = 0; // reset auto-drop timer
    }

    function hardDrop() {
        if (!current || gameOver || paused) return;
        while (isValidPos(current.shape, current.x, current.y + 1)) {
            current.y++;
            score += 2;
        }
        lockPiece();
        dropTimer = 0;
    }

    function lockPiece() {
        // Write piece into grid
        for (let r = 0; r < current.shape.length; r++) {
            for (let c = 0; c < current.shape[r].length; c++) {
                if (!current.shape[r][c]) continue;
                const gr = current.y + r;
                const gc = current.x + c;
                if (gr < 0) { triggerGameOver(); return; }
                grid[gr][gc] = current.color;
            }
        }
        clearLines();
        spawnPiece();
        renderNext();
    }

    /* ═══════════════════════════════════════════════════
       6. LINE CLEARING & SCORING
       ═══════════════════════════════════════════════════ */
    function clearLines() {
        let cleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (grid[r].every(cell => cell !== null)) {
                grid.splice(r, 1);
                grid.unshift(Array(COLS).fill(null));
                cleared++;
                r++; // recheck same index
            }
        }
        if (cleared > 0) {
            score += LINE_SCORES[Math.min(cleared, 4)] * (level + 1);
            lines += cleared;
            level = Math.floor(lines / LINES_PER_LEVEL);
            updateScoreUI();
        }
    }

    /* ═══════════════════════════════════════════════════
       7. RENDERING
       ═══════════════════════════════════════════════════ */
    const canvas = document.getElementById("tt-canvas");
    const ctx = canvas.getContext("2d");
    const nextCvs = document.getElementById("tt-next-canvas");
    const nCtx = nextCvs.getContext("2d");

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    nextCvs.width = 4 * NEXT_BLOCK;
    nextCvs.height = 4 * NEXT_BLOCK;

    function drawBlock(context, x, y, size, color, glowColor) {
        // Glow
        if (glowColor) {
            context.shadowBlur = 12;
            context.shadowColor = glowColor;
        }
        // Main fill
        context.fillStyle = color;
        context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);

        // Highlight edge (top-left)
        context.fillStyle = "rgba(255,255,255,0.28)";
        context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
        context.fillRect(x * size + 1, y * size + 1, 4, size - 2);

        // Shadow edge (bottom-right)
        context.fillStyle = "rgba(0,0,0,0.3)";
        context.fillRect(x * size + 1, y * size + size - 5, size - 2, 4);
        context.fillRect(x * size + size - 5, y * size + 1, 4, size - 2);

        context.shadowBlur = 0;
        context.shadowColor = "transparent";
    }

    /** Ghost piece position (hard-drop preview) */
    function getGhostY() {
        if (!current) return null;
        let gy = current.y;
        while (isValidPos(current.shape, current.x, gy + 1)) gy++;
        return gy;
    }

    function renderBoard() {
        // Clear
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Grid lines
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        for (let r = 0; r <= ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * BLOCK);
            ctx.lineTo(CANVAS_W, r * BLOCK);
            ctx.stroke();
        }
        for (let c = 0; c <= COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(c * BLOCK, 0);
            ctx.lineTo(c * BLOCK, CANVAS_H);
            ctx.stroke();
        }

        // Locked cells
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) {
                    drawBlock(ctx, c, r, BLOCK, grid[r][c], null);
                }
            }
        }

        if (current) {
            // Ghost piece
            const gy = getGhostY();
            if (gy !== current.y) {
                for (let r = 0; r < current.shape.length; r++) {
                    for (let c = 0; c < current.shape[r].length; c++) {
                        if (!current.shape[r][c]) continue;
                        ctx.fillStyle = "rgba(255,255,255,0.08)";
                        ctx.strokeStyle = "rgba(255,255,255,0.18)";
                        ctx.lineWidth = 1;
                        const px = (current.x + c) * BLOCK + 1;
                        const py = (gy + r) * BLOCK + 1;
                        ctx.fillRect(px, py, BLOCK - 2, BLOCK - 2);
                        ctx.strokeRect(px, py, BLOCK - 2, BLOCK - 2);
                    }
                }
            }

            // Active piece
            for (let r = 0; r < current.shape.length; r++) {
                for (let c = 0; c < current.shape[r].length; c++) {
                    if (!current.shape[r][c]) continue;
                    drawBlock(ctx, current.x + c, current.y + r, BLOCK, current.color, current.glow);
                }
            }
        }
    }

    function renderNext() {
        nCtx.fillStyle = "#0a0a1a";
        nCtx.fillRect(0, 0, nextCvs.width, nextCvs.height);
        if (!nextPiece) return;

        const shape = nextPiece.shape;
        const offX = Math.floor((4 - shape[0].length) / 2);
        const offY = Math.floor((4 - shape.length) / 2);

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                drawBlock(nCtx, offX + c, offY + r, NEXT_BLOCK, nextPiece.color, nextPiece.glow);
            }
        }
    }

    /* ═══════════════════════════════════════════════════
       8. GAME LOOP
       ═══════════════════════════════════════════════════ */
    function gameLoop(timestamp) {
        if (!started || gameOver) return;
        if (!paused) {
            const delta = timestamp - lastTime;
            dropTimer += delta;

            const speed = LEVEL_SPEEDS[Math.min(level, LEVEL_SPEEDS.length - 1)];
            if (dropTimer >= speed) {
                dropTimer = 0;
                if (current && isValidPos(current.shape, current.x, current.y + 1)) {
                    current.y++;
                } else if (current) {
                    lockPiece();
                }
            }
            renderBoard();
        }
        lastTime = timestamp;
        rafId = requestAnimationFrame(gameLoop);
    }

    /* ═══════════════════════════════════════════════════
       9. CONTROLS
       ═══════════════════════════════════════════════════ */
    // ── Keyboard ───────────────────────────────────────
    document.addEventListener("keydown", function (e) {
        if (!started || gameOver) return;
        switch (e.code) {
            case "ArrowLeft": e.preventDefault(); moveLeft(); break;
            case "ArrowRight": e.preventDefault(); moveRight(); break;
            case "ArrowDown": e.preventDefault(); softDrop(); break;
            case "ArrowUp": e.preventDefault(); tryRotate(); break;
            case "KeyZ": e.preventDefault(); tryRotate(); break;
            case "Space": e.preventDefault(); hardDrop(); break;
            case "KeyP":
            case "Escape":
                e.preventDefault();
                togglePause();
                break;
        }
    });

    // ── Touch / swipe (mobile) ──────────────────────────
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    canvas.addEventListener("touchstart", function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchend", function (e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const dt = Date.now() - touchStartTime;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);

        if (adx < 10 && ady < 10 && dt < 200) {
            // Tap → rotate
            tryRotate();
        } else if (adx > ady) {
            // Horizontal swipe
            if (dx < -20) moveLeft();
            else if (dx > 20) moveRight();
        } else {
            // Vertical swipe
            if (dy > 20) softDrop();
            else if (dy < -40) hardDrop();
        }
        e.preventDefault();
    }, { passive: false });

    /* ═══════════════════════════════════════════════════
       10. UI HELPERS
       ═══════════════════════════════════════════════════ */
    const scoreEl = document.getElementById("tt-score");
    const linesEl = document.getElementById("tt-lines");
    const levelEl = document.getElementById("tt-level");
    const levelFill = document.getElementById("tt-level-fill");
    const overlay = document.getElementById("tt-overlay");
    const overlayH2 = document.getElementById("tt-overlay-title");
    const overlayMsg = document.getElementById("tt-overlay-msg");
    const overlayScore = document.getElementById("tt-overlay-score");
    const btnStart = document.getElementById("tt-btn-start");
    const btnRestart = document.getElementById("tt-btn-restart");

    function updateScoreUI() {
        var prevLevel = parseInt(levelEl.textContent || '1') - 1;
        scoreEl.textContent = score;
        linesEl.textContent = lines;
        levelEl.textContent = level + 1;
        const fillPct = ((lines % LINES_PER_LEVEL) / LINES_PER_LEVEL) * 100;
        levelFill.style.width = fillPct + "%";

        // Score pop animation
        scoreEl.classList.remove('tt-pop');
        void scoreEl.offsetWidth; // reflow
        scoreEl.classList.add('tt-pop');

        // Level-up glow burst on canvas
        if (level > prevLevel && level > 0) {
            var boardWrap = document.querySelector('.tt-board-wrap');
            if (boardWrap) {
                boardWrap.classList.add('tt-levelup');
                setTimeout(function() { boardWrap.classList.remove('tt-levelup'); }, 1600);
            }
        }
    }

    function showOverlay(title, msg) {
        overlayH2.textContent = title;
        overlayMsg.textContent = msg;
        overlayScore.textContent = "Score: " + score;
        overlay.classList.add("tt-show");
    }

    function hideOverlay() {
        overlay.classList.remove("tt-show");
    }

    function togglePause() {
        if (!started || gameOver) return;
        paused = !paused;
        if (paused) {
            showOverlay("⏸ Paused", "Press P or Esc to resume");
        } else {
            hideOverlay();
            lastTime = performance.now();
        }
    }

    function triggerGameOver() {
        gameOver = true;
        cancelAnimationFrame(rafId);
        renderBoard(); // final frame
        setTimeout(() => showOverlay("GAME OVER", ""), 200);
    }

    function startGame() {
        grid = createGrid();
        score = 0;
        lines = 0;
        level = 0;
        gameOver = false;
        paused = false;
        started = true;
        dropTimer = 0;
        current = null;
        nextPiece = randomPiece();

        updateScoreUI();
        hideOverlay();
        spawnPiece();
        renderNext();

        cancelAnimationFrame(rafId);
        lastTime = performance.now();
        rafId = requestAnimationFrame(gameLoop);

        btnStart.style.display = "none";
        btnRestart.style.display = "block";
    }

    /* ── Button wires ──────────────────────────────────── */
    btnStart.addEventListener("click", startGame);
    btnRestart.addEventListener("click", startGame);

    document.getElementById("tt-btn-resume").addEventListener("click", () => {
        if (paused) togglePause();
    });

    /* ═══════════════════════════════════════════════════
       11. BOOTSTRAP — draw empty board on load
       ═══════════════════════════════════════════════════ */
    grid = createGrid();
    renderBoard();
    renderNext();

    // draw "TETRIS" on blank board as placeholder
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.font = "bold 36px 'Fugaz One', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TETRIS", CANVAS_W / 2, CANVAS_H / 2 - 20);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("Click START to play", CANVAS_W / 2, CANVAS_H / 2 + 26);

})();
