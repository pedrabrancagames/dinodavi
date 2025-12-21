AFRAME.registerComponent('spawner', {
    schema: {
        interval: { type: 'number', default: 1000 }, // Checa a cada 1 segundo
        range: { type: 'number', default: 5 },
        maxDinosaurs: { type: 'number', default: 2 },
        enabled: { type: 'boolean', default: true }
    },

    init: function () {
        this.timer = 0;
        this.spawnQueue = 0; // Fila de spawns pendentes

        // Listener para spawnar novo dinossauro quando um for eliminado
        this.el.sceneEl.addEventListener('dinosaur-killed', () => {
            if (this.data.enabled) {
                // Incrementar a fila de spawns
                this.spawnQueue++;
                // Pequeno delay para evitar spawn instantâneo
                setTimeout(() => this.processSpawnQueue(), 300);
            }
        });

        // Dinossauros que ficam no chão
        this.groundDinosaurs = [
            'dimetrodon.glb', 'dinosaur.glb', 'iguanodon.glb',
            'mamenn.glb', 't-rex.glb', 'triceratops.glb'
        ];

        // Dinossauros que voam
        this.flyingDinosaurs = [
            'pteradactal.glb'
        ];

        // Escalas personalizadas para cada modelo
        this.customScales = {
            'dimetrodon.glb': '0.5 0.5 0.5',
            'dinosaur.glb': '0.5 0.5 0.5',
            'iguanodon.glb': '0.5 0.5 0.5',
            'mamenn.glb': '0.3 0.3 0.3',
            't-rex.glb': '1.5 1.5 1.5',
            'triceratops.glb': '0.5 0.5 0.5',
            'pteradactal.glb': '0.4 0.4 0.4',
        };
    },

    tick: function (time, timeDelta) {
        if (!this.data.enabled) return;

        this.timer += timeDelta;
        // Verificar a cada 500ms (mais frequente para garantir spawn)
        if (this.timer >= 500) {
            this.ensureMinimumDinosaurs();
            this.timer = 0;
        }
    },

    // Processa a fila de spawns pendentes
    processSpawnQueue: function () {
        if (!this.data.enabled || this.spawnQueue <= 0) return;

        const currentCount = this.getActiveDinosaurCount();
        const canSpawn = this.data.maxDinosaurs - currentCount;

        if (canSpawn > 0) {
            this.spawn();
            this.spawnQueue--;
        }
    },

    // Garante que sempre haja o número mínimo de dinossauros
    ensureMinimumDinosaurs: function () {
        const currentCount = this.getActiveDinosaurCount();
        const needed = this.data.maxDinosaurs - currentCount;

        for (let i = 0; i < needed; i++) {
            this.spawn();
        }
    },

    // Conta apenas dinossauros que ainda estão visíveis (não em explosão)
    getActiveDinosaurCount: function () {
        const dinosaurs = document.querySelectorAll('.dinosaur');
        let count = 0;
        dinosaurs.forEach(dino => {
            // Só conta se ainda está visível
            if (dino.object3D && dino.object3D.visible) {
                count++;
            }
        });
        return count;
    },

    trySpawn: function () {
        const dinoCount = this.getActiveDinosaurCount();

        if (dinoCount < this.data.maxDinosaurs) {
            this.spawn();
        }
    },

    spawn: function () {
        const el = document.createElement('a-entity');

        // 20% de chance de ser pteradactal (voador)
        const isFlying = Math.random() < 0.2;
        let modelName;

        if (isFlying) {
            modelName = this.flyingDinosaurs[Math.floor(Math.random() * this.flyingDinosaurs.length)];
        } else {
            modelName = this.groundDinosaurs[Math.floor(Math.random() * this.groundDinosaurs.length)];
        }

        el.classList.add('dinosaur');
        el.setAttribute('animation-mixer', '');
        el.setAttribute('gltf-model', `url(/models/${modelName})`);

        // Escala Alvo
        const targetScaleStr = this.customScales[modelName] || '0.5 0.5 0.5';

        // Iniciar invisível ou com escala 0 para evitar glitch de posição
        el.setAttribute('scale', '0 0 0');
        el.setAttribute('visible', 'true');

        // Animação de Entrada (Pop-in)
        el.setAttribute('animation__spawn', {
            property: 'scale',
            to: targetScaleStr,
            dur: 800,
            easing: 'easeOutElastic'
        });

        // Posição Aleatória
        const angle = Math.random() * Math.PI * 2;
        const radius = 3 + Math.random() * (this.data.range - 3);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Y position: voador fica alto, terrestre fica NA SUPERFÍCIE (y=0)
        const y = isFlying ? (1.5 + Math.random() * 1.5) : 0;

        el.setAttribute('position', { x, y, z });

        // Animação de movimento
        if (isFlying) {
            // Pteradactal flutua no ar
            el.setAttribute('animation__float', {
                property: 'position',
                to: `${x} ${y + 0.5} ${z}`,
                dir: 'alternate',
                dur: 2000 + Math.random() * 1000,
                loop: true,
                easing: 'easeInOutSine'
            });
        }
        // Dinossauros terrestres NÃO têm animação de flutuação - ficam firmes no chão

        // Rotação aleatória inicial
        el.setAttribute('rotation', `0 ${Math.random() * 360} 0`);

        this.el.sceneEl.appendChild(el);
    },

    getRandomColor: function () {
        return '#FFFFFF';
    }
});
