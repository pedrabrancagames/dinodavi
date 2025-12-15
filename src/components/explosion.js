AFRAME.registerComponent('explosion', {
    init: function () {
        const el = this.el;
        const position = el.getAttribute('position');
        const scene = el.sceneEl;
        const soundSystem = scene.systems['sound-manager'];

        // Tocar som
        if (soundSystem) soundSystem.playSound('explosion');

        // 1. Criar efeito visual de explosão (partículas)
        this.createExplosionParticles(scene, position);

        // 2. Esconder o objeto imediatamente (para dar feedback instantâneo)
        el.object3D.visible = false;

        // 3. Remover o objeto do DOM
        // Usamos setTimeout 0 para garantir que saia do fluxo atual, mas seja rápido
        setTimeout(() => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, 0);
    },

    createExplosionParticles: function (scene, position) {
        const particleCount = 15; // Aumentado
        const colors = ['#FF0000', '#FFA500', '#FFFF00', '#FFFFFF'];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('a-entity');

            // Tamanho variado
            const size = 0.05 + Math.random() * 0.1;

            // Geometria simples para performance
            particle.setAttribute('geometry', { primitive: 'box', width: size, height: size, depth: size });
            particle.setAttribute('material', {
                color: colors[Math.floor(Math.random() * colors.length)],
                shader: 'flat'
            });

            particle.setAttribute('position', position);

            // Direção aleatória esférica
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 2 + Math.random() * 2; // Raio da explosão

            const dirX = r * Math.sin(phi) * Math.cos(theta);
            const dirY = r * Math.sin(phi) * Math.sin(theta);
            const dirZ = r * Math.cos(phi);

            // Animação de expansão
            particle.setAttribute('animation', {
                property: 'position',
                to: `${position.x + dirX} ${position.y + dirY} ${position.z + dirZ}`,
                dur: 600 + Math.random() * 200,
                easing: 'easeOutExpo'
            });

            // Animação de rotação
            particle.setAttribute('animation__rot', {
                property: 'rotation',
                to: `${Math.random() * 360} ${Math.random() * 360} ${Math.random() * 360}`,
                dur: 800,
                easing: 'linear'
            });

            // Animação de sumir
            particle.setAttribute('animation__scale', {
                property: 'scale',
                to: '0 0 0',
                dur: 800,
                easing: 'easeInQuad'
            });

            scene.appendChild(particle);

            // Limpeza automática da partícula
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }
    }
});
