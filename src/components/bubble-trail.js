// Componente de rastro de bolhas para projéteis
AFRAME.registerComponent('bubble-trail', {
    schema: {
        enabled: { type: 'boolean', default: true },
        interval: { type: 'number', default: 50 }, // ms entre bolhas
        bubbleSize: { type: 'number', default: 0.05 },
        bubbleLife: { type: 'number', default: 1000 } // ms
    },

    init: function () {
        this.lastBubbleTime = 0;
        this.bubbles = [];
    },

    tick: function (time) {
        if (!this.data.enabled) return;

        // Criar nova bolha se passou o intervalo
        if (time - this.lastBubbleTime > this.data.interval) {
            this.createBubble();
            this.lastBubbleTime = time;
        }

        // Limpar bolhas antigas
        this.cleanupOldBubbles(time);
    },

    createBubble: function () {
        const position = this.el.object3D.position.clone();

        const bubble = document.createElement('a-sphere');
        bubble.setAttribute('radius', this.data.bubbleSize);
        bubble.setAttribute('color', '#98D8C8');
        bubble.setAttribute('opacity', 0.6);
        bubble.setAttribute('position', position);

        // Material com transparência
        bubble.setAttribute('material', {
            transparent: true,
            opacity: 0.6,
            shader: 'flat'
        });

        const createdAt = Date.now();

        this.bubbles.push({
            el: bubble,
            createdAt: createdAt,
            startY: position.y
        });

        this.el.sceneEl.appendChild(bubble);

        // Animar bolha subindo
        this.animateBubble(bubble, createdAt);
    },

    animateBubble: function (bubble, createdAt) {
        const duration = this.data.bubbleLife;
        const startY = bubble.object3D.position.y;

        const animate = () => {
            if (!bubble.parentNode) return;

            const elapsed = Date.now() - createdAt;
            const progress = elapsed / duration;

            if (progress >= 1) {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
                return;
            }

            // Subir e oscilar
            const pos = bubble.object3D.position;
            pos.y = startY + progress * 0.3;
            pos.x += Math.sin(progress * Math.PI * 4) * 0.002;
            pos.z += Math.cos(progress * Math.PI * 4) * 0.002;

            // Fade out
            const opacity = (1 - progress) * 0.6;
            bubble.setAttribute('opacity', opacity);

            // Crescer levemente
            const scale = 1 + progress * 0.5;
            bubble.object3D.scale.set(scale, scale, scale);

            requestAnimationFrame(animate);
        };

        animate();
    },

    cleanupOldBubbles: function (currentTime) {
        this.bubbles = this.bubbles.filter(b => {
            const age = currentTime - b.createdAt;
            if (age > this.data.bubbleLife) {
                if (b.el.parentNode) {
                    b.el.parentNode.removeChild(b.el);
                }
                return false;
            }
            return true;
        });
    },

    remove: function () {
        // Limpar todas as bolhas ao remover componente
        this.bubbles.forEach(b => {
            if (b.el.parentNode) {
                b.el.parentNode.removeChild(b.el);
            }
        });
        this.bubbles = [];
    }
});
