/* ── DATA: Fill in the Blanks ── */
const questions = [
  { sentence: "I say <span class='blank'>____</span> when I hurt someone.", answer: "Sorry", options: ["Thank you", "Please", "Sorry", "Goodbye"] },
  { sentence: "I say <span class='blank'>____</span> when I receive a gift.", answer: "Thank you", options: ["Thank you", "Please", "Sorry", "Good Night"] },
  { sentence: "I say <span class='blank'>____</span> when I politely want a chocolate.", answer: "Please", options: ["Thank you", "Please", "Sorry", "Welcome"] },
  { sentence: "Is it okay to disrespect elders and teachers?", answer: "No", options: ["Yes", "No", "Maybe", "Sometimes"] },
  { sentence: "When you meet your teacher in the morning, what do you say?", answer: "Good Morning", options: ["Good Morning", "Good Night", "Good Bye", "Sorry"] },
  { sentence: "When you leave someone, what do you say?", answer: "Good Bye", options: ["Good Morning", "Good Night", "Good Bye", "Please"] },
  { sentence: "If someone helps you, what do you say?", answer: "Thank you", options: ["Thank you", "Please", "Sorry", "No thanks"] },
];

let currentIndex = 0;
let score = 0;
let streak = 0;
let answered = false;

/* ── Element Targets ── */
const progFill = document.getElementById('progFill');
const streakBadge = document.getElementById('streakBadge');
const streakVal = document.getElementById('streakVal');
const questionText = document.getElementById('questionText');
const optionsGrid = document.getElementById('optionsGrid');
const feedbackTray = document.getElementById('feedbackTray');
const fbMessage = document.getElementById('fbMessage');
const btnMic = document.getElementById('btnMic');

/* ── Initialization ── */
function loadQuestion() {
  if (currentIndex >= questions.length) {
    showGameOver();
    return;
  }
  answered = false;
  
  // Update progress
  progFill.style.width = `${(currentIndex / questions.length) * 100}%`;
  
  // Hide tray
  feedbackTray.classList.remove('show', 'correct', 'wrong');
  
  const q = questions[currentIndex];
  questionText.innerHTML = `"${q.sentence}"`;
  
  optionsGrid.innerHTML = '';
  // Shuffle options
  let opts = [...q.options].sort(() => Math.random() - 0.5);
  
  opts.forEach(opt => {
    let btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt, btn);
    optionsGrid.appendChild(btn);
  });
}

/* ── Audio / Read ── */
function playSfx(url) {
  let a = new Audio(url);
  a.volume = 0.5;
  a.play().catch(()=>{});
}

function readQuestion() {
  window.speechSynthesis.cancel();
  // Drop the HTML blank span to "blank" for the reader
  let pureText = questions[currentIndex].sentence.replace("<span class='blank'>____</span>", "blank");
  let utter = new SpeechSynthesisUtterance(pureText);
  utter.rate = 0.9;
  
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha')));
  if(preferred) utter.voice = preferred;

  window.speechSynthesis.speak(utter);
}

/* ── Answer Validation ── */
function checkAnswer(userStr, btnNode) {
  if (answered) return;
  answered = true;
  
  // Disable options so user can't double tap
  document.querySelectorAll('.btn-option').forEach(b => b.disabled = true);
  
  const correctStr = questions[currentIndex].answer;
  const isCorrect = userStr.toLowerCase().trim() === correctStr.toLowerCase().trim();
  
  if (isCorrect) {
    if(btnNode) btnNode.classList.add('correct');
    
    // Fill blank visually with correct word
    let blankTag = questionText.querySelector('.blank');
    if(blankTag) {
        blankTag.textContent = correctStr;
        blankTag.style.border = 'none';
        blankTag.style.color = '#10b981';
    }
    
    score += 10;
    streak++;
    if(streak > 1) {
      streakBadge.classList.add('show');
      streakVal.textContent = streak;
    }
    fbMessage.innerHTML = '✨ Correct! <strong>+10 XP</strong>';
    feedbackTray.className = 'feedback-tray show correct';
    playSfx('audio/click.mp3');
    triggerConfetti();
  } else {
    if(btnNode) btnNode.classList.add('wrong');
    // Highlight the button that WAS the true correct one
    Array.from(document.querySelectorAll('.btn-option')).forEach(b => {
      if(b.textContent.toLowerCase() === correctStr.toLowerCase()) b.classList.add('correct');
    });
    
    streak = 0;
    streakBadge.classList.remove('show');
    fbMessage.innerHTML = `❌ Correct answer: ${correctStr}`;
    feedbackTray.className = 'feedback-tray show wrong';
    playSfx('audio/error.mp3');
  }
  
  // Auto-advance after 2 seconds so user can read feedback
  setTimeout(() => {
    currentIndex++;
    let progress = Math.round((currentIndex / questions.length) * 100);
    localStorage.setItem("mission1_progress", progress.toString());
    loadQuestion();
  }, 2200);
}

