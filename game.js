class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.coins = 0;
        this.isPlaying = false;
        this.player = {
            x: 50,
            y: 0,
            width: 40,
            height: 40,
            velocity: 0,
            gravity: 0.4,
            jumpForce: -12
        };
        
        this.obstacles = [];
        this.cryptoCoins = [];
        this.difficulty = 'medium';
        this.difficultySettings = {
            easy: {
                speed: 3,
                obstacleFrequency: 0.01,
                coinFrequency: 0.04
            },
            medium: {
                speed: 5,
                obstacleFrequency: 0.02,
                coinFrequency: 0.03
            },
            hard: {
                speed: 7,
                obstacleFrequency: 0.03,
                coinFrequency: 0.02
            }
        };
        
        this.coinTypes = {
            bitcoin: { value: 10, color: '#F7931A', size: 25, probability: 0.2 },
            ethereum: { value: 5, color: '#627EEA', size: 20, probability: 0.3 },
            dogecoin: { value: 1, color: '#C2A633', size: 15, probability: 0.5 }
        };

        // Временно закомментируем загрузку спрайтов
        /*
        this.sprites = {
            player: this.loadSprite('player.png'),
            coins: {
                bitcoin: this.loadSprite('bitcoin.png'),
                ethereum: this.loadSprite('ethereum.png'),
                dogecoin: this.loadSprite('dogecoin.png')
            },
            obstacle: this.loadSprite('obstacle.png')
        };
        */

        this.animations = {
            playerRun: 0,
            playerJump: 0
        };
        this.isPaused = false;
        this.lives = 3;
        
        // Загружаем сохраненные настройки или используем настройки по умолчанию
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            language: localStorage.getItem('gameLanguage') || 'ru',
            showFps: false,
            ...JSON.parse(localStorage.getItem('gameSettings') || '{}')
        };
        
        this.init();

        // Добавляем новые игровые механики
        this.powerUps = [];
        this.powerUpTypes = {
            doubleJump: { duration: 5000 },
            shield: { duration: 3000 },
            slowMotion: { duration: 4000 }
        };
        
        this.doubleJumpAvailable = false;
        this.combo = 0;
        this.comboTimer = null;
        
        // Добавляем FPS счетчик
        this.lastTime = 0;
        this.fps = 0;
        this.fpsCounter = document.createElement('div');
        this.fpsCounter.id = 'fps-counter';
        document.getElementById('game-screen').appendChild(this.fpsCounter);

        // Добавляем счетчик монет в конструктор
        this.scoreElement = document.getElementById('coins');

        // Добавляем типы врагов
        this.enemyTypes = {
            basic: {
                width: 30,
                height: 100,
                color: '#ff0000',
                speed: 1,
                damage: 1
            },
            flying: {
                width: 40,
                height: 40,
                color: '#ff6b6b',
                speed: 1.5,
                damage: 1,
                amplitude: 100,
                frequency: 0.02
            },
            shooting: {
                width: 40,
                height: 40,
                color: '#ffd93d',
                speed: 0.7,
                damage: 1,
                shootInterval: 2000
            }
        };

        this.projectiles = [];

        // Инициализируем звуки
        this.soundManager = new SoundManager();
    }

    init() {
        this.setupEventListeners();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.player.y = this.canvas.height / 2;
    }

    setupEventListeners() {
        const handleJump = (e) => {
            e.preventDefault();
            if (this.isPlaying && !this.isPaused) {
                // Просто прыгаем при каждом касании
                this.player.velocity = this.player.jumpForce;
                this.soundManager.playSound('jump');
            }
        };

        this.canvas.addEventListener('touchstart', handleJump, { passive: false });
        this.canvas.addEventListener('mousedown', handleJump);
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    start() {
        this.isPlaying = true;
        this.isPaused = false;
        this.reset();
        
        // Запускаем игровой цикл
        const gameLoop = () => {
            if (this.isPlaying) {
                this.update();
                this.draw();
                requestAnimationFrame(gameLoop);
            }
        };
        gameLoop();

        this.soundManager.startMusic();
    }

    update() {
        if (this.isPaused) return;

        // Обновление FPS
        this.updateFPS(performance.now());

        // Обновление позиции игрока
        this.player.velocity += this.player.gravity;
        this.player.y += this.player.velocity;

        // Проверка падения за пределы экрана
        if (this.player.y > this.canvas.height) {
            this.gameOver('Падение');
            return;
        }

        // Ограничение только сверху
        if (this.player.y < 0) {
            this.player.y = 0;
            this.player.velocity = 0;
        }

        // Генерация препятствий и монет
        if (Math.random() < this.difficultySettings[this.difficulty].obstacleFrequency) {
            this.obstacles.push(this.generateEnemy());
        }

        if (Math.random() < 0.03) {
            this.cryptoCoins.push({
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 30),
                size: 20
            });
        }

        // Обновляем позиции препятствий и проверяем столкновения
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const enemy = this.obstacles[i];
            const speed = this.difficultySettings[this.difficulty].speed * enemy.speed;

            enemy.x -= speed;

            // Проверяем столкновение
            if (this.checkCollision(this.player, enemy)) {
                return; // Выходим из метода, если игра окончена
            }

            // Удаляем препятствия за пределами экрана
            if (enemy.x + enemy.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }

        // Обновление анимаций
        this.cryptoCoins.forEach(coin => {
            coin.angle += 0.05;
            coin.floatOffset = Math.sin(coin.angle) * 5;
        });

        // Обновленная генерация монет
        if (Math.random() < this.difficultySettings[this.difficulty].coinFrequency) {
            this.cryptoCoins.push(this.generateCoin());
        }

        // Генерация бонусов
        if (Math.random() < 0.005) {
            this.generatePowerUp();
        }

        // Обновление бонусов
        this.updatePowerUps();

        // В методе update добавим обработку столкновений с монетами
        this.cryptoCoins.forEach((coin, index) => {
            coin.x -= this.difficultySettings[this.difficulty].speed * 0.6;
            if (coin.x + coin.size < 0) {
                this.cryptoCoins.splice(index, 1);
                return;
            }
            
            // Сбор монет
            if (this.checkCoinCollision(this.player, coin)) {
                this.collectCoin(coin);
                this.cryptoCoins.splice(index, 1);
            }
        });
    }

    draw() {
        // Очищаем канвас
        this.ctx.fillStyle = '#1E1E2E';  // Тёмный фон
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Добавляем сетку на фон
        this.ctx.strokeStyle = 'rgba(108, 99, 255, 0.1)';
        this.ctx.lineWidth = 1;
        const gridSize = 30;
        
        for(let i = 0; i < this.canvas.width; i += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        
        for(let i = 0; i < this.canvas.height; i += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        // Отрисовка игрока
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Отрисовка препятствий
        this.obstacles.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            // Дополнительные эффекты для разных типов врагов
            if (enemy.type === 'shooting') {
                // Добавляем "пушку"
                this.ctx.fillStyle = '#2f3542';
                this.ctx.fillRect(enemy.x - 10, enemy.y + enemy.height/2 - 5, 15, 10);
            }
        });

        // Отрисовка монет
        this.cryptoCoins.forEach(coin => {
            this.ctx.save();
            this.ctx.fillStyle = coin.type ? this.coinTypes[coin.type].color : '#ffd700';
            this.ctx.translate(coin.x, coin.y + (coin.floatOffset || 0));
            this.ctx.rotate(coin.angle || 0);
            this.ctx.beginPath();
            this.ctx.arc(0, 0, coin.size/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // Отрисовка бонусов
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            this.ctx.fillStyle = powerUp.color;
            this.ctx.beginPath();
            this.ctx.moveTo(powerUp.x, powerUp.y - powerUp.size/2);
            this.ctx.lineTo(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2);
            this.ctx.lineTo(powerUp.x - powerUp.size/2, powerUp.y + powerUp.size/2);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        });

        // Отрисовка эффектов
        if (this.player.isShielded) {
            this.ctx.strokeStyle = '#0000ff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width/2,
                this.player.y + this.player.height/2,
                this.player.width * 0.7,
                0, Math.PI * 2
            );
            this.ctx.stroke();
        }

        // Отрисовка комбо
        if (this.combo > 1) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Комбо x${this.combo}`, 20, 90);
        }

        // Отрисовка снарядов
        this.projectiles.forEach(projectile => {
            this.ctx.beginPath();
            this.ctx.fillStyle = projectile.color;
            this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    checkCollision(player, obstacle) {
        if (player.isShielded) return false;
        
        // Проверяем столкновение
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            
            // Уменьшаем жизни
            this.lives--;
            this.updateLives();
            
            // Даём небольшую неуязвимость после удара, отодвигая препятствие
            obstacle.x = this.canvas.width + 100;
            
            // Проверяем, закончились ли жизни
            if (this.lives <= 0) {
                this.gameOver('Столкновение с препятствием');
                return true;
            }

            // Добавляем вибрацию при столкновении
            if (this.settings.vibration && 'vibrate' in navigator) {
                navigator.vibrate(200);
            }

            this.soundManager.playSound('hit');
        }
        return false;
    }

    checkCoinCollision(player, coin) {
        const dx = (player.x + player.width/2) - coin.x;
        const dy = (player.y + player.height/2) - coin.y;
        return Math.sqrt(dx*dx + dy*dy) < (player.width/2 + coin.size/2);
    }

    gameOver(reason) {
        this.isPlaying = false;
        this.isPaused = false;
        
        // Проигрываем звук окончания игры
        this.soundManager.playSound('gameOver');
        this.soundManager.stopMusic();
        
        // Сохраняем результат, если нужно
        this.saveScore();
        
        // Небольшая задержка перед возвратом в меню
        setTimeout(() => {
            showScreen('main-menu');
        }, 1000);
    }

    saveScore() {
        const playerName = prompt(
            translations[currentLanguage].enterName || 'Введите ваше имя:', 
            'Player'
        ) || 'Player';

        const score = {
            name: playerName,
            coins: this.coins,
            difficulty: this.difficulty,
            date: new Date().toISOString()
        };
        
        // Получаем существующие рекорды
        let scores = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        scores.push(score);
        
        // Сортируем по убыванию монет
        scores.sort((a, b) => b.coins - a.coins);
        
        // Оставляем только топ-3
        scores = scores.slice(0, 3);
        
        // Сохраняем обновленную таблицу рекордов
        localStorage.setItem('leaderboard', JSON.stringify(scores));
        
        // Обновляем отображение
        this.updateLeaderboard();
    }

    updateLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        const difficultyTranslations = {
            easy: translations[currentLanguage].easy,
            medium: translations[currentLanguage].medium,
            hard: translations[currentLanguage].hard
        };

        // Обновляем каждую позицию
        for (let i = 1; i <= 3; i++) {
            const score = scores[i - 1] || { name: '-', coins: 0, difficulty: '-' };
            const nameEl = document.getElementById(`top${i}-name`);
            const scoreEl = document.getElementById(`top${i}-score`);
            const difficultyEl = document.getElementById(`top${i}-difficulty`);

            if (nameEl) nameEl.textContent = score.name;
            if (scoreEl) scoreEl.textContent = `${score.coins} ${translations[currentLanguage].coins}`;
            if (difficultyEl) {
                difficultyEl.textContent = difficultyTranslations[score.difficulty] || score.difficulty;
            }
        }
    }

    loadSprite(src) {
        const img = new Image();
        img.src = src;
        return img;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.reset(); // Сбрасываем состояние игры
    }

    reset() {
        this.coins = 0;
        this.lives = 3;
        this.obstacles = [];
        this.cryptoCoins = [];
        this.powerUps = [];
        this.player.y = 0;
        this.player.velocity = 0;
        this.isPaused = false;
        
        // Обновляем отображение монет
        if (this.scoreElement) {
            this.scoreElement.textContent = '0';
        }
    }

    generateCoin() {
        const random = Math.random();
        let coinType;
        let accumulated = 0;

        for (const [type, settings] of Object.entries(this.coinTypes)) {
            accumulated += settings.probability;
            if (random <= accumulated) {
                coinType = type;
                break;
            }
        }

        return {
            x: this.canvas.width,
            y: Math.random() * (this.canvas.height - 30),
            type: coinType,
            ...this.coinTypes[coinType],
            angle: 0,
            floatOffset: 0
        };
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.isPlaying = !this.isPaused;
        
        const pauseMenu = document.getElementById('pause-menu');
        if (this.isPaused) {
            pauseMenu.classList.remove('hidden');
        } else {
            pauseMenu.classList.add('hidden');
            this.gameLoop();
        }
    }

    endGame() {
        this.isPlaying = false;
        this.isPaused = false;
        document.getElementById('pause-menu').classList.add('hidden');
        showScreen('main-menu');
    }

    updateLives() {
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            heart.style.opacity = index < this.lives ? '1' : '0.2';
        });
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = {...this.settings, ...JSON.parse(savedSettings)};
        }
        
        // Применяем настройки только если элементы существуют
        const soundCheckbox = document.getElementById('sound');
        const musicCheckbox = document.getElementById('music');
        const languageSelect = document.getElementById('language');
        
        if (soundCheckbox) {
            soundCheckbox.checked = this.settings.soundEnabled;
        }
        if (musicCheckbox) {
            musicCheckbox.checked = this.settings.musicEnabled;
        }
        if (languageSelect) {
            languageSelect.value = this.settings.language;
        }

        const showFpsCheckbox = document.getElementById('show-fps');
        if (showFpsCheckbox) {
            showFpsCheckbox.checked = this.settings.showFps;
        }
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        localStorage.setItem('gameLanguage', this.settings.language); // Сохраняем язык отдельно
    }

    generatePowerUp() {
        const types = ['doubleJump', 'shield', 'slowMotion'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const powerUp = {
            x: this.canvas.width,
            y: Math.random() * (this.canvas.height - 30),
            type: type,
            size: 25,
            color: type === 'doubleJump' ? '#00ff00' : 
                   type === 'shield' ? '#0000ff' : '#ff00ff'
        };
        
        this.powerUps.push(powerUp);
    }

    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.x -= this.difficultySettings[this.difficulty].speed;
            
            if (powerUp.x + powerUp.size < 0) {
                this.powerUps.splice(i, 1);
                continue;
            }
            
            if (this.checkPowerUpCollision(this.player, powerUp)) {
                this.activatePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
            }
        }
    }

    checkPowerUpCollision(player, powerUp) {
        return player.x < powerUp.x + powerUp.size &&
               player.x + player.width > powerUp.x - powerUp.size &&
               player.y < powerUp.y + powerUp.size &&
               player.y + player.height > powerUp.y - powerUp.size;
    }

    activatePowerUp(type) {
        console.log('Активирован бонус:', type); // Для отладки

        switch(type) {
            case 'doubleJump':
                this.doubleJumpAvailable = true;
                setTimeout(() => {
                    this.doubleJumpAvailable = false;
                    console.log('Двойной прыжок деактивирован');
                }, this.powerUpTypes.doubleJump.duration);
                break;
            case 'shield':
                this.player.isShielded = true;
                setTimeout(() => {
                    this.player.isShielded = false;
                    console.log('Щит деактивирован');
                }, this.powerUpTypes.shield.duration);
                break;
            case 'slowMotion':
                const originalSpeed = this.difficultySettings[this.difficulty].speed;
                this.difficultySettings[this.difficulty].speed *= 0.5;
                setTimeout(() => {
                    this.difficultySettings[this.difficulty].speed = originalSpeed;
                    console.log('Замедление деактивировано');
                }, this.powerUpTypes.slowMotion.duration);
                break;
        }

        // Добавляем вибрацию при получении бонуса
        if (this.settings.vibration && 'vibrate' in navigator) {
            navigator.vibrate(100);
        }
    }

    updateCombo() {
        this.combo++;
        if (this.comboTimer) clearTimeout(this.comboTimer);
        
        this.comboTimer = setTimeout(() => {
            this.combo = 0;
        }, 2000);

        // Увеличиваем очки в зависимости от комбо
        return Math.floor(this.combo * 1.5);
    }

    collectCoin(coin) {
        const baseValue = coin.type ? this.coinTypes[coin.type].value : 1;
        const comboMultiplier = this.updateCombo();
        this.coins += baseValue * comboMultiplier;
        
        // Обновляем отображение монет
        if (this.scoreElement) {
            this.scoreElement.textContent = this.coins;
        }
        
        if (this.settings.vibration && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }

        this.soundManager.playSound('coin');
    }

    generateEnemy() {
        const types = ['basic', 'flying', 'shooting'];
        const type = types[Math.floor(Math.random() * types.length)];
        const enemyConfig = this.enemyTypes[type];

        const enemy = {
            x: this.canvas.width,
            y: type === 'flying' ? 
                this.canvas.height / 2 : 
                Math.random() * (this.canvas.height - enemyConfig.height),
            ...enemyConfig,
            type,
            initialY: 0,
            lastShot: 0
        };

        enemy.initialY = enemy.y;
        return enemy;
    }

    // Добавим метод для обновления FPS
    updateFPS(timestamp) {
        if (!this.lastTime) {
            this.lastTime = timestamp;
            return;
        }

        const delta = timestamp - this.lastTime;
        this.fps = Math.round(1000 / delta);
        this.lastTime = timestamp;

        if (this.settings.showFps) {
            this.fpsCounter.textContent = `FPS: ${this.fps}`;
            this.fpsCounter.style.display = 'block';
        } else {
            this.fpsCounter.style.display = 'none';
        }
    }
}

// Объявляем переменную game глобально
let game;

// Определяем функцию showScreen в глобальной области видимости
function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');

    // Инициализируем слайдер на экранах, где он есть
    if (screenId === 'about-screen' || 
        screenId === 'settings-screen' || 
        screenId === 'leaderboard-screen') {
        initAboutSlider();
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем игру
    game = new Game();

    // Заменяем обработчик кнопки "Играть"
    document.getElementById('start-button').addEventListener('click', () => {
        showScreen('difficulty-screen');
    });

    // Обработчик для кнопки "Назад" на экране сложности
    document.querySelector('#difficulty-screen .back-hint').addEventListener('click', () => {
        showScreen('main-menu');
    });

    // Обработчики кнопок сложности
    const difficultyModes = {
        'easy-mode-start': 'easy',
        'medium-mode-start': 'medium',
        'hard-mode-start': 'hard'
    };

    Object.entries(difficultyModes).forEach(([buttonId, difficulty]) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                if (game) {
                    game.setDifficulty(difficulty);
                    game.isPlaying = true;
                    game.start();
                    showScreen('game-screen');
                }
            });
        }
    });

    // Обработчики остальных кнопок меню
    document.getElementById('leaderboard-button').addEventListener('click', () => {
        console.log('Leaderboard button clicked'); // Для отладки
        game.updateLeaderboard();
        showScreen('leaderboard-screen');
    });

    document.getElementById('settings-button').addEventListener('click', () => {
        console.log('Settings button clicked'); // Для отладки
        showScreen('settings-screen');
    });

    // Обработчик кнопки "Об игре"
    document.getElementById('about-button').addEventListener('click', () => {
        console.log('About button clicked');
        showScreen('about-screen');
    });

    // Обработчики только для существующих кнопок
    const backButtons = ['settings-back', 'leaderboard-back'];
    backButtons.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                console.log(`${id} clicked`);
                showScreen('main-menu');
            });
        }
    });

    // Обработчики для возврата в меню
    document.querySelectorAll('.back-hint').forEach(backHint => {
        backHint.addEventListener('click', () => {
            showScreen('main-menu');
        });
    });

    document.getElementById('pause-button').addEventListener('click', () => {
        game.togglePause();
    });

    document.getElementById('resume-button').addEventListener('click', () => {
        game.togglePause();
    });

    document.getElementById('pause-settings-button').addEventListener('click', () => {
        game.isPaused = true;
        game.isPlaying = false;
        showScreen('settings-screen');
    });

    document.getElementById('end-game-button').addEventListener('click', () => {
        game.endGame();
    });

    // Обработчики настроек
    document.getElementById('sound').addEventListener('change', (e) => {
        game.settings.soundEnabled = e.target.checked;
        game.saveSettings();
    });

    document.getElementById('music').addEventListener('change', (e) => {
        game.settings.musicEnabled = e.target.checked;
        game.saveSettings();
    });

    // Обработчик изменения языка
    document.getElementById('language').addEventListener('change', function(e) {
        const selectedLang = e.target.value;
        if (game) {
            game.settings.language = selectedLang;
            game.saveSettings();
            updateLanguage(selectedLang);
        }
    });

    // Обработчик кнопки "Назад" в настройках
    document.getElementById('settings-back').addEventListener('click', () => {
        if (game.isPaused) {
            showScreen('game-screen');
            document.getElementById('pause-menu').classList.remove('hidden');
        } else {
            showScreen('main-menu');
        }
    });

    // Устанавливаем сохраненный язык в селекте
    const savedLang = game.settings.language;
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.value = savedLang;
        updateLanguage(savedLang);
    }

    document.getElementById('show-fps').addEventListener('change', (e) => {
        game.settings.showFps = e.target.checked;
        game.saveSettings();
    });
});

// Функция инициализации слайдера
function initAboutSlider() {
    const slider = document.querySelector('.about-cards');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function goToSlide(n) {
        currentSlide = Math.max(0, Math.min(n, 3)); // Ограничиваем диапазон
        const offset = -currentSlide * 25;
        slider.style.transition = 'transform 0.3s ease';
        slider.style.transform = `translateX(${offset}%)`;
        
        // Обновляем точки
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Обработчики для точек
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Обработчики для свайпов
    slider.addEventListener('mousedown', (e) => {
        startX = e.pageX;
        currentX = startX;
        isDragging = true;
        slider.style.transition = 'none';
        e.preventDefault();
    });

    slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        currentX = startX;
        isDragging = true;
        slider.style.transition = 'none';
    });

    function handleMove(clientX) {
        if (!isDragging) return;
        
        currentX = clientX;
        const diff = currentX - startX;
        const move = -(currentSlide * 25) + (diff / slider.offsetWidth * 100);
        slider.style.transform = `translateX(${move}%)`;
    }

    slider.addEventListener('mousemove', (e) => handleMove(e.pageX));
    slider.addEventListener('touchmove', (e) => handleMove(e.touches[0].pageX));

    function handleEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        const diff = currentX - startX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentSlide > 0) {
                currentSlide--; // Свайп вправо
            } else if (diff < 0 && currentSlide < 3) {
                currentSlide++; // Свайп влево
            }
        }
        
        goToSlide(currentSlide);
    }

    slider.addEventListener('mouseup', handleEnd);
    slider.addEventListener('mouseleave', handleEnd);
    slider.addEventListener('touchend', handleEnd);

    // Обработка клавиш
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
        if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    });

    // Начальная инициализация
    goToSlide(0);
}

// Функция обновления языка интерфейса
function updateLanguage(lang) {
    const texts = translations[lang];
    if (!texts) return;

    // Обновляем все элементы с атрибутом data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (texts[key]) {
            element.textContent = texts[key];
        }
    });

    // Обновляем все тексты в меню
    const menuTexts = {
        'start-button': texts.play,
        'leaderboard-button': texts.leaderboard,
        'settings-button': texts.settings,
        'about-button': texts.about,
        'back-to-menu': texts.back,
        'resume-button': texts.resume,
        'end-game-button': texts.endGame,
        'easy-mode': texts.easy,
        'medium-mode': texts.medium,
        'hard-mode': texts.hard,
        'pause-settings-button': texts.settings
    };

    // Обновляем тексты кнопок
    for (const [id, text] of Object.entries(menuTexts)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    // Обновляем тексты в настройках
    document.querySelectorAll('.settings-item span').forEach(span => {
        const text = span.textContent.toLowerCase();
        if (text === 'звук' || text === 'sound') {
            span.textContent = texts.sound;
        } else if (text === 'музыка' || text === 'music') {
            span.textContent = texts.music;
        } else if (text === 'язык' || text === 'language') {
            span.textContent = texts.language;
        } else if (text.includes('fps')) {
            span.textContent = texts['show-fps'];
        }
    });

    // Обновляем тексты "Вернуться в меню"
    document.querySelectorAll('.back-text').forEach(element => {
        element.textContent = texts.back;
    });

    // Обновляем заголовки экранов
    const screenTitles = {
        'settings-screen .swipe-text': texts.settings,
        'about-screen .swipe-text': texts.about,
        'leaderboard-screen .swipe-text': texts.leaderboard
    };

    for (const [selector, text] of Object.entries(screenTitles)) {
        const element = document.querySelector(`#${selector}`);
        if (element) {
            element.textContent = text;
        }
    }

    // Обновляем тексты в карточках главного меню
    const menuCards = {
        'play': {
            title: texts.play,
            description: texts.playDescription
        },
        'leaderboard': {
            title: texts.leaderboard,
            description: texts.leaderboardDescription
        },
        'settings': {
            title: texts.settings,
            description: texts.settingsDescription
        },
        'about': {
            title: texts.about,
            description: texts.aboutDescription
        }
    };

    document.querySelectorAll('.menu-card').forEach((card, index) => {
        const type = Object.keys(menuCards)[index];
        const cardTexts = menuCards[type];
        const titleEl = card.querySelector('h2');
        const descEl = card.querySelector('p');
        
        if (titleEl && cardTexts.title) {
            titleEl.textContent = cardTexts.title;
        }
        if (descEl && cardTexts.description) {
            descEl.textContent = cardTexts.description;
        }
    });

    // Обновляем тексты на экране выбора сложности
    const difficultyScreen = document.querySelector('#difficulty-screen .swipe-text');
    if (difficultyScreen) {
        difficultyScreen.textContent = texts.difficulty_title;
    }

    // Обновляем карточки сложности
    const difficultyCards = document.querySelectorAll('#difficulty-screen .about-card');
    difficultyCards.forEach((card, index) => {
        const h2 = card.querySelector('h2');
        const p = card.querySelector('p');
        const button = card.querySelector('.menu-button');

        switch(index) {
            case 0: // Легкий уровень
                if (h2) h2.textContent = texts.easy_title;
                if (p) p.textContent = texts.easy_description;
                if (button) button.textContent = texts.start_game;
                break;
            case 1: // Средний уровень
                if (h2) h2.textContent = texts.medium_title;
                if (p) p.textContent = texts.medium_description;
                if (button) button.textContent = texts.start_game;
                break;
            case 2: // Сложный уровень
                if (h2) h2.textContent = texts.hard_title;
                if (p) p.textContent = texts.hard_description;
                if (button) button.textContent = texts.start_game;
                break;
        }
    });

    // Обновляем текст "Вернуться в меню" на экране сложности
    const difficultyBackText = document.querySelector('#difficulty-screen .back-text');
    if (difficultyBackText) {
        difficultyBackText.textContent = texts.back;
    }

    // Сохраняем выбранный язык
    if (game) {
        game.settings.language = lang;
        game.saveSettings();
    }
    localStorage.setItem('gameLanguage', lang);
} 