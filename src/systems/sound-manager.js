AFRAME.registerSystem('sound-manager', {
    init: function () {
        this.sounds = {};
        // Placeholder URLs - o usuário precisará adicionar os arquivos reais em public/sounds/
        // Se não existirem, o erro 404 aparecerá no console mas não quebrará o jogo
        this.preloadSound('shoot', '/sounds/shoot.mp3');
        this.preloadSound('explosion', '/sounds/explosion.mp3');
        this.preloadSound('splash', '/sounds/splash.mp3');
        this.preloadSound('score-up', '/sounds/score-up.mp3');
        this.preloadSound('score-down', '/sounds/score-down.mp3');
    },

    preloadSound: function (name, src) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        this.sounds[name] = audio;
    },

    playSound: function (name) {
        const sound = this.sounds[name];
        if (sound) {
            // Clona o nó para permitir sons sobrepostos (tiro rápido)
            const clone = sound.cloneNode();
            clone.volume = 0.5; // Volume padrão
            clone.play().catch(e => console.warn(`Erro ao tocar som ${name}:`, e));
        }
    }
});
