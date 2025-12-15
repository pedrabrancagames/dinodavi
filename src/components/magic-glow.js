// Componente de brilho mágico ao coletar lixo
AFRAME.registerComponent('magic-glow', {
    schema: {
        color: { type: 'color', default: '#F4D03F' },
        duration: { type: 'number', default: 1000 },
        size: { type: 'number', default: 0.5 }
    },

    init: function () {
        this.createGlow();
        this.animate();
    },

    createGlow: function () {
        const position = this.el.object3D.position;

        // Anel externo brilhante
        this.outerRing = document.createElement('a-ring');
        this.outerRing.setAttribute('position', position);
        this.outerRing.setAttribute('radius-inner', this.data.size * 0.3);
        this.outerRing.setAttribute('radius-outer', this.data.size * 0.5);
        this.outerRing.setAttribute('color', this.data.color);
        this.outerRing.setAttribute('opacity', 0.8);
        this.outerRing.setAttribute('material', {
            transparent: true,
            shader: 'flat',
            side: 'double'
        });
        this.outerRing.setAttribute('rotation', '-90 0 0');
        this.el.sceneEl.appendChild(this.outerRing);

        // Anel interno
        this.innerRing = document.createElement('a-ring');
        this.innerRing.setAttribute('position', position);
        this.innerRing.setAttribute('radius-inner', this.data.size * 0.1);
        this.innerRing.setAttribute('radius-outer', this.data.size * 0.3);
        this.innerRing.setAttribute('color', '#FFFFFF');
        this.innerRing.setAttribute('opacity', 1);
        this.innerRing.setAttribute('material', {
            transparent: true,
            shader: 'flat',
            side: 'double'
        });
        this.innerRing.setAttribute('rotation', '-90 0 0');
        this.el.sceneEl.appendChild(this.innerRing);

        // Partículas de estrelas
        this.stars = [];
        for (let i = 0; i < 8; i++) {
            const star = document.createElement('a-sphere');
            const angle = (Math.PI * 2 * i) / 8;
            const radius = this.data.size * 0.4;

            star.setAttribute('radius', 0.03);
            star.setAttribute('color', this.data.color);
            star.setAttribute('opacity', 1);
            star.setAttribute('position', {
                x: position.x + Math.cos(angle) * radius,
                y: position.y,
                z: position.z + Math.sin(angle) * radius
            });
            star.setAttribute('material', {
                transparent: true,
                shader: 'flat',
                emissive: this.data.color,
                emissiveIntensity: 0.5
            });

            this.stars.push({
                el: star,
                angle: angle,
                radius: radius
            });

            this.el.sceneEl.appendChild(star);
        }
    },

    animate: function () {
        const startTime = Date.now();
        const duration = this.data.duration;

        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Animar anéis
            if (this.outerRing && this.outerRing.parentNode) {
                const scale = 1 + progress * 2;
                this.outerRing.object3D.scale.set(scale, scale, 1);
                this.outerRing.setAttribute('opacity', (1 - progress) * 0.8);
            }

            if (this.innerRing && this.innerRing.parentNode) {
                const scale = 1 + progress * 1.5;
                this.innerRing.object3D.scale.set(scale, scale, 1);
                this.innerRing.setAttribute('opacity', 1 - progress);
            }

            // Animar estrelas
            this.stars.forEach((star, i) => {
                if (!star.el.parentNode) return;

                const pos = star.el.object3D.position;
                const basePos = this.el.object3D.position;
                const expandedRadius = star.radius * (1 + progress * 2);
                const angle = star.angle + progress * Math.PI * 2;

                pos.x = basePos.x + Math.cos(angle) * expandedRadius;
                pos.y = basePos.y + progress * 0.5;
                pos.z = basePos.z + Math.sin(angle) * expandedRadius;

                star.el.setAttribute('opacity', 1 - progress);
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
        if (this.outerRing && this.outerRing.parentNode) {
            this.outerRing.parentNode.removeChild(this.outerRing);
        }
        if (this.innerRing && this.innerRing.parentNode) {
            this.innerRing.parentNode.removeChild(this.innerRing);
        }
        this.stars.forEach(star => {
            if (star.el.parentNode) {
                star.el.parentNode.removeChild(star.el);
            }
        });

        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }
});
