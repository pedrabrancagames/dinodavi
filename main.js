import 'aframe';
import 'aframe-extras';
import './src/components/spawner.js';
import './src/components/weapon.js';
import './src/components/explosion.js';
import './src/components/floating-text.js';
import './src/components/water-particles.js';
import './src/components/bubble-trail.js';
import './src/components/magic-glow.js';
import './src/systems/game-manager.js';
import './src/systems/sound-manager.js';

console.log('Jogo de Tiro RA iniciado!');

if (!window.isSecureContext) {
    alert('ERRO: WebXR requer HTTPS ou Localhost. Se você está acessando via IP na rede local, configure HTTPS ou use Port Forwarding via USB.');
}

