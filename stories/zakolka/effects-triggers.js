// Система триггеров визуальных эффектов для истории "Заколка"
// Автоматически активирует эффекты при ключевых словах

const EFFECT_TRIGGERS = {
  // 🔥 ОГОНЬ И ЖЖЕНИЕ - усиливающиеся эффекты
  fire: {
    keywords: [
      'огонь', 'пламя', 'горит', 'жжет', 'жжение', 'обжигает', 'раскален', 
      'факел', 'вспыхнул', 'плавится', 'жар', 'пепел', 'сгорел', 'ожог',
      'раскаленную монету', 'обжигает ладонь', 'жжет ладонь', 'пульсирует красным'
    ],
    effects: [
      'fire_glow',      // Красное свечение экрана
      'screen_heat',    // Эффект жара (размытие краев)
      'ember_particles', // Частицы углей
      'burn_flash'      // Вспышки при сильном жжении
    ],
    intensity: 'progressive' // Усиливается с каждым упоминанием
  },

  // ❄️ ХОЛОД И МИСТИКА
  cold: {
    keywords: [
      'холодно', 'ледяно', 'мороз', 'дрожь', 'замерз', 'стынет',
      'запотевает', 'туман', 'призрак', 'тень', 'силуэт'
    ],
    effects: [
      'frost_overlay',   // Изморозь на экране
      'cold_breath',     // Эффект дыхания на холоде
      'ice_crystals'     // Кристаллы льда
    ]
  },

  // 👻 МИСТИЧЕСКИЕ МОМЕНТЫ
  supernatural: {
    keywords: [
      'шепот', 'голос', 'призрак', 'дух', 'мертвый', 'потусторонний',
      'аномалия', 'парадокс', 'Observer', 'артефакт', 'проклятие'
    ],
    effects: [
      'ghost_flicker',   // Мерцание как у призрака
      'static_noise',    // Помехи
      'ethereal_glow',   // Потусторонний свет
      'reality_glitch'   // Глитч реальности
    ]
  },

  // ⚡ ЭЛЕКТРИЧЕСТВО И ГЛИТЧИ
  electrical: {
    keywords: [
      'трансформатор', 'искры', 'электричество', 'гаснет свет', 'мерцает',
      'глючит', 'экран мерцает', 'помехи', 'замыкание'
    ],
    effects: [
      'electric_spark',  // Электрические разряды
      'screen_flicker',  // Мерцание экрана
      'power_surge',     // Скачок напряжения
      'digital_glitch'   // Цифровые помехи
    ]
  },

  // 💔 ЭМОЦИОНАЛЬНЫЕ МОМЕНТЫ
  emotional: {
    keywords: [
      'плачет', 'слезы', 'боль', 'страдание', 'отчаяние', 'любовь',
      'прости', 'не могу', 'больно', 'сердце колотится'
    ],
    effects: [
      'heart_pulse',     // Пульсация как сердцебиение
      'tear_drop',       // Эффект слез
      'emotional_blur',  // Размытие от слез
      'love_glow'        // Теплое свечение любви
    ]
  },

  // 🌟 ЗАКОЛКА - ЦЕНТРАЛЬНЫЙ АРТЕФАКТ
  artifact: {
    keywords: [
      'заколка', 'звезда', 'серебряная', 'пульсирует', 'вибрирует',
      'двигается сама', 'металл', 'артефакт'
    ],
    effects: [
      'star_shine',      // Звездное сияние
      'metal_gleam',     // Металлический блеск
      'pulse_rhythm',    // Ритмичная пульсация
      'artifact_power'   // Мощь артефакта
    ]
  }
};

// Специальные комбо-эффекты для ключевых сцен
const COMBO_EFFECTS = {
  // Сцена аварии (EP1)
  'crash_scene': {
    triggers: ['такси', 'трансформатор', 'искры', 'вспыхнуло'],
    effects: ['massive_explosion', 'screen_shake', 'blinding_flash', 'fire_storm']
  },

  // Ритуал освобождения (EP4)
  'ritual_scene': {
    triggers: ['свечи', 'пламя', 'ритуал', 'бросает в огонь'],
    effects: ['ritual_circle', 'sacred_fire', 'spirit_release', 'purification_light']
  },

  // Пробуждение в больнице (EP5)
  'hospital_awakening': {
    triggers: ['больница', 'кома', 'аппараты', 'капельница'],
    effects: ['medical_beep', 'sterile_light', 'reality_fade_in', 'consciousness_return']
  }
};

// Прогрессивная система интенсивности
const INTENSITY_LEVELS = {
  1: { opacity: 0.3, scale: 0.8, duration: 1000 },
  2: { opacity: 0.5, scale: 1.0, duration: 1500 },
  3: { opacity: 0.7, scale: 1.2, duration: 2000 },
  4: { opacity: 0.9, scale: 1.5, duration: 2500 },
  5: { opacity: 1.0, scale: 2.0, duration: 3000 }  // Максимум для кульминации
};

// Функция активации эффектов
function triggerEffects(messageText, messageType = 'msg') {
  const text = messageText.toLowerCase();
  let activeEffects = [];
  let intensity = 1;

  // Проверяем все категории триггеров
  Object.entries(EFFECT_TRIGGERS).forEach(([category, config]) => {
    const matchedKeywords = config.keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      // Увеличиваем интенсивность для огненных эффектов
      if (category === 'fire' && config.intensity === 'progressive') {
        intensity = Math.min(5, matchedKeywords.length + 1);
      }

      activeEffects.push({
        category,
        effects: config.effects,
        sounds: config.sounds || [], // 🔊 ДОБАВЛЯЕМ ЗВУКИ
        intensity,
        keywords: matchedKeywords
      });
    }
  });

  // Проверяем комбо-эффекты
  Object.entries(COMBO_EFFECTS).forEach(([comboName, config]) => {
    const matchedTriggers = config.triggers.filter(trigger => 
      text.includes(trigger.toLowerCase())
    );

    if (matchedTriggers.length >= 2) { // Нужно минимум 2 триггера для комбо
      activeEffects.push({
        category: 'combo',
        combo: comboName,
        effects: config.effects,
        sounds: config.sounds || [],
        intensity: 5 // Комбо всегда максимальной интенсивности
      });
    }
  });

  return activeEffects;
}

// Экспорт для использования в основном коде
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EFFECT_TRIGGERS,
    COMBO_EFFECTS,
    INTENSITY_LEVELS,
    triggerEffects
  };
}

// Примеры использования:
/*
// При отображении сообщения:
const effects = triggerEffects("Заколка начинает пульсировать красным светом и жжет ладонь");
// Вернет: fire effects с intensity 3

const comboEffects = triggerEffects("Такси врезалось в трансформатор, искры взлетели выше крыши");
// Вернет: crash_scene combo с максимальными эффектами

// Интеграция в Story Studio:
document.addEventListener('messageDisplay', (event) => {
  const effects = triggerEffects(event.detail.text, event.detail.type);
  effects.forEach(effect => {
    activateVisualEffect(effect);
  });
});
*/

// Web Audio API генератор процедурных звуков
class ProceduralAudio {
  constructor() {
    this.audioContext = null;
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API не поддерживается');
    }
  }

  // 🔥 ОГНЕННЫЕ ЗВУКИ
  playFireCrackle(intensity = 1) {
    if (!this.audioContext) return;
    
    const duration = 0.3 + intensity * 0.2;
    const noise = this.createNoise(duration, 0.1 * intensity);
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800 + intensity * 400;
    filter.Q.value = 5;
    
    noise.connect(filter);
    filter.connect(this.audioContext.destination);
    noise.start();
    noise.stop(this.audioContext.currentTime + duration);
  }

  // ⚡ ЭЛЕКТРИЧЕСКИЕ ЗВУКИ
  playElectricZap(intensity = 1) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2 * intensity, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // 👻 МИСТИЧЕСКИЕ ЗВУКИ
  playGhostWhisper() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime + 1);
    
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 2);
  }

  // 🌟 ЗВУКИ АРТЕФАКТА
  playMetalRing(intensity = 1) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800 + intensity * 200;
    
    gainNode.gain.setValueAtTime(0.3 * intensity, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 1.5);
  }

  // 💔 СЕРДЦЕБИЕНИЕ
  playHeartbeat() {
    if (!this.audioContext) return;
    
    const playBeat = (delay) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 60;
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + delay + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + delay + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(this.audioContext.currentTime + delay);
      oscillator.stop(this.audioContext.currentTime + delay + 0.2);
    };
    
    playBeat(0);     // Первый удар
    playBeat(0.3);   // Второй удар
  }

  // Генератор белого шума
  createNoise(duration, volume) {
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * volume;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    return noise;
  }

  // Воспроизведение звука по имени
  playSound(soundName, intensity = 1) {
    switch(soundName) {
      case 'message_notification':
        this.playMessageSound();
        break;
      case 'fire_crackle':
      case 'burn_sizzle':
        this.playFireCrackle(intensity);
        break;
      case 'electric_zap':
      case 'spark_crackle':
        this.playElectricZap(intensity);
        break;
      case 'ghost_whisper':
      case 'ethereal_hum':
        this.playGhostWhisper();
        break;
      case 'metal_ring':
      case 'crystal_chime':
        this.playMetalRing(intensity);
        break;
      case 'heartbeat':
        this.playHeartbeat();
        break;
    }
  }

  // 🔊 ЗВУК СООБЩЕНИЙ
  playMessageSound() {
    if (!this.audioContext) return;
    
    // Создаем приятный звук уведомления
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Два тона для гармонии
    oscillator1.type = 'sine';
    oscillator1.frequency.value = 800; // Основная нота
    
    oscillator2.type = 'sine';
    oscillator2.frequency.value = 1200; // Гармоника
    
    // Плавное затухание
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(this.audioContext.currentTime + 0.3);
    oscillator2.stop(this.audioContext.currentTime + 0.3);
  }
}

// Глобальный экземпляр аудио-генератора
const proceduralAudio = new ProceduralAudio();