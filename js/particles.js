/**
 * CÓDIGO FONTE — Sistema de Partículas (Canvas 2D) – VERSÃO COM VISIBILIDADE E BRILHO APERFEIÇOADOS
 * Partículas verdes vibrantes com conexões luminosas e fundo gradiente profundo.
 * Otimizado para dispositivos móveis e desktops.
 */
(function() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let animationId = null;

    // Parâmetros ajustáveis para melhor visibilidade
    const MAX_PARTICLES_DESKTOP = 65;
    const MAX_PARTICLES_MOBILE = 35;
    const CONNECTION_DISTANCE = 200;      // aumentado para mais conexões
    const PARTICLE_BASE_SIZE = 2.0;       // maior que antes (antes ~1.6)
    const PARTICLE_CORE_SCALE = 2.2;      // brilho extra
    const GLOW_INTENSITY = 0.4;           // mais glow
    const OPACITY_BASE = 0.65;            // muito mais visível que 0.18
    const OPACITY_CORE = 0.85;
    const LINE_WIDTH = 1.2;               // linhas mais grossas

    // Cores vibrantes (verde elétrico)
    const accentColor = { r: 0, g: 255, b: 170 };  // #00ffaa

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(randomY = false) {
            this.x = Math.random() * width;
            this.y = randomY ? Math.random() * height : height + 15;
            this.vx = (Math.random() - 0.5) * 0.22;
            this.vy = (Math.random() - 0.5) * 0.22;
            // Tamanho da partícula base + variação
            this.radius = (Math.random() * 1.2 + PARTICLE_BASE_SIZE) * (width < 768 ? 0.9 : 1);
            this.phase = Math.random() * Math.PI * 2;
            this.speedFactor = 0.008 + Math.random() * 0.018;
            this.isCore = Math.random() < 0.2; // 20% são núcleos brilhantes
            if (this.isCore) {
                this.radius *= PARTICLE_CORE_SCALE;
            }
        }

        update() {
            // Movimento com pequena oscilação suave
            const time = Date.now() * 0.002;
            this.vx += Math.sin(time + this.phase) * 0.008;
            this.vy += Math.cos(time + this.phase) * 0.008;
            // Limita velocidade para não fugir muito
            const maxSpeed = 0.8;
            this.vx = Math.min(maxSpeed, Math.max(-maxSpeed, this.vx));
            this.vy = Math.min(maxSpeed, Math.max(-maxSpeed, this.vy));

            this.x += this.vx;
            this.y += this.vy;

            // Wrap-around com borda suave
            if (this.x < -30) this.x = width + 30;
            if (this.x > width + 30) this.x = -30;
            if (this.y < -30) this.y = height + 30;
            if (this.y > height + 30) this.y = -30;
        }

        draw(ctx) {
            // Pulsação mais perceptível
            const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.003 + this.phase);
            let opacity = this.isCore ? OPACITY_CORE : OPACITY_BASE;
            opacity *= pulse;

            // Desenha o glow (sombra brilhante) antes da partícula
            ctx.shadowColor = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, 0.8)`;
            ctx.shadowBlur = this.isCore ? 12 : 6;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${opacity})`;
            ctx.fill();
            
            // Glow adicional para núcleos (círculo mais largo)
            if (this.isCore) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 1.8, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${opacity * 0.25})`;
                ctx.fill();
            }
            
            // Reseta sombra para não afetar outros desenhos (opcional)
            ctx.shadowBlur = 0;
        }
    }

    function getDynamicParticleCount() {
        return width < 768 ? MAX_PARTICLES_MOBILE : MAX_PARTICLES_DESKTOP;
    }

    function initParticles() {
        const count = getDynamicParticleCount();
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawBackground() {
        // Gradiente radial mais dramático e escuro, com leve tom esverdeado
        const gradient = ctx.createRadialGradient(
            width * 0.4, height * 0.3, 0,
            width * 0.6, height * 0.7, Math.max(width, height) * 0.7
        );
        gradient.addColorStop(0, '#0a121c');
        gradient.addColorStop(0.5, '#03060a');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DISTANCE) {
                    // Opacidade mais alta e com brilho
                    const intensity = (1 - dist / CONNECTION_DISTANCE) * 0.35; // antes 0.07, agora até 0.35
                    const opacity = Math.min(0.45, intensity);
                    
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${opacity})`;
                    ctx.lineWidth = LINE_WIDTH;
                    ctx.shadowBlur = 3;
                    ctx.shadowColor = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, 0.5)`;
                    ctx.stroke();
                }
            }
        }
        ctx.shadowBlur = 0; // reset
    }

    function animate() {
        drawBackground();
        particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });
        drawConnections();
        animationId = requestAnimationFrame(animate);
    }

    function resizeAndRestart() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        
        // Reinicia partículas com novo tamanho
        initParticles();
    }

    // Evento de resize com debounce para melhor performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeAndRestart();
        }, 150);
    });

    // Inicialização após a intro (ou fallback)
    function start() {
        resizeAndRestart();
        if (animationId) cancelAnimationFrame(animationId);
        animate();
    }

    window.addEventListener('intro-complete', start);
    // Fallback seguro
    setTimeout(() => {
        if (particles.length === 0) start();
    }, 4000);
})();
