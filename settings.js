// Создаем новый файл для настроек
let currentLanguage = 'ru';

const translations = {
    ru: {
        play: 'Играть',
        settings: 'Настройки',
        about: 'Об игре',
        back: 'Вернуться в меню',
        leaderboard: 'Таблица рекордов',
        sound: 'Звук',
        music: 'Музыка',
        language: 'Язык',
        gameOver: 'Игра окончена',
        score: 'Счёт',
        difficulty: 'Сложность',
        easy: 'Легкий',
        medium: 'Средний',
        hard: 'Сложный',
        pause: 'Пауза',
        resume: 'Продолжить',
        endGame: 'Закончить игру',
        coins: 'монет',
        lives: 'Жизни',
        about_card1_title: 'Игровой процесс',
        about_card1_text: 'Увлекательный раннер с элементами криптовалютного мира. Собирайте монеты и уклоняйтесь от препятствий!',
        about_card2_title: 'Особенности',
        about_card2_text: 'Различные типы монет, бонусы и уникальные препятствия делают каждую игру особенной.',
        about_card3_title: 'Награды',
        about_card3_text: 'Соревнуйтесь с другими игроками и попадайте в таблицу лидеров!',
        'show-fps': 'Показывать FPS',
        playDescription: 'Увлекательное приключение в мире криптовалют!',
        leaderboardDescription: 'Соревнуйтесь с другими игроками за лучший результат!',
        settingsDescription: 'Настройте игру под себя!',
        aboutDescription: 'Узнайте больше о нашей игре!',
        difficulty_title: 'Выберите сложность',
        easy_title: 'Легкий',
        easy_description: 'Идеально для новичков! Меньше препятствий, больше монет.',
        medium_title: 'Средний',
        medium_description: 'Сбалансированный уровень сложности для опытных игроков.',
        hard_title: 'Сложный',
        hard_description: 'Настоящий вызов! Максимальная скорость и препятствия.',
        start_game: 'Начать игру',
        enterName: 'Введите ваше имя:',
        bestPlayer: 'Лучший игрок',
        secondPlace: 'Второе место',
        thirdPlace: 'Третье место'
    },
    en: {
        play: 'Play',
        settings: 'Settings',
        about: 'About',
        back: 'Back to Menu',
        leaderboard: 'Leaderboard',
        sound: 'Sound',
        music: 'Music',
        language: 'Language',
        gameOver: 'Game Over',
        score: 'Score',
        difficulty: 'Difficulty',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        pause: 'Pause',
        resume: 'Resume',
        endGame: 'End Game',
        coins: 'coins',
        lives: 'Lives',
        about_card1_title: 'Gameplay',
        about_card1_text: 'Exciting runner with cryptocurrency elements. Collect coins and dodge obstacles!',
        about_card2_title: 'Features',
        about_card2_text: 'Different types of coins, power-ups and unique obstacles make each game special.',
        about_card3_title: 'Rewards',
        about_card3_text: 'Compete with other players and get into the leaderboard!',
        'show-fps': 'Show FPS',
        playDescription: 'An exciting adventure in the world of cryptocurrency!',
        leaderboardDescription: 'Compete with other players for the best score!',
        settingsDescription: 'Customize the game to your liking!',
        aboutDescription: 'Learn more about our game!',
        difficulty_title: 'Select Difficulty',
        easy_title: 'Easy',
        easy_description: 'Perfect for beginners! Less obstacles, more coins.',
        medium_title: 'Medium',
        medium_description: 'Balanced difficulty for experienced players.',
        hard_title: 'Hard',
        hard_description: 'Real challenge! Maximum speed and obstacles.',
        start_game: 'Start Game',
        enterName: 'Enter your name:',
        bestPlayer: 'Best Player',
        secondPlace: 'Second Place',
        thirdPlace: 'Third Place'
    }
};

