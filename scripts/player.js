// Управление звуками, эффектами и воспроизведением

class StoryPlayer {
    constructor() {
        this.currentStory = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isMuted = false;
        this.sounds = {};
        this.initAudio();
        this.initSnow();
    }

    initAudio() {
        this.sounds = {
            click: new Audio('assets/sounds/click.mp3'),
            glitch: new Audio('assets/sounds/glitch.mp3'),
            system: new Audio('assets/sounds/system.mp3'),
            whisper: new Audio('assets/sounds/whisper.mp3'),
            camera: new Audio('assets/sounds/camera.mp3'),
            ambient: new Audio('assets/sounds/ambient.mp3')
        };
        
        // Fallback к онлайн звукам если локальные не найдены
        this.sounds.click.onerror = () => {
            this.sounds.click.src = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';
        };
        this.sounds.glitch.onerror = () => {
            this.sounds.glitch.src = 'https://freesound.org/data/previews/458/458421_9381666-lq.mp3';
        };
        this.sounds.system.onerror = () => {
            this.sounds.system.src = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';
        };
        this.sounds.camera.onerror = () => {
            this.sounds.camera.src = 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3';
        };
        
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
        });
    }

    initSnow() {
        const container = document.getElementById('snow-container');
        if (!container) return;
        
        const count = 50;
        for (let i = 0; i < count; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            const size = Math.random() * 3 + 1 + 'px';
            flake.style.width = size;
            flake.style.height = size;
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.animationDuration = Math.random() * 5 + 5 + 's';
            flake.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(flake);
        }
    }

    async loadStory(storyId, episodeId) {
        try {
            this.currentStory = await loadJSON(`stories/${storyId}/ep${episodeId}.json`);
            this.currentIndex = 0;
            
            // Предзагрузка медиафайлов
            await preloadMedia(this.currentStory);
            
            return true;
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
            return false;
        }
    }

    playSound(name) {
        if (!this.isMuted && this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play().catch(e => console.log("Audio play blocked"));
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const icon = document.getElementById('mute-icon');
        if (this.isMuted) {
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />';
        } else {
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />';
        }
    }

    async processNext() {
        if (this.currentIndex >= this.currentStory.length) {
            document.getElementById('next-btn').textContent = 'История завершена';
            document.getElementById('next-btn').disabled = true;
            return;
        }

        const message = this.currentStory[this.currentIndex];
        await this.displayMessage(message);
        this.currentIndex++;

        if (this.currentIndex >= this.currentStory.length) {
            document.getElementById('next-btn').textContent = 'История завершена';
            document.getElementById('next-btn').disabled = true;
        } else {
            document.getElementById('next-btn').textContent = 'Продолжить чтение';
        }
    }

    async displayMessage(message) {
        const container = document.getElementById('story-container');
        
        if (message.type === 'system') {
            const systemDiv = document.createElement('div');
            systemDiv.className = 'system-msg';
            
            // Проверяем на глитч-эффект
            if (message.glitch) {
                systemDiv.classList.add('glitch-text');
                document.body.classList.add('global-glitch');
                setTimeout(() => {
                    document.body.classList.remove('global-glitch');
                    systemDiv.classList.remove('glitch-text');
                }, 2000);
                this.playSound('glitch');
            }
            
            systemDiv.textContent = message.text;
            container.appendChild(systemDiv);
            
            // Добавляем изображение если есть
            if (message.image) {
                const img = document.createElement('img');
                img.className = 'system-image';
                img.src = message.image;
                img.alt = 'Story image';
                container.appendChild(img);
                
                // Анимация появления изображения
                setTimeout(() => img.classList.add('show'), 500);
                
                // Воспроизводим звук для изображения
                if (message.sound) {
                    this.playSound(message.sound);
                } else {
                    this.playSound('camera');
                }
            } else if (!message.glitch) {
                this.playSound('system');
            }
        } else if (message.type === 'msg') {
            if (message.name) {
                await this.showTyping(message.name);
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = `message msg-${message.side}`;
            
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            if (message.name) {
                const nameDiv = document.createElement('div');
                nameDiv.className = 'text-xs text-gray-400 mb-1';
                nameDiv.textContent = message.name;
                bubble.appendChild(nameDiv);
            }
            
            const textDiv = document.createElement('div');
            textDiv.textContent = message.text;
            bubble.appendChild(textDiv);
            
            if (message.time) {
                const timeDiv = document.createElement('div');
                timeDiv.className = 'text-xs text-gray-500 mt-1 text-right';
                timeDiv.textContent = message.time;
                bubble.appendChild(timeDiv);
            }
            
            messageDiv.appendChild(bubble);
            container.appendChild(messageDiv);
            
            setTimeout(() => messageDiv.classList.add('show'), 100);
            
            // Воспроизводим кастомный звук или стандартный
            if (message.sound) {
                this.playSound(message.sound);
            } else {
                this.playSound('click');
            }
            
            this.hideTyping();
        }

        container.scrollTop = container.scrollHeight;
    }

    async showTyping(name) {
        const indicator = document.getElementById('typing-indicator');
        const nameSpan = document.getElementById('typing-name');
        nameSpan.textContent = name;
        indicator.style.display = 'block';
        
        // Убираем задержку для ручного режима
        await sleep(500);
    }

    hideTyping() {
        document.getElementById('typing-indicator').style.display = 'none';
    }

    async autoPlay() {
        this.isPlaying = true;
        document.getElementById('next-btn').style.display = 'none';
        
        for (let i = 0; i < this.currentStory.length; i++) {
            if (!this.isPlaying) break;
            
            await this.displayMessage(this.currentStory[i]);
            await sleep(2000);
        }
        
        this.isPlaying = false;
    }
}

// Глобальные переменные
let player = new StoryPlayer();

// Глобальные функции
function toggleMute() {
    player.toggleMute();
}

function processNext() {
    player.processNext();
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    const params = getUrlParams();
    if (params.story && params.episode) {
        const loaded = await player.loadStory(params.story, params.episode);
        if (loaded) {
            // Убираем автовоспроизведение, теперь только ручное управление
            document.getElementById('next-btn').textContent = 'Начать чтение';
        }
    }
});