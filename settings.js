// Создаем новый файл для настроек
let currentLanguage = 'ru';

const translations = {
    ru: {
        play: 'Играть',
        settings: 'Настройки',
        about: 'Об игре',
        back: 'Назад',
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
        coins: 'Монеты',
        lives: 'Жизни',
        about_card1_title: 'Игровой процесс',
        about_card1_text: 'Увлекательный раннер с элементами криптовалютного мира. Собирайте монеты и уклоняйтесь от препятствий!',
        about_card2_title: 'Особенности',
        about_card2_text: 'Различные типы монет, бонусы и уникальные препятствия делают каждую игру особенной.',
        about_card3_title: 'Награды',
        about_card3_text: 'Соревнуйтесь с другими игроками и попадайте в таблицу лидеров!'
    },
    en: {
        play: 'Play',
        settings: 'Settings',
        about: 'About',
        back: 'Back',
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
        coins: 'Coins',
        lives: 'Lives',
        about_card1_title: 'Gameplay',
        about_card1_text: 'Exciting runner with cryptocurrency elements. Collect coins and dodge obstacles!',
        about_card2_title: 'Features',
        about_card2_text: 'Different types of coins, power-ups and unique obstacles make each game special.',
        about_card3_title: 'Rewards',
        about_card3_text: 'Compete with other players and get into the leaderboard!'
    }
};

function updateLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Обновляем значения в селекторах
    document.querySelectorAll('option[data-translate]').forEach(option => {
        const key = option.dataset.translate;
        if (translations[lang][key]) {
            option.textContent = translations[lang][key];
        }
    });

    // Обновляем все кнопки
    updateButtonTexts();

    // Сохраняем выбранный язык
    if (window.game) {
        game.settings.language = lang;
        game.saveSettings();
    }
}

// Добавим функцию обновления текстов кнопок
function updateButtonTexts() {
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
            button.textContent = translations[currentLanguage][key];
        }
    }

    // Обновляем другие элементы интерфейса
    const scoreElement = document.querySelector('#score');
    if (scoreElement) {
        scoreElement.textContent = `${translations[currentLanguage].coins}: ${game ? game.coins : 0}`;
    }
}

// Добавим функцию инициализации настроек
function initializeSettings() {
    // Устанавливаем начальные значения
    updateLanguage(currentLanguage);
    
    // Добавляем обработчик изменения языка
    document.getElementById('language').addEventListener('change', function(e) {
        updateLanguage(e.target.value);
    });
}

// Вызываем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeSettings); 