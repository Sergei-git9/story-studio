// Вспомогательные функции

// Загрузка JSON файлов
async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Ошибка загрузки ${path}:`, error);
        throw error;
    }
}

// Получение параметров URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        story: params.get('story'),
        episode: params.get('episode')
    };
}

// Задержка
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Автоскролл
function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

// Эффект печати
async function typeText(element, text, speed = 50) {
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await sleep(speed);
    }
}

// Проверка существования файла
async function fileExists(path) {
    try {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

// Предзагрузка медиафайлов
async function preloadMedia(story) {
    const promises = [];
    
    story.forEach(message => {
        if (message.image) {
            const img = new Image();
            img.src = message.image;
            promises.push(new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; // Продолжаем даже если изображение не загрузилось
            }));
        }
    });
    
    await Promise.all(promises);
}