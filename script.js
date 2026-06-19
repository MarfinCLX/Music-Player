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

    audioCtx = new AudioContext();

    const source = audioCtx.createMediaElementSource(audio);

    analyser = audioCtx.createAnalyser();

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    data = new Uint8Array(analyser.frequencyBinCount);

    /* drawVisualizer(); */
}

function draw(){

animation =
requestAnimationFrame(draw);

if(!analyser) {
return;
}
analyser.getByteFrequencyData(data);

ctx.clearRect(0, 0, 500, 500);

const cx = 250;
const cy = 250;


ctx.beginPath();

ctx.arc(cx, cy, 120, 0, Math.PI * 2);

const glow =
ctx.createRadialGradient(cx, cy, 30, cx, cy, 180);

glow.addColorStop(0, 'rgba(255,0,80,.12)');

glow.addColorStop(1, 'rgba(255,0,80,0)');

ctx.fillStyle = glow;

ctx.fill();

ctx.beginPath();

ctx.arc(cx, cy, 90, 0, Math.PI * 2);

ctx.fillStyle = 'rgba(10,10,10,.65)';

ctx.fill();

ctx.beginPath();

for( let i=0; i<80; i++) {

const angle = (i/80) * Math.PI * 2;

const wave = data[i] * 0.45;

const side = Math.pow(Math.sin(angle), 2);

const radius = 140 + wave * side;

const x = cx + Math.cos(angle) * radius;

const y = cy + Math.sin(angle) * radius;

if(i === 0) {
ctx.moveTo(x, y);
} else {
ctx.lineTo(x, y);
}
}

ctx.closePath();

ctx.strokeStyle =
'rgba(255,80,140,.65)';

ctx.shadowBlur = 30;

ctx.lineWidth = 3;

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
    /* document.body.classList.remove('bg-prechorus');
    document.body.classList.remove('bg-chorus'); */
});

audio.addEventListener('timeupdate', () => {
    if (audio.paused) return;
    const time = audio.currentTime;

    if (time < 36) {
        document.body.classList.remove('bg-prechorus');
        document.body.classList.remove('bg-chorus');
    } else if (time >= 36 && time < 51) {
        document.body.classList.add('bg-prechorus');
        document.body.classList.remove('bg-chorus');
    } else if (time >= 51 && time < 68.4) {
        document.body.classList.remove('bg-prechorus');
        document.body.classList.add('bg-chorus');
    }

let currentLine = null;

lines.forEach(line => {
const start = parseFloat(line.getAttribute('data-start'));
const end = parseFloat(line.getAttribute('data-end'))

if (time >= start) {
    currentLine = line;
}
});

lines.forEach(line => line.classList.remove('active'));

if (currentLine) {
    currentLine.classList.add('active');
}

});