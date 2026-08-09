document.addEventListener('DOMContentLoaded', () => {
            const grouped = {};

            testTracks.forEach(t => {
                if (!grouped[t.artist]) grouped[t.artist] = [];
                grouped[t.artist].push(t);
            });

            const container = document.getElementById('catalog-list');

            Object.entries(grouped).forEach(([artist, tracks]) => {
                const details = document.createElement('details');
                details.className = 'artist-group';

                const summary = document.createElement('summary');
                summary.textContent = artist;
                details.appendChild(summary);

                tracks.forEach(t => {
                    const isReady = Boolean(t.audio);

                    const row = document.createElement(isReady ? 'a' : 'div');
                    row.className = isReady ? 'track-row' : 'track-row track-row-locked';
                    if (isReady) row.href = `player.html?id=${t.id}`;

                    const name = document.createElement('span');
                    name.textContent = t.title;

                    const cat = document.createElement('span');
                    cat.className = 'track-category';
                    cat.textContent = isReady ? t.category : 'soon';

                    row.appendChild(name);
                    row.appendChild(cat);
                    details.appendChild(row);
                });

                container.appendChild(details);
            });
        });