function updateLanguage(lang) {
    const texts = translations[lang];
    if (!texts) return;

    // Обновляем все тексты в главном меню
    const mainMenuCards = document.querySelectorAll('#main-menu .about-card');
    mainMenuCards.forEach((card, index) => {
        const title = card.querySelector('h2');
        const desc = card.querySelector('p');
        const button = card.querySelector('.menu-button');

        switch(index) {
            case 0: // Карточка игры
                if (title) title.textContent = 'CryptoRush';
                if (desc) desc.textContent = texts.playDescription;
                if (button) button.textContent = texts.play;
                break;
            case 1: // Карточка рекордов
                if (title) title.textContent = texts.leaderboard;
                if (desc) desc.textContent = texts.leaderboardDescription;
                if (button) button.textContent = texts.leaderboard;
                break;
            case 2: // Карточка настроек
                if (title) title.textContent = texts.settings;
                if (desc) desc.textContent = texts.settingsDescription;
                if (button) button.textContent = texts.settings;
                break;
            case 3: // Карточка об игре
                if (title) title.textContent = texts.about;
                if (desc) desc.textContent = texts.aboutDescription;
                if (button) button.textContent = texts.about;
                break;
        }
    });

    // Обновляем тексты в разделе выбора сложности
    document.querySelector('#difficulty-screen .swipe-text').textContent = texts.difficulty_title;
    
    const difficultyCards = document.querySelectorAll('#difficulty-screen .about-card');
    difficultyCards.forEach((card, index) => {
        const title = card.querySelector('h2');
        const desc = card.querySelector('p');
        const button = card.querySelector('.menu-button');

        switch(index) {
            case 0:
                if (title) title.textContent = texts.easy_title;
                if (desc) desc.textContent = texts.easy_description;
                if (button) button.textContent = texts.start_game;
                break;
            case 1:
                if (title) title.textContent = texts.medium_title;
                if (desc) desc.textContent = texts.medium_description;
                if (button) button.textContent = texts.start_game;
                break;
            case 2:
                if (title) title.textContent = texts.hard_title;
                if (desc) desc.textContent = texts.hard_description;
                if (button) button.textContent = texts.start_game;
                break;
        }
    });

    // Обновляем тексты в таблице рекордов
    document.querySelector('#leaderboard-screen .swipe-text').textContent = texts.leaderboard;
    
    const leaderboardCards = document.querySelectorAll('#leaderboard-screen .about-card');
    leaderboardCards.forEach((card, index) => {
        const title = card.querySelector('h2');
        const scoreText = card.querySelector('#top' + (index + 1) + '-score');
        
        switch(index) {
            case 0:
                if (title) title.textContent = texts.bestPlayer;
                if (scoreText) {
                    const score = scoreText.textContent.split(' ')[0];
                    scoreText.textContent = `${score} ${texts.coins}`;
                }
                break;
            case 1:
                if (title) title.textContent = texts.secondPlace;
                if (scoreText) {
                    const score = scoreText.textContent.split(' ')[0];
                    scoreText.textContent = `${score} ${texts.coins}`;
                }
                break;
            case 2:
                if (title) title.textContent = texts.thirdPlace;
                if (scoreText) {
                    const score = scoreText.textContent.split(' ')[0];
                    scoreText.textContent = `${score} ${texts.coins}`;
                }
                break;
        }
    });

    // Обновляем тексты в настройках
    const settingsItems = document.querySelectorAll('.settings-item span');
    settingsItems.forEach(span => {
        switch(span.textContent.toLowerCase()) {
            case 'звук':
            case 'sound':
                span.textContent = texts.sound;
                break;
            case 'музыка':
            case 'music':
                span.textContent = texts.music;
                break;
            case 'язык':
            case 'language':
                span.textContent = texts.language;
                break;
            case 'показывать fps':
            case 'show fps':
                span.textContent = texts['show-fps'];
                break;
        }
    });

    // Обновляем все кнопки "Вернуться в меню"
    document.querySelectorAll('.back-text').forEach(element => {
        element.textContent = texts.back;
    });

    // Обновляем тексты в игровом интерфейсе
    const scoreElement = document.querySelector('#score');
    if (scoreElement) {
        const score = game ? game.coins : 0;
        scoreElement.textContent = `${texts.coins}: ${score}`;
    }

    // Обновляем текст жизней
    const livesElement = document.querySelector('#lives span[data-translate="lives"]');
    if (livesElement) {
        livesElement.textContent = texts.lives;
    }

    // Сохраняем выбранный язык
    currentLanguage = lang;
    localStorage.setItem('gameLanguage', lang);
    if (game) {
        game.settings.language = lang;
        game.saveSettings();
    }
}

// Обновляем обработчик изменения языка
document.getElementById('language').addEventListener('change', function(e) {
    const newLang = e.target.value;
    updateLanguage(newLang);
});

// Добавляем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('gameLanguage') || 'ru';
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
    updateLanguage(savedLanguage);
});

// Добавим функцию обновления текстов кнопок
function updateButtonTexts() {
    if (!game || !game.settings) return;

    const texts = translations[game.settings.language];
    if (!texts) return;

    // Обновляем тексты кнопок
    const buttonTranslations = {
        'start-button': 'play',
        'leaderboard-button': 'leaderboard',
        'settings-button': 'settings',
        'about-button': 'about',
        'back-to-menu': 'back',
        'resume-button': 'resume',
        'end-game-button': 'endGame',
        'settings-back': 'back',
        'about-back': 'back',
        'leaderboard-back': 'back'
    };

    for (const [id, key] of Object.entries(buttonTranslations)) {
        const button = document.getElementById(id);
        if (button) {
            button.textContent = texts[key];
        }
    }

    // Обновляем другие элементы интерфейса
    const scoreElement = document.querySelector('#score');
    if (scoreElement) {
        scoreElement.textContent = `${texts.coins}: ${game ? game.coins : 0}`;
    }
}

// Добавим функцию инициализации настроек
function initializeSettings() {
    if (!game || !game.settings) return;

    // Устанавливаем начальные значения
    updateLanguage(currentLanguage);
    
    // Добавляем обработчик изменения языка
    document.getElementById('language').addEventListener('change', function(e) {
        const newLang = e.target.value;
        currentLanguage = newLang;
        
        // Обновляем тексты через функцию updateLanguage
        updateLanguage(newLang);
        
        // Сохраняем выбранный язык
        if (game) {
            game.settings.language = newLang;
            game.saveSettings();
        }
        localStorage.setItem('gameLanguage', newLang);
    });
}

// Также добавим вызов updateLanguage при инициализации
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('gameLanguage') || 'ru';
    currentLanguage = savedLanguage;
    
    // Устанавливаем значение селекта языка
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
    }
    
    // Обновляем все тексты
    updateLanguage(savedLanguage);
});

document.getElementById('sound').addEventListener('change', (e) => {
    game.soundManager.toggleSound(e.target.checked);
});

document.getElementById('music').addEventListener('change', (e) => {
    game.soundManager.toggleMusic(e.target.checked);
}); 