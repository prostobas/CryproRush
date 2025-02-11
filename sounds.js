class SoundManager {
    constructor() {
        this.sounds = {
            background: new Audio('sounds/background.mp3'),
            jump: new Audio('sounds/jump.mp3'),
            coin: new Audio('sounds/coin.mp3'),
            hit: new Audio('sounds/hit.mp3'),
            gameOver: new Audio('sounds/game-over.mp3')
        };

        // Настраиваем фоновую музыку
        this.sounds.background.loop = true;
        this.sounds.background.volume = 0.5;

        // Загружаем сохраненные настройки
        this.soundEnabled = localStorage.getItem('soundEnabled') === 'true';
        this.musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    }

    playSound(soundName) {
        if (this.soundEnabled && this.sounds[soundName]) {
            // Для звуковых эффектов создаем новый экземпляр
            const sound = this.sounds[soundName].cloneNode();
            sound.play();
        }
    }

    startMusic() {
        if (this.musicEnabled) {
            this.sounds.background.play();
        }
    }

    stopMusic() {
        this.sounds.background.pause();
        this.sounds.background.currentTime = 0;
    }

    toggleSound(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('soundEnabled', enabled);
    }

    toggleMusic(enabled) {
        this.musicEnabled = enabled;
        localStorage.setItem('musicEnabled', enabled);
        if (enabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
    }
} 