// Структура для хранения рекордов
const leaderboardData = {
    records: [],

    // Загрузка данных из файла
    async loadRecords() {
        try {
            const response = await fetch('leaderboard.json');
            const data = await response.json();
            this.records = data.records;
            return this.records;
        } catch (error) {
            console.error('Ошибка при загрузке рекордов:', error);
            return [];
        }
    },

    // Сохранение данных в файл
    async saveRecords() {
        try {
            const response = await fetch('save_records.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ records: this.records })
            });
            
            if (!response.ok) {
                throw new Error('Ошибка при сохранении');
            }
        } catch (error) {
            console.error('Ошибка при сохранении рекордов:', error);
            // Резервное сохранение в localStorage
            localStorage.setItem('leaderboard', JSON.stringify(this.records));
        }
    },

    // Добавление нового рекорда
    async addRecord(coins) {
        const date = new Date().toLocaleDateString();
        const newRecord = { coins, date };
        
        // Добавляем новый рекорд и сортируем
        this.records.push(newRecord);
        this.records.sort((a, b) => b.coins - a.coins);
        this.records = this.records.slice(0, 3);
        
        // Сохраняем обновленные данные
        await this.saveRecords();
        
        return this.records.findIndex(record => record === newRecord) + 1;
    },

    // Проверка на рекорд
    isHighScore(coins) {
        if (this.records.length < 3) return true;
        return coins > this.records[this.records.length - 1].coins;
    },

    // Получение рекордов
    getRecords() {
        return this.records;
    },

    // Очистка рекордов
    async clearRecords() {
        this.records = [];
        await this.saveRecords();
    },

    // Обновление отображения
    updateLeaderboardDisplay() {
        const leaderboardScreen = document.getElementById('leaderboard-screen');
        const cardsContainer = leaderboardScreen.querySelector('.about-cards');
        cardsContainer.innerHTML = '';

        const gradients = ['gradient-gold', 'gradient-silver', 'gradient-bronze'];
        const medals = ['🥇', '🥈', '🥉'];

        this.records.forEach((record, index) => {
            const card = document.createElement('div');
            card.className = 'about-card';
            card.innerHTML = `
                <div class="feature-block ${gradients[index]}">
                    <div class="block-icon">${medals[index]}</div>
                </div>
                <div class="feature-content">
                    <h2>${index + 1} место</h2>
                    <p>${record.coins} монет</p>
                    <p class="date">${record.date}</p>
                </div>
            `;
            cardsContainer.appendChild(card);
        });

        // Добавляем пустые места
        for (let i = this.records.length; i < 3; i++) {
            const card = document.createElement('div');
            card.className = 'about-card';
            card.innerHTML = `
                <div class="feature-block ${gradients[i]}">
                    <div class="block-icon">${medals[i]}</div>
                </div>
                <div class="feature-content">
                    <h2>${i + 1} место</h2>
                    <p>Пусто</p>
                    <p class="date">-</p>
                </div>
            `;
            cardsContainer.appendChild(card);
        }
    }
};

// Загружаем рекорды при инициализации
leaderboardData.loadRecords().then(() => {
    console.log('Рекорды загружены');
});

// Экспортируем объект для использования в других файлах
window.leaderboardData = leaderboardData; 