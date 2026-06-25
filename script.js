const lines = document.querySelectorAll('.lyrics-line');
const volBars = document.querySelectorAll('.vol-bar');
const audio = document.querySelector('audio');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const playPauseBtn = document.getElementById('play-pause-btn');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');
const progressBar = document.getElementById('progress-bar');
const progressFilled = document.getElementById('progress-filled');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const tracklistBtn = document.getElementById('tracklist-toggle');
const tracklistDropdown = document.getElementById('tracklist-dropdown');

let isUserScrolling = false;
let scrollTimeout;
let audioCtx;
let analyser;
let data;
let animation;

canvas.width = 500;
canvas.height = 500;

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00"; 
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

audio.addEventListener('loadedmetadata', () => {
timeTotal.textContent = formatTime(audio.duration);
});

if (audio.readyState >= 1) {
    timeTotal.textContent = formatTime(audio.duration);
}

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

    if (!analyser) {
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

audio.addEventListener('play', () => {
    document.body.classList.add('bg-playing');
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
     initVisualizer();
    draw();
});

audio.addEventListener('pause', () => {
    cancelAnimationFrame(animation);
    ctx.clearRect(0, 0, 500, 500);
    lines.forEach(line => line.classList.remove('active'));
    document.body.classList.remove('bg-playing');
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
});

audio.addEventListener('timeupdate', () => {
    const time = audio.currentTime;

    if (audio.duration) {
        const percentage = (time / audio.duration) * 100;
        progressFilled.style.width = `${percentage}%`;
        timeCurrent.textContent = formatTime(time);
    }

    if (audio.paused) return;

    let currentLine = null;

    lines.forEach(line => {
        const start = parseFloat(line.getAttribute('data-start'));
        if (time >= start) {
            currentLine = line;
        }
    });

    lines.forEach(line => line.classList.remove('active'));

    if (currentLine) {
        currentLine.classList.add('active');

        if (!isUserScrolling) {
            currentLine.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
});

audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audio.duration);
});

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});

progressBar.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercentage = clickX / width;

    audio.currentTime = clickPercentage * audio.duration;
});

function handleUserScroll() {
    isUserScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
    }, 7500);
}

window.addEventListener('wheel', handleUserScroll);
window.addEventListener('touchmove', handleUserScroll);

function initNeonBorders() {
    const aboutSection = document.querySelector('.about-song');
    const path1 = document.querySelector('.about-song-neon-path.path-1');
    const path2 = document.querySelector('.about-song-neon-path.path-2');

    if (!aboutSection || !path1 || !path2 ) {
        return;
    }

    const width = aboutSection.offsetWidth;
    const height = aboutSection.offsetHeight;
    const halfPerimeter = width +  height;
    const pathA = `M 0 0 H ${width} V ${height}`;
    const pathB = `M ${width} ${height} H 0 V 0`;

    path1.setAttribute('d', pathA);
    path2.setAttribute('d', pathB);

    aboutSection.style.setProperty('--path-length', halfPerimeter + 'px');

    }

window.addEventListener('resize', initNeonBorders);
initNeonBorders();

audio.volume = 0.6;

volBars.forEach( bar => {
    bar.addEventListener('click', (e) => {
        const clickedLevel = parseFloat(e.target.getAttribute('data-level'));

        audio.volume = clickedLevel;

        volBars.forEach(b => {
            const barLevel = parseFloat(b.getAttribute('data-level'));
                if ( barLevel <= clickedLevel) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
        });
    });
});

tracklistBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    tracklistDropdown.classList.toggle('open');
});

document.addEventListener('clicl', (e) => {
    if (!tracklistDropdown.contains(e.target) && e.target !== tracklistBtn) {
        tracklistDropdown.classList.remove('open');
    }
});