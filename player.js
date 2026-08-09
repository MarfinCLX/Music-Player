document.addEventListener('DOMContentLoaded', () => {

function renderTrackPage(track) {
    document.getElementById('page-title').textContent = `${track.artist} - ${track.title}`;
    document.getElementById('song-title').textContent = track.title;
    document.getElementById('band-name').textContent = track.artist;
    document.getElementById('producers-names').textContent = track.producers || '';

    const coverImg = document.getElementById('cover-img');
    coverImg.src = track.cover || '';
    coverImg.alt = `Cover art for ${track.title} by ${track.artist}`;

    const audioSource = document.getElementById('audio-source');
    audioSource.src = track.audio || '';
    document.getElementById('audio').load();

    document.getElementById('release-date-text').textContent = track.releaseDate || '';

    const downloadLink = document.getElementById('download-link');
    if (track.audio) {
        downloadLink.href = track.audio;
        downloadLink.setAttribute('download', track.audio.split('/').pop());
        downloadLink.style.display = '';
    } else {
        downloadLink.style.display = 'none';
    }

    document.getElementById('lyrics-heading').textContent =
        `[Текст песни ${track.artist} «${track.title}»]`;

    const lyricsContainer = document.getElementById('lyrics-container');
    lyricsContainer.innerHTML = '';

    (track.lyrics || []).forEach(item => {
        if (item.type === 'title') {
            const p = document.createElement('p');
            p.className = 'lyrics-part-title';
            p.textContent = item.text;
            lyricsContainer.appendChild(p);
            lyricsContainer.appendChild(document.createElement('br'));
        } else if (item.type === 'line') {
            const p = document.createElement('p');
            p.className = 'lyrics-line';
            p.setAttribute('data-start', item.start);
            p.textContent = item.text;
            lyricsContainer.appendChild(p);
        } else if (item.type === 'icon') {
            const p = document.createElement('p');
            p.className = 'lyrics-line music-icon';
            p.setAttribute('data-start', item.start);
            p.textContent = '♫';
            lyricsContainer.appendChild(p);
        }
    });

    document.getElementById('about-subtitle').textContent =
        (track.about && track.about.subtitle) || 'Song bio';

    const aboutParagraphs = document.getElementById('about-paragraphs');
    aboutParagraphs.innerHTML = '';
    ((track.about && track.about.paragraphs) || []).forEach(text => {
        const p = document.createElement('p');
        p.className = 'about-song-text';
        p.textContent = text;
        aboutParagraphs.appendChild(p);
    });
}

const urlParams = new URLSearchParams(window.location.search);
const requestedId = parseInt(urlParams.get('id'));
const currentTrack = testTracks.find(t => t.id === requestedId) || testTracks[0];
renderTrackPage(currentTrack);

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
const listEl = document.getElementById('tracks-vector-list');
const searchInput = document.getElementById('input-search');
const filtersBtns = document.querySelectorAll('.filter-btn');
const previewAudio = new Audio();

let isUserScrolling = false;
let scrollTimeout;
let audioCtx;
let analyser;
let data;
let animation;

let previewTrackId = null;
let mainWasPlaying = false;
const RING_R = 36;
const RING_CIRC = 2 * Math.PI * RING_R;

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
    if (audioCtx) return;

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
    if (!analyser) return;

    analyser.getByteFrequencyData(data);
    ctx.clearRect(0, 0, 500, 500);

    const cx = 250;
    const cy = 250;

    const bassEnd = Math.floor(data.length * 0.12);
    let bassSum = 0;
    for (let i = 0; i < bassEnd; i++) bassSum += data[i];
    const bassAvg = bassSum / bassEnd / 255;

    const glowRadius = 150 + bassAvg * 60;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, glowRadius);
    glow.addColorStop(0, `rgba(255, 0, 80, ${0.10 + bassAvg * 0.18})`);
    glow.addColorStop(1, 'rgba(255, 0, 80, 0)');
    ctx.fillStyle = glow;
    ctx.fill();

    const coreRadius = 96 + bassAvg * 10;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8,6,8,.7)';
    ctx.fill();

    ctx.beginPath();
    let prevWave = 0;
    const points = 90;

    for (let i = 0; i <= points; i++) {
        const index = Math.floor(i * data.length / points);
        const angle = (i / points) * Math.PI * 2 + performance.now() * 0.00015;
        const rawWave = Math.pow(data[index] / 255, 1.15) * 150;
        const smoothWave = prevWave * 0.35 + rawWave * 0.65;
        prevWave = smoothWave;

        const side = 0.75 + Math.pow(Math.cos(angle), 2) * 0.45;
        const pulse = Math.sin(performance.now() * 0.003) * 5 + bassAvg * 14;
        const radius = 145 + smoothWave * side * 0.55 + pulse;

        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.strokeStyle = `rgba(255, ${Math.floor(60 + bassAvg * 60)}, 140, ${0.55 + bassAvg * 0.35})`;
    ctx.lineWidth = 2 + bassAvg * 1.5;
    ctx.shadowBlur = 45 + bassAvg * 35;
    ctx.shadowColor = 'rgba(255,0,85,0.9)';
    ctx.stroke();

    const trebleStart = Math.floor(data.length * 0.55);
    const spikeCount = 40;

    for (let i = 0; i < spikeCount; i++) {
        const index = trebleStart + Math.floor(i * (data.length - trebleStart) / spikeCount);
        const val = data[index] / 255;
        if (val < 0.35) continue;

        const angle = (i / spikeCount) * Math.PI * 2 - performance.now() * 0.0001;
        const rInner = 195;
        const rOuter = rInner + val * 45;

        const x1 = cx + Math.cos(angle) * rInner;
        const y1 = cy + Math.sin(angle) * rInner;
        const x2 = cx + Math.cos(angle) * rOuter;
        const y2 = cy + Math.sin(angle) * rOuter;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(255,255,255,${val * 0.5})`;
        ctx.lineWidth = 1.4;
        ctx.shadowBlur = 10;
        ctx.stroke();
    }
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
    document.querySelectorAll('.lyrics-line').forEach(line => line.classList.remove('active'));
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

    const lines = document.querySelectorAll('.lyrics-line');
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

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        if (previewTrackId !== null) {
            stopPreview(false);
        }
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

function initNeonBorderRect(containerSel, path1Sel, path2Sel) {
    const container = document.querySelector(containerSel);
    const path1 = document.querySelector(path1Sel);
    const path2 = document.querySelector(path2Sel);

    if (!container || !path1 || !path2) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const halfPerimeter = width + height;
    const pathA = `M 0 0 H ${width} V ${height}`;
    const pathB = `M ${width} ${height} H 0 V 0`;

    path1.setAttribute('d', pathA);
    path2.setAttribute('d', pathB);
    container.style.setProperty('--path-length', halfPerimeter + 'px');
}

function initAllNeonBorders() {
    initNeonBorderRect('.about-song', '.about-song-neon-path.path-1', '.about-song-neon-path.path-2');
    initNeonBorderRect('.header-container', '.header-neon-path.path-1', '.header-neon-path.path-2');
    initNeonBorderRect('footer', '.footer-neon-path.path-1', '.footer-neon-path.path-2');
    initNeonBorderRect('.page-container', '.hero-neon-path.path-1', '.hero-neon-path.path-2');
}

window.addEventListener('resize', initAllNeonBorders);
initAllNeonBorders();

audio.volume = 0.6;

volBars.forEach(bar => {
    bar.addEventListener('click', (e) => {
        const clickedLevel = parseFloat(e.target.getAttribute('data-level'));
        audio.volume = clickedLevel;

        volBars.forEach(b => {
            const barLevel = parseFloat(b.getAttribute('data-level'));
            if (barLevel <= clickedLevel) {
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

document.addEventListener('click', (e) => {
    if (!tracklistDropdown.contains(e.target) && e.target !== tracklistBtn) {
        tracklistDropdown.classList.remove('open');
    }
});

function setRing(li, percent) {
    const ringFg = li.querySelector('.ring-fg');
    if (!ringFg) return;
    const clamped = Math.max(0, Math.min(1, percent));
    const offset = RING_CIRC * (1 - clamped);
    ringFg.style.strokeDasharray = `${RING_CIRC}`;
    ringFg.style.strokeDashoffset = `${offset}`;
}

function resetRing(li) {
    const ringFg = li.querySelector('.ring-fg');
    if (!ringFg) return;
    ringFg.style.strokeDasharray = `${RING_CIRC}`;
    ringFg.style.strokeDashoffset = `${RING_CIRC}`;
}

function showPreviewUI(li, playing) {
    if (!li) return;
    const ring = li.querySelector('.preview-progress-ring');
    const playIcon = li.querySelector('.icon-preview-play');
    const pauseIcon = li.querySelector('.icon-preview-pause');

    li.classList.add('preview-active');
    if (ring) ring.classList.add('visible');

    if (playIcon) {
        playIcon.style.display = playing ? 'none' : 'block';
        playIcon.classList.toggle('visible', !playing);
    }
    if (pauseIcon) {
        pauseIcon.style.display = playing ? 'block' : 'none';
        pauseIcon.classList.toggle('visible', playing);
    }
}

function hidePreviewUI(li) {
    if (!li) return;
    const ring = li.querySelector('.preview-progress-ring');
    const playIcon = li.querySelector('.icon-preview-play');
    const pauseIcon = li.querySelector('.icon-preview-pause');

    li.classList.remove('preview-active');
    if (ring) ring.classList.remove('visible');
    resetRing(li);

    if (playIcon) {
        playIcon.style.display = 'block';
        playIcon.classList.remove('visible');
    }
    if (pauseIcon) {
        pauseIcon.style.display = 'none';
        pauseIcon.classList.remove('visible');
    }
}

function findTrackLi(trackId) {
    return listEl.querySelector(`.track-card[data-track-id="${trackId}"]`);
}

function stopPreview(resumeMain = true) {
    if (previewTrackId === null) return;

    if (!previewAudio.paused) previewAudio.pause();
    previewAudio.currentTime = 0;

    hidePreviewUI(findTrackLi(previewTrackId));
    previewTrackId = null;

    if (resumeMain && mainWasPlaying) {
        audio.play();
    }
    mainWasPlaying = false;
}

function togglePreview(track, li) {
    const src = track.preview || track.audio;
    if (!src) return;

    if (previewTrackId === track.id) {
        if (previewAudio.paused) {
            previewAudio.play();
            showPreviewUI(li, true);
        } else {
            previewAudio.pause();
            showPreviewUI(li, false);
        }
        return;
    }

    if (previewTrackId !== null) {
        hidePreviewUI(findTrackLi(previewTrackId));
    } else {
        mainWasPlaying = !audio.paused;
        if (!audio.paused) audio.pause();
    }

    previewTrackId = track.id;
    previewAudio.src = src;
    previewAudio.currentTime = 0;
    previewAudio.play();

    resetRing(li);
    showPreviewUI(li, true);
}

previewAudio.addEventListener('timeupdate', () => {
    if (previewTrackId === null || !previewAudio.duration) return;
    const li = findTrackLi(previewTrackId);
    if (!li) return;
    setRing(li, previewAudio.currentTime / previewAudio.duration);
});

previewAudio.addEventListener('ended', () => {
    stopPreview(true);
});

let currentFilterCat = 'all';
let drillGroup = null; // { type: 'album' | 'artist', key: string } | null

function createTrackCardLi(t) {
    const isReady = Boolean(t.audio);

    if (!isReady) {
        const lockedLi = document.createElement('li');
        lockedLi.className = 'track-item-lock';
        lockedLi.textContent = `${t.title} — soon`;
        return lockedLi;
    }

    const li = document.createElement('li');
    li.className = 'track-card';
    li.dataset.trackId = t.id;

    li.innerHTML = `
        <div class="track-cover-wrap">
            <img src="${t.cover}" class="track-cover" alt="cover">
            <svg class="preview-progress-ring" viewBox="0 0 80 80">
                <circle class="ring-bg" cx="40" cy="40" r="${RING_R}"></circle>
                <circle class="ring-fg" cx="40" cy="40" r="${RING_R}"></circle>
            </svg>
            <svg class="preview-play-icon icon-preview-play" viewBox="0 0 24 24" fill="#fff">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <svg class="preview-play-icon icon-preview-pause" viewBox="0 0 24 24" fill="#fff" style="display:none;">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
        </div>
        <div class="track-info">
            <h3 class="track-title">${t.title}</h3>
            <p class="track-artist">${t.artist}</p>
        </div>
    `;

    li.addEventListener('click', () => {
        window.location.href = `player.html?id=${t.id}`;
    });

    const coverWrap = li.querySelector('.track-cover-wrap');
    coverWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePreview(t, li);
    });

    return li;
}

function createGroupLi(coverSrc, title, subtitle, onClick) {
    const li = document.createElement('li');
    li.className = 'track-card';

    li.innerHTML = `
        <div class="track-cover-wrap">
            <img src="${coverSrc || ''}" class="track-cover" alt="cover">
        </div>
        <div class="track-info">
            <h3 class="track-title">${title}</h3>
            <p class="track-artist">${subtitle}</p>
        </div>
    `;

    li.addEventListener('click', onClick);
    return li;
}

function createBackButtonLi(label, onClick) {
    const li = document.createElement('li');
    li.className = 'track-item';
    li.textContent = `← ${label}`;
    li.addEventListener('click', onClick);
    return li;
}

function renderTracks(filterCat = 'all', searchQuery = '') {
    listEl.innerHTML = '';

    if (searchQuery.trim() !== '') {
        testTracks
            .filter(t => {
                const matchesCategory = (filterCat === 'all' || t.category === filterCat);
                const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            })
            .forEach(t => listEl.appendChild(createTrackCardLi(t)));
        return;
    }

    if (filterCat === 'album') {
        const albumTracks = testTracks.filter(t => t.category === 'album');

        if (drillGroup && drillGroup.type === 'album') {
            listEl.appendChild(createBackButtonLi('Все альбомы', () => {
                drillGroup = null;
                renderTracks(filterCat, '');
            }));
            albumTracks
                .filter(t => (t.album || t.title) === drillGroup.key)
                .forEach(t => listEl.appendChild(createTrackCardLi(t)));
            return;
        }

        const albums = {};
        albumTracks.forEach(t => {
            const key = t.album || t.title;
            if (!albums[key]) albums[key] = { cover: t.cover, count: 0 };
            albums[key].count++;
        });

        Object.entries(albums).forEach(([name, info]) => {
            listEl.appendChild(createGroupLi(info.cover, name, `${info.count} трек(ов)`, () => {
                drillGroup = { type: 'album', key: name };
                renderTracks(filterCat, '');
            }));
        });
        return;
    }

    if (filterCat === 'single' || filterCat === 'feat') {
        const catTracks = testTracks.filter(t => t.category === filterCat);

        if (drillGroup && drillGroup.type === 'artist') {
            listEl.appendChild(createBackButtonLi('Все исполнители', () => {
                drillGroup = null;
                renderTracks(filterCat, '');
            }));
            catTracks
                .filter(t => t.artist === drillGroup.key)
                .forEach(t => listEl.appendChild(createTrackCardLi(t)));
            return;
        }

        const artists = {};
        catTracks.forEach(t => {
            if (!artists[t.artist]) artists[t.artist] = { cover: t.cover, count: 0 };
            artists[t.artist].count++;
        });

        Object.entries(artists).forEach(([name, info]) => {
            listEl.appendChild(createGroupLi(info.cover, name, `${info.count} трек(ов)`, () => {
                drillGroup = { type: 'artist', key: name };
                renderTracks(filterCat, '');
            }));
        });
        return;
    }

    testTracks.forEach(t => listEl.appendChild(createTrackCardLi(t)));
}

searchInput.addEventListener('input', (e) => {
    renderTracks(currentFilterCat, e.target.value);
});

filtersBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filtersBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        currentFilterCat = e.target.getAttribute('data-category');
        drillGroup = null;
        renderTracks(currentFilterCat, searchInput.value);
    });
});

renderTracks();

});