AFRAME.registerComponent('weapon', {
    init: function () {
        this.shootBtn = document.getElementById('shoot-btn');
        this.shootBtn.addEventListener('click', this.shoot.bind(this));
        this.soundSystem = this.el.sceneEl.systems['sound-manager'];
    },

    shoot: function () {
        // Tocar som de tiro
        if (this.soundSystem) this.soundSystem.playSound('shoot');

        const raycaster = this.el.components.raycaster;
        raycaster.refreshObjects();
        const intersections = raycaster.intersections;

        // Posição inicial (arma/câmera)
        const startPos = new THREE.Vector3();
        this.el.object3D.getWorldPosition(startPos);

        // Posição final (alvo ou ponto distante)
        let endPos = new THREE.Vector3();
        let targetEl = null;

        if (intersections.length > 0) {
            // Acertou algo
            endPos.copy(intersections[0].point);
            targetEl = intersections[0].object.el;
        } else {
            // Não acertou nada, atira para longe na direção da câmera
            const direction = new THREE.Vector3();
            this.el.object3D.getWorldDirection(direction);
            direction.multiplyScalar(-1); // A-Frame cameras look down -Z
            endPos.copy(startPos).add(direction.multiplyScalar(20));
        }

        // Criar o projétil visual
        this.fireProjectile(startPos, endPos, targetEl);
        this.createMuzzleFlash();
    },

    fireProjectile: function (start, end, targetEl) {
        const projectile = document.createElement('a-entity');
        projectile.setAttribute('geometry', { primitive: 'sphere', radius: 0.05 });
        projectile.setAttribute('material', {
            color: '#FF6600',
            shader: 'flat',
            emissive: '#FF6600',
            emissiveIntensity: 0.5
        });
        projectile.setAttribute('position', start);

        this.el.sceneEl.appendChild(projectile);

        // Calcular duração baseada na distância (velocidade constante)
        const distance = start.distanceTo(end);
        const speed = 20; // metros por segundo
        // Garantir duração mínima para ser visível
        const duration = Math.max((distance / speed) * 1000, 100);

        // Animar posição
        projectile.setAttribute('animation', {
            property: 'position',
            to: `${end.x} ${end.y} ${end.z}`,
            dur: duration,
            easing: 'linear'
        });

        // Evento ao terminar animação
        setTimeout(() => {
            // Remover projétil
            if (projectile.parentNode) projectile.parentNode.removeChild(projectile);

            // Se tinha um alvo, processar impacto
            if (targetEl) {
                this.processHit(targetEl, end);
            }
        }, duration);
    },

    processHit: function (el, hitPosition) {
        // Todos os dinossauros dão pontos!
        if (el.classList.contains('dinosaur')) {
            // Dinossauro: Explode e ganha pontos
            el.setAttribute('explosion', '');

            // Criar brilho mágico ao acertar dinossauro
            const glowEntity = document.createElement('a-entity');
            glowEntity.setAttribute('position', hitPosition);
            glowEntity.setAttribute('magic-glow', {
                color: '#FF6600',
                duration: 1200,
                size: 0.6
            });
            this.el.sceneEl.appendChild(glowEntity);

            // Emitir evento com detalhes para o game-manager criar o texto flutuante
            this.el.sceneEl.emit('score-up', { position: hitPosition });

            // Emitir evento para spawner criar novo dinossauro
            this.el.sceneEl.emit('dinosaur-killed');

            // Som de sucesso
            if (this.soundSystem) this.soundSystem.playSound('score-up');
        }
    },

    createMuzzleFlash: function () {
        // Simples flash de luz ou som
        // Implementação futura
    }
});