/* ── Game Over Panel ── */
function showGameOver() {
  progFill.style.width = '100%';
  document.getElementById('gameCard').style.display = 'none';
  document.getElementById('finalScore').textContent = score;
  document.getElementById('gameOver').classList.add('show');
  triggerConfetti();
}

/* ── Voice Answer (Mic) System ── */
if ("webkitSpeechRecognition" in window) {
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  
  btnMic.onclick = () => {
    if(answered) return;
    btnMic.classList.add('recording');
    recognition.start();
  };
  
  recognition.onresult = (event) => {
    btnMic.classList.remove('recording');
    const transcript = event.results[0][0].transcript;
    
    // Evaluate voice matches against options
    const qOpts = questions[currentIndex].options;
    let matched = qOpts.find(o => transcript.toLowerCase().includes(o.toLowerCase()));
    if(!matched) matched = transcript; 
    
    // Simulate clicking the matched button to trigger animations
    let foundNode = null;
    document.querySelectorAll('.btn-option').forEach(n => {
      if(n.textContent.toLowerCase() === matched.toLowerCase()) foundNode = n;
    });
    
    if(foundNode) {
        checkAnswer(matched, foundNode);
    } else {
        // Dummy element if they said completely wrong gibberish not on board
        let dummyNode = document.createElement('div');
        checkAnswer(matched, dummyNode);
    }
  };
  recognition.onerror = () => btnMic.classList.remove('recording');
  recognition.onend = () => btnMic.classList.remove('recording');
} else {
  btnMic.style.display = 'none'; // hide if not supported
}

/* ── Confetti Physics Engine ── */
const cCanvas = document.getElementById('confettiCanvas');
const ctx = cCanvas.getContext('2d');
cCanvas.width = window.innerWidth;
cCanvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  cCanvas.width = window.innerWidth;
  cCanvas.height = window.innerHeight;
});

let particles = [];
const colors = ['#FFD700', '#3B82F6', '#EC4899', '#22C55E', '#A855F7'];

function triggerConfetti() {
    for(let i=0; i<120; i++) {
        particles.push({
            x: cCanvas.width/2, 
            y: cCanvas.height/2 + 100,
            vx: (Math.random()-0.5)*20,
            vy: (Math.random()-1)*20,
            size: Math.random()*8 + 4,
            color: colors[Math.floor(Math.random()*colors.length)],
            life: 100 + Math.random()*40
        });
    }
    if(!animating) drawConfetti();
}

let animating = false;
function drawConfetti() {
    animating = true;
    ctx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    let active = false;
    particles.forEach(p => {
        if(p.life <= 0) return;
        active = true;
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // gravity
        p.vx *= 0.98; // friction

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 50 > 1 ? 1 : p.life / 50;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    });
    if(active) requestAnimationFrame(drawConfetti);
    else {
        ctx.clearRect(0,0,cCanvas.width,cCanvas.height);
        animating = false;
    }
}

/* Boot Game */
document.addEventListener('DOMContentLoaded', loadQuestion);
loadQuestion(); // Call it immediately since script is at body end