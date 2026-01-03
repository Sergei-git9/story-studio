document.addEventListener('DOMContentLoaded', async () => {
    await loadStories();
});

async function loadStories() {
    try {
        const stories = await loadJSON('config/stories.json');
        renderStories(stories);
    } catch (error) {
        console.error('Ошибка загрузки историй:', error);
    }
}

function renderStories(stories) {
    const container = document.getElementById('stories-container');
    
    stories.forEach(story => {
        const storyDiv = document.createElement('div');
        storyDiv.className = 'story-card';
        
        storyDiv.innerHTML = `
            <div class="story-image">
                <img src="${story.cover}" alt="${story.title}" onerror="this.style.display='none'">
            </div>
            <div class="story-info">
                <h3>${story.title}</h3>
                <p>${story.description}</p>
                <div class="story-meta">
                    <span>Эпизодов: ${story.episodes}</span>
                    <span>Жанр: ${story.genre}</span>
                </div>
                <div class="episodes">
                    ${Array.from({length: story.episodes}, (_, i) => 
                        `<button class="episode-btn" onclick="showModeSelector('${story.id}', ${i + 1})">
                            Эпизод ${i + 1}
                        </button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        container.appendChild(storyDiv);
    });
}

function showModeSelector(storyId, episodeId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Выберите режим</h3>
            <div class="mode-buttons">
                <button onclick="selectMode('${storyId}', ${episodeId}, 'view')" class="mode-btn view-btn">
                    👁️ Просмотр
                </button>
                <button onclick="selectMode('${storyId}', ${episodeId}, 'record')" class="mode-btn record-btn">
                    🎬 Запись
                </button>
            </div>
            <button onclick="closeModal()" class="close-btn">✕</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function selectMode(storyId, episodeId, mode) {
    if (mode === 'record') {
        window.location.href = `recording-auto.html?story=${storyId}&episode=${episodeId}`;
    } else {
        window.location.href = `recording.html?story=${storyId}&episode=${episodeId}`;
    }
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}