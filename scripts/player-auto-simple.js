// Управление звуками, эффектами, воспроизведением и записью экрана

class StoryPlayer {
    constructor() {
        this.currentStory = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isMuted = false;
        this.isRecording = false;
        this.mediaRecorder = null;
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
        
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
            sound.onerror = () => console.log('Sound not found');
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

    // Запись экрана
    async toggleRecording() {
        if (!this.isRecording) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { mediaSource: 'screen' },
                    audio: true
                });
                
                this.mediaRecorder = new MediaRecorder(stream);
                const chunks = [];
                
                this.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `story-${Date.now()}.webm`;
                    a.click();
                };
                
                this.mediaRecorder.start();
                this.isRecording = true;
                
                const icon = document.getElementById('record-icon');
                icon.classList.add('animate-pulse', 'bg-red-600');
                
            } catch (err) {
                alert('Ошибка записи экрана: ' + err.message);
            }
        } else {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            const icon = document.getElementById('record-icon');
            icon.classList.remove('animate-pulse', 'bg-red-600');
        }
    }

    // Автостарт записи
    async autoStartRecording() {
        await sleep(2000);
        await this.toggleRecording();
        await sleep(1000);
        this.startAutoPlay();
    }

    // Автостоп записи
    autoStopRecording() {
        if (this.isRecording) {
            setTimeout(() => {
                this.toggleRecording();
            }, 3000);
        }
    }

    // Автовоспроизведение
    async startAutoPlay() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        document.getElementById('auto-btn').textContent = '⏸️ Остановить';
        document.getElementById('next-btn').style.display = 'none';
        
        document.getElementById('chat-window').scrollTo({ top: 0, behavior: 'smooth' });
        await sleep(1000);
        
        for (let i = this.currentIndex; i < this.currentStory.length; i++) {
            if (!this.isPlaying) break;
            
            await this.displayMessage(this.currentStory[i]);
            this.currentIndex = i + 1;
            
            setTimeout(() => this.centerLastMessage(), 300);
            
            const delay = this.currentStory[i].delay || 2500;
            await sleep(delay);
        }
        
        this.isPlaying = false;
        document.getElementById('auto-btn').textContent = '✅ Завершено';
        document.getElementById('auto-btn').disabled = true;
        
        this.autoStopRecording();
    }

    stopAutoPlay() {
        this.isPlaying = false;
        document.getElementById('auto-btn').textContent = '🎬 Автозапуск';
        document.getElementById('next-btn').style.display = 'block';
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
        }
    }

    async displayMessage(message) {
        const container = document.getElementById('story-container');
        
        // Проверяем эффекты по ключевым словам
        this.checkForEffects(message.text);
        
        if (message.type === 'system') {
            const systemDiv = document.createElement('div');
            systemDiv.className = 'system-msg';
            
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
            
            if (message.image) {
                const img = document.createElement('img');
                img.className = 'system-image';
                img.src = message.image;
                img.alt = 'Story image';
                container.appendChild(img);
                
                setTimeout(() => img.classList.add('show'), 500);
                this.playSound(message.sound || 'camera');
            } else if (!message.glitch) {
                this.playSound('system');
            }
        } else if (message.type === 'msg') {
            if (message.name && message.typing !== false) {
                await this.showTyping(message.name);
                this.smoothScrollToBottom();
                await sleep(1500);
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
            
            setTimeout(() => {
                messageDiv.classList.add('show');
                this.smoothScrollToBottom();
            }, 100);
            
            this.playSound(message.sound || 'click');
            this.hideTyping();
        }

        setTimeout(() => this.smoothScrollToBottom(), 200);
    }

    // Проверка эффектов по ключевым словам
    checkForEffects(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('потух свет') || lowerText.includes('гаснет свет') || lowerText.includes('темно')) {
            this.createBlackoutEffect();
        }
        
        if (lowerText.includes('синяя вспышка') || lowerText.includes('трансформатор') || lowerText.includes('замкнул')) {
            this.createBlueFlash();
        }
        
        if (lowerText.includes('огонь') || lowerText.includes('жар') || lowerText.includes('пламя') || lowerText.includes('горит') || lowerText.includes('плавящий')) {
            this.switchToFireParticles();
        }
        
        if (lowerText.includes('май') || lowerText.includes('весна') || lowerText.includes('цветы') || lowerText.includes('лепестки')) {
            this.switchToFlowerParticles();
        }
    }

    createBlackoutEffect() {
        const blackout = document.createElement('div');
        blackout.className = 'screen-blackout';
        document.body.appendChild(blackout);
        
        setTimeout(() => {
            blackout.remove();
        }, 2000);
    }

    createBlueFlash() {
        const flash = document.createElement('div');
        flash.className = 'blue-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 1000);
    }

    switchToFireParticles() {
        const container = document.getElementById('particles-container');
        container.innerHTML = '';
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'fire-particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(particle);
        }
        
        document.getElementById('snow-container').style.display = 'none';
    }

    switchToFlowerParticles() {
        const container = document.getElementById('particles-container');
        container.innerHTML = '';
        
        for (let i = 0; i < 20; i++) {
            const petal = document.createElement('div');
            petal.className = 'flower-petal';
            petal.style.left = Math.random() * 100 + 'vw';
            petal.style.animationDelay = Math.random() * 4 + 's';
            container.appendChild(petal);
        }
        
        document.getElementById('snow-container').style.display = 'none';
    }

    async showTyping(name) {
        const indicator = document.getElementById('typing-indicator');
        const nameSpan = document.getElementById('typing-name');
        nameSpan.textContent = name;
        indicator.style.display = 'block';
    }

    hideTyping() {
        document.getElementById('typing-indicator').style.display = 'none';
    }

    smoothScrollToBottom() {
        const container = document.getElementById('chat-window');
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }

    centerLastMessage() {
        const container = document.getElementById('chat-window');
        const messages = container.querySelectorAll('.message, .system-msg');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            lastMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
}

// Глобальные переменные
let player = new StoryPlayer();

// Глобальные функции
function toggleMute() {
    player.toggleMute();
}

function toggleRecording() {
    player.toggleRecording();
}

function startAutoPlay() {
    if (player.isPlaying) {
        player.stopAutoPlay();
    } else {
        player.startAutoPlay();
    }
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
            document.getElementById('next-btn').textContent = 'Начать чтение';
            // Автостарт записи
            player.autoStartRecording();
        }
    }
});