// Componente de partículas de água
AFRAME.registerComponent('water-particles', {
    schema: {
        count: { type: 'number', default: 12 },
        color: { type: 'color', default: '#4FB3D9' },
        size: { type: 'number', default: 0.1 },
        spread: { type: 'number', default: 0.5 },
        duration: { type: 'number', default: 800 }
    },

    init: function () {
        this.particles = [];
        this.createParticles();
        this.animate();
    },

    createParticles: function () {
        const position = this.el.object3D.position;

        for (let i = 0; i < this.data.count; i++) {
            const particle = document.createElement('a-sphere');

            // Posição inicial com spread aleatório
            const angle = (Math.PI * 2 * i) / this.data.count;
            const spreadX = Math.cos(angle) * Math.random() * this.data.spread;
            const spreadY = Math.random() * this.data.spread;
            const spreadZ = Math.sin(angle) * Math.random() * this.data.spread;

            particle.setAttribute('radius', this.data.size * (0.5 + Math.random() * 0.5));
            particle.setAttribute('color', this.data.color);
            particle.setAttribute('opacity', 0.8);
            particle.setAttribute('position', {
                x: position.x + spreadX,
                y: position.y + spreadY,
                z: position.z + spreadZ
            });

            // Velocidade aleatória
            const velocity = {
                x: (Math.random() - 0.5) * 2,
                y: Math.random() * 2 + 1,
                z: (Math.random() - 0.5) * 2
            };

            this.particles.push({
                el: particle,
                velocity: velocity,
                life: 1.0
            });

            this.el.sceneEl.appendChild(particle);
        }
    },

    animate: function () {
        const startTime = Date.now();
        const duration = this.data.duration;

        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.particles.forEach(p => {
                if (!p.el.parentNode) return;

                const pos = p.el.object3D.position;

                // Atualizar posição
                pos.x += p.velocity.x * 0.016;
                pos.y += p.velocity.y * 0.016;
                pos.z += p.velocity.z * 0.016;

                // Aplicar gravidade
                p.velocity.y -= 0.05;

                // Fade out
                const opacity = (1 - progress) * 0.8;
                p.el.setAttribute('opacity', opacity);

                // Encolher
                const scale = 1 - progress * 0.5;
                p.el.object3D.scale.set(scale, scale, scale);
            });

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                this.cleanup();
            }
        };

        update();
    },

    cleanup: function () {
        this.particles.forEach(p => {
            if (p.el.parentNode) {
                p.el.parentNode.removeChild(p.el);
            }
        });
        this.particles = [];

        // Remover o componente pai
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }
});
