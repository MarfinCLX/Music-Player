let isUserScrolling = false;
let scrollTimeout;

// Отслеживаем скролл пользователя, чтобы не вырывать экран
function handleUserScroll() {
    isUserScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
    }, 3000);
}

window.addEventListener('wheel', handleUserScroll);
window.addEventListener('touchmove', handleUserScroll);

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

let audioCtx;
let analyser;
let data;
let animation;

function initVisualizer() {
    if(audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    data = new Uint8Array(analyser.frequencyBinCount);
}

function draw() {
    animation = requestAnimationFrame(draw);

    if(!analyser) {
        return;
    }
    analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, 500, 500);

    const cx = 250;
    const cy = 250;

    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);

    const glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 180);
    glow.addColorStop(0, 'rgba(255,0,80,.12)');
    glow.addColorStop(1, 'rgba(255,0,80,0)');

    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10,10,10,.65)';
    ctx.fill();

    ctx.beginPath();
    let prevWave = 0;

    for(let i = 0; i <= 80; i++) {
        const index = Math.floor(i * data.length / 80);
        const angle = (i / 80) * Math.PI * 2 + performance.now() * 0.00015;
        const rawWave = Math.min(Math.pow((data[index] || 0) / 255, 1.1) * 150, 70);
        const smoothWave = prevWave * 0.3 + rawWave * 0.7;
        prevWave = smoothWave;

        const side = 0.75 + Math.pow(Math.cos(angle), 2) * 0.45;
        const pulse = Math.sin(performance.now() * 0.003) * 5;
        const radius = 145 + smoothWave * side + pulse;

        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,80,140,.65)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 55;
    ctx.stroke();
}

const lines = document.querySelectorAll('.lyrics-line');
const audio = document.querySelector('audio');

audio.addEventListener('play', () => {
    document.body.classList.add('bg-playing');
    initVisualizer();
    draw();
});

audio.addEventListener('pause', () => {
    cancelAnimationFrame(animation);
    ctx.clearRect(0, 0, 500, 500);
    lines.forEach(line => line.classList.remove('active'));
    document.body.classList.remove('bg-playing');
});

audio.addEventListener('timeupdate', () => {
    if (audio.paused) return;
    const time = audio.currentTime;

    let currentLine = null;

    // 1. Сначала ищем нужную строку
    lines.forEach(line => {
        const start = parseFloat(line.getAttribute('data-start'));
        if (time >= start) {
            currentLine = line;
        }
    });

    // 2. Снимаем выделение со всех строк
    lines.forEach(line => line.classList.remove('active'));

    // 3. Выделяем текущую и скроллим
    if (currentLine) {
        currentLine.classList.add('active');

        // Скроллим только если пользователь не трогал экран последние 3 секунды
        if (!isUserScrolling) {
            currentLine.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
});