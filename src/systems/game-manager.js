AFRAME.registerComponent('game-manager', {
    schema: {
        gameDuration: { type: 'number', default: 300 } // Duração em segundos (5 minutos)
    },

    init: function () {
        // Elementos da UI
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.hud = document.getElementById('hud');
        this.scoreEl = document.getElementById('score');
        this.timerEl = document.getElementById('timer');
        this.finalScoreEl = document.getElementById('final-score');
        this.highScoreEl = document.getElementById('high-score');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.shootBtn = document.getElementById('shoot-btn');
        this.damageOverlay = document.getElementById('damage-overlay');

        // Estado do Jogo
        this.state = 'MENU'; // MENU, PLAYING, GAME_OVER
        this.score = 0;
        this.timeRemaining = this.data.gameDuration;
        this.timerInterval = null;

        // Sistemas
        this.soundSystem = this.el.sceneEl.systems['sound-manager'];
        this.spawner = document.querySelector('[spawner]');

        // Bindings
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.startGame());

        // Event Listeners de Pontuação
        this.el.sceneEl.addEventListener('score-up', (evt) => this.onScoreUp(evt));
        this.el.sceneEl.addEventListener('score-down', (evt) => this.onScoreDown(evt));

        // Inicialização
        this.loadHighScore();
        this.setGameState('MENU');

        // Tentativa de auto-start (pode ser bloqueado pelo navegador)
        this.el.sceneEl.addEventListener('loaded', () => {
            // Verificação básica se não estamos já em VR/AR
            if (!this.el.sceneEl.is('vr-mode') && !this.el.sceneEl.is('ar-mode')) {
                // Em vez disso, vamos garantir que o clique no body funcione se o usuário clicar fora do botão
                document.body.addEventListener('click', () => {
                    if (!this.el.sceneEl.is('vr-mode') && !this.el.sceneEl.is('ar-mode') && this.state === 'MENU') {
                        this.el.sceneEl.enterAR();
                    }
                }, { once: true });
            }
        });
    },

    setGameState: function (newState) {
        this.state = newState;

        if (this.state === 'MENU') {
            this.startScreen.style.display = 'flex';
            this.gameOverScreen.style.display = 'none';
            this.hud.style.display = 'none';
            this.shootBtn.style.display = 'none';
            if (this.spawner) this.spawner.setAttribute('spawner', 'enabled', false);
        } else if (this.state === 'PLAYING') {
            this.startScreen.style.display = 'none';
            this.gameOverScreen.style.display = 'none';
            this.hud.style.display = 'flex';
            this.shootBtn.style.display = 'block';
            if (this.spawner) this.spawner.setAttribute('spawner', 'enabled', true);
        } else if (this.state === 'GAME_OVER') {
            this.startScreen.style.display = 'none';
            this.gameOverScreen.style.display = 'flex';
            this.hud.style.display = 'none';
            this.shootBtn.style.display = 'none';
            if (this.spawner) this.spawner.setAttribute('spawner', 'enabled', false);
            this.saveHighScore();
        }
    },

    startGame: function () {
        // Tentar entrar em modo AR
        if (this.el.sceneEl.checkHeadsetConnected() || this.el.sceneEl.isMobile) {
            this.el.sceneEl.enterAR();
        }

        this.score = 0;
        this.timeRemaining = this.data.gameDuration;
        this.updateScoreUI();
        this.updateTimerUI();

        // Limpar inimigos existentes (opcional, mas bom para resetar)
        const dinosaurs = document.querySelectorAll('.dinosaur');
        dinosaurs.forEach(e => e.parentNode.removeChild(e));

        this.setGameState('PLAYING');

        // Iniciar Timer
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerUI();

            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);
    },

    endGame: function () {
        clearInterval(this.timerInterval);
        this.finalScoreEl.innerText = this.score;
        this.setGameState('GAME_OVER');
    },

    onScoreUp: function (evt) {
        if (this.state !== 'PLAYING') return;

        this.score += 10;
        this.updateScoreUI();
        if (this.soundSystem) this.soundSystem.playSound('score-up');

        if (evt.detail && evt.detail.position) {
            this.spawnFloatingText(evt.detail.position, '+10', '#00FF00');
        }
    },

    onScoreDown: function (evt) {
        if (this.state !== 'PLAYING') return;

        this.score -= 5;
        this.updateScoreUI();
        if (this.soundSystem) this.soundSystem.playSound('score-down');

        // Feedback Visual de Dano
        if (this.damageOverlay) {
            this.damageOverlay.style.opacity = '0.5';
            setTimeout(() => {
                this.damageOverlay.style.opacity = '0';
            }, 200);
        }

        if (evt.detail && evt.detail.position) {
            this.spawnFloatingText(evt.detail.position, '-5', '#FF0000');
        }
    },

    updateScoreUI: function () {
        this.scoreEl.innerText = this.score;
        if (this.score < 0) this.scoreEl.style.color = '#ff416c';
        else this.scoreEl.style.color = 'white';
    },

    updateTimerUI: function () {
        // Formatar como minutos:segundos
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerEl.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (this.timeRemaining <= 30) this.timerEl.style.color = '#ff416c';
        else this.timerEl.style.color = 'white';
    },

    spawnFloatingText: function (position, text, color) {
        const entity = document.createElement('a-entity');
        entity.setAttribute('position', position);
        entity.setAttribute('floating-text', { text: text, color: color });
        this.el.sceneEl.appendChild(entity);
    },

    saveHighScore: function () {
        const currentHigh = localStorage.getItem('jurassicHunterHighScore') || 0;
        if (this.score > currentHigh) {
            localStorage.setItem('jurassicHunterHighScore', this.score);
            this.highScoreEl.innerText = this.score;
        } else {
            this.highScoreEl.innerText = currentHigh;
        }
    },

    loadHighScore: function () {
        const high = localStorage.getItem('jurassicHunterHighScore') || 0;
        this.highScoreEl.innerText = high;
    }
});
