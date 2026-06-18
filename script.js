const lines = document.querySelectorAll('.lyrics-line');
const audio = document.querySelector('audio');

audio.addEventListener('play', () => {
    document.body.classList.add('bg-playing');
});

audio.addEventListener('pause', () => {
    document.body.classList.remove('bg-playing');
    document.body.classList.remove('bg-prechorus');
    document.body.classList.remove('bg-chorus');
    lines.forEach(line => line.classList.remove('active'));
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

if (time >= start) {
    currentLine = line;
}
});

lines.forEach(line => line.classList.remove('active'));

if (currentLine) {
    currentLine.classList.add('active');
}

});