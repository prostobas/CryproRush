const gameData = {
    scores: [],
    
    addScore(score, difficulty, playerName = 'Player') {
        this.scores.push({
            score,
            difficulty,
            playerName,
            date: new Date().toISOString()
        });
        this.scores.sort((a, b) => b.score - a.score);
        this.saveToLocalStorage();
    },
    
    getFormattedLeaderboard() {
        return this.scores
            .slice(0, 10)
            .map((entry, index) => `
                <div class="leaderboard-item">
                    ${index + 1}. ${entry.playerName} - ${entry.score} 
                    (${entry.difficulty})
                </div>
            `)
            .join('');
    },
    
    saveToLocalStorage() {
        localStorage.setItem('leaderboard', JSON.stringify(this.scores));
    },
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('leaderboard');
        if (saved) {
            this.scores = JSON.parse(saved);
        }
    }
};

gameData.loadFromLocalStorage(); 