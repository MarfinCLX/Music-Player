        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function animateCount(el, target, duration) {
            if (!el) return;
            if (target <= 0) { el.textContent = '0'; return; }

            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutExpo(progress);
                el.textContent = Math.round(eased * target);

                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target;
                }
            }

            requestAnimationFrame(tick);
        }

        function renderArtistsList(artists) {
            const listEl = document.getElementById('artists-list');
            if (!listEl) return;
            listEl.innerHTML = '';

            artists.forEach((name, i) => {
                const li = document.createElement('li');
                li.textContent = name;
                li.style.animationDelay = `${2.6 + i * 0.15}s`;
                listEl.appendChild(li);
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            const tracks = (typeof testTracks !== 'undefined') ? testTracks : [];
            const trackCount = tracks.length;
            const artists = [...new Set(tracks.map(t => t.artist).filter(Boolean))];

            renderArtistsList(artists);

            setTimeout(() => {
                animateCount(document.getElementById('stat-tracks'), trackCount, 1800);
                animateCount(document.getElementById('stat-artists'), artists.length, 1400);
            }, 2600);
        });