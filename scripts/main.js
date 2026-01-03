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
                        `<button class="episode-btn" onclick="selectEpisode('${story.id}', ${i + 1})">
                            Эпизод ${i + 1}
                        </button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        container.appendChild(storyDiv);
    });
}

function selectEpisode(storyId, episodeId) {
    window.location.href = `recording.html?story=${storyId}&episode=${episodeId}`;
}