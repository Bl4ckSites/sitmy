/**
 * CÓDIGO FONTE — Sistema de Partículas (Canvas 2D Passivo)
 * Partículas flutuantes em tom verde fantasma, com conexões reativas à distância
 * e um fundo escuro profundo, quase infinito.
 */
(function() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    const particles = [];
    const numParticles = 45;
    const connectionDistance = 160;

    // Cores base
    const accentGreen = { r: 0, g: 240, b: 128 };
    const darkBg = '#0a0c0f';

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(randomY = false) {
            this.x = Math.random() * width;
            this.y = randomY ? Math.random() * height : height + 10;
            this.baseVx = (Math.random() - 0.5) * 0.18;
            this.baseVy = (Math.random() - 0.5) * 0.18;
            this.vx = this.baseVx;
            this.vy = this.baseVy;
            this.radius = Math.random() * 1.6 + 0.5;
            // Variação de opacidade ao longo do tempo
            this.phase = Math.random() * Math.PI * 2;
            this.speedFactor = 0.005 + Math.random() * 0.015;
            this.isCore = Math.random() < 0.15; // algumas partículas maiores e mais brilhantes
            if (this.isCore) {
                this.radius *= 1.8;
            }
        }

        update() {
            // Movimento suave com leve variação senoidal
            this.vx = this.baseVx + Math.sin(Date.now() * this.speedFactor + this.phase) * 0.03;
            this.vy = this.baseVy + Math.cos(Date.now() * this.speedFactor + this.phase) * 0.03;
            this.x += this.vx;
            this.y += this.vy;

            // Wrap around suave
            if (this.x < -15) this.x = width + 15;
            if (this.x > width + 15) this.x = -15;
            if (this.y < -15) this.y = height + 15;
            if (this.y > height + 15) this.y = -15;
        }

        draw(ctx) {
            const opacityBase = this.isCore ? 0.35 : 0.18;
            // Pulsação sutil de opacidade
            const pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.002 + this.phase);
            const opacity = opacityBase * pulse;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            const fillColor = `rgba(${accentGreen.r}, ${accentGreen.g}, ${accentGreen.b}, ${opacity})`;
            ctx.fillStyle = fillColor;
            ctx.fill();

            // Brilho extra para partículas núcleo
            if (this.isCore) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
                const glowColor = `rgba(${accentGreen.r}, ${accentGreen.g}, ${accentGreen.b}, ${opacity * 0.15})`;
                ctx.fillStyle = glowColor;
                ctx.fill();
            }
        }
    }

    function initParticles() {
        particles.length = 0;
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function drawBackground() {
        // Fundo gradiente escuro para dar profundidade
        const gradient = ctx.createRadialGradient(width * 0.3, height * 0.3, 0, width * 0.5, height * 0.5, Math.max(width, height) * 0.8);
        gradient.addColorStop(0, '#10161c');
        gradient.addColorStop(0.6, '#0a0c0f');
        gradient.addColorStop(1, '#050608');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    // Opacidade inversamente proporcional à distância, com leve tom verde
                    const opacity = (1 - dist / connectionDistance) * 0.07;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${accentGreen.r}, ${accentGreen.g}, ${accentGreen.b}, ${opacity})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        drawBackground();

        particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });

        drawConnections();
        requestAnimationFrame(animate);
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }

    window.addEventListener('resize', resize);

    // Iniciar após a introdução (evento disparado pelo loading.js)
    window.addEventListener('intro-complete', () => {
        resize();
        animate();
    });

    // Fallback se o evento nunca disparar (inicia após um curto delay)
    setTimeout(() => {
        if (particles.length === 0) {
            resize();
            animate();
        }
    }, 5000);
})();