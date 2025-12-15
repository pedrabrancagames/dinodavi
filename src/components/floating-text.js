AFRAME.registerComponent('floating-text', {
    schema: {
        text: { type: 'string', default: '+10' },
        color: { type: 'color', default: '#FFF' },
        duration: { type: 'number', default: 1000 }
    },

    init: function () {
        const el = this.el;

        // Configurar texto
        el.setAttribute('text', {
            value: this.data.text,
            align: 'center',
            color: this.data.color,
            width: 4, // Tamanho relativo do texto
            shader: 'msdf', // Melhor qualidade
            font: 'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/roboto/Roboto-Bold.json'
        });

        // Garantir que olhe para a câmera (billboard)
        el.setAttribute('look-at', '[camera]');

        // Animação de subir
        el.setAttribute('animation__move', {
            property: 'position',
            to: `${el.object3D.position.x} ${el.object3D.position.y + 0.5} ${el.object3D.position.z}`,
            dur: this.data.duration,
            easing: 'easeOutQuad'
        });

        // Animação de sumir (fade out via opacidade)
        el.setAttribute('animation__fade', {
            property: 'text.opacity',
            from: 1,
            to: 0,
            dur: this.data.duration,
            easing: 'easeInQuad'
        });

        // Auto-destruição
        setTimeout(() => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, this.data.duration);
    }
});
