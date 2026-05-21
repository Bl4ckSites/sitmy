/**
 * CÓDIGO FONTE — Sistema de Partículas (Canvas 2D) com 3 Níveis de Performance
 * - Celular (≤ 768px): leve, sem conexões, sem glow.
 * - Tablet (768px-1024px): moderado, conexões simples.
 * - Desktop (> 1024px): completo, conexões densas, glow total.
 */
(function() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationId = null;

    // ============================================================
    // 1. DETECÇÃO DE NÍVEL DE DESEMPENHO
    // ============================================================
    let performanceLevel = 'desktop'; // 'mobile', 'tablet', 'desktop'

    function setPerformanceLevel() {
        const w = window.innerWidth;
        if (w <= 768) {
            performanceLevel = 'mobile';
        } else if (w <= 1024) {
            performanceLevel = 'tablet';
        } else {
            performanceLevel = 'desktop';
        }
        // Opcional: reduz ainda mais se o dispositivo for fraco (núcleos < 4)
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4 && performanceLevel === 'desktop') {
            performanceLevel = 'tablet';
        }
    }

    // ============================================================
    // 2. PARÂMETROS POR NÍVEL
    // ============================================================
    let MAX_PARTICLES = 65;
    let CONNECTION_DISTANCE = 200;
    let PARTICLE_BASE_SIZE = 2.0;
    let PARTICLE_CORE_SCALE = 2.2;
    let OPACITY_BASE = 0.65;
    let OPACITY_CORE = 0.85;
    let LINE_WIDTH = 1.2;
    let ENABLE_CONNECTIONS = true;
    let ENABLE_GLOW = true;
    let ENABLE_SHADOWS = true;
    let PARTICLE_SPEED = 0.22;     // velocidade base (vx/vy)
    let OSCILLATION_STRENGTH = 0.008; // intensidade da oscilação senoidal

    function updateParamsByLevel() {
        if (performanceLevel === 'mobile') {
            MAX_PARTICLES = 18;
            CONNECTION_DISTANCE = 0;      // sem conexões
            PARTICLE_BASE_SIZE = 1.2;
            PARTICLE_CORE_SCALE = 1.5;
            OPACITY_BASE = 0.4;
            OPACITY_CORE = 0.6;
            ENABLE_CONNECTIONS = false;
            ENABLE_GLOW = false;
            ENABLE_SHADOWS = false;
            PARTICLE_SPEED = 0.12;
            OSCILLATION_STRENGTH = 0.002;
        } 
        else if (performanceLevel === 'tablet') {
            MAX_PARTICLES = 40;
            CONNECTION_DISTANCE = 160;
            PARTICLE_BASE_SIZE = 1.6;
            PARTICLE_CORE_SCALE = 1.8;
            OPACITY_BASE = 0.5;
            OPACITY_CORE = 0.7;
            ENABLE_CONNECTIONS = true;
            ENABLE_GLOW = true;      // glow leve
            ENABLE_SHADOWS = false;   // sem sombras pesadas
            PARTICLE_SPEED = 0.18;
            OSCILLATION_STRENGTH = 0.005;
        } 
        else { // desktop
            MAX_PARTICLES = 70;
            CONNECTION_DISTANCE = 210;
            PARTICLE_BASE_SIZE = 2.2;
            PARTICLE_CORE_SCALE = 2.5;
            OPACITY_BASE = 0.75;
            OPACITY_CORE = 0.95;
            ENABLE_CONNECTIONS = true;
            ENABLE_GLOW = true;
            ENABLE_SHADOWS = true;
            PARTICLE_SPEED = 0.24;
            OSCILLATION_STRENGTH = 0.012;
        }
    }

    // Cores fixas (verde vibrante)
    const accentColor = { r: 0, g: 255, b: 170 };

    // ============================================================
    // 3. CLASSE PARTÍCULA (adaptada ao nível)
    // ============================================================
    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(randomY = false) {
            this.x = Math.random() * width;
            this.y = randomY ? Math.random() * height : height + 15;
            // Velocidade conforme nível
            this.vx = (Math.random() - 0.5) * PARTICLE_SPEED;
            this.vy = (Math.random() - 0.5) * PARTICLE_SPEED;
            // Tamanho
            let baseRadius = PARTICLE_BASE_SIZE + (Math.random() * 1.2);
            if (width < 768) baseRadius *= 0.8;
            this.radius = baseRadius;
            this.phase = Math.random() * Math.PI * 2;
            this.speedFactor = 0.005 + Math.random() * 0.015;
            this.isCore = (performanceLevel === 'desktop') ? (Math.random() < 0.2) : (Math.random() < 0.1);
            if (this.isCore) {
                this.radius *= PARTICLE_CORE_SCALE;
            }
        }

        update() {
            // Movimento com oscilação (mais fraca em mobile/tablet)
            const time = Date.now() * 0.002;
            this.vx += Math.sin(time + this.phase) * OSCILLATION_STRENGTH;
            this.vy += Math.cos(time + this.phase) * OSCILLATION_STRENGTH;
            const maxSpeed = PARTICLE_SPEED * 1.5;
            this.vx = Math.min(maxSpeed, Math.max(-maxSpeed, this.vx));
            this.vy = Math.min(maxSpeed, Math.max(-maxSpeed, this.vy));

            this.x += this.vx;
            this.y += this.vy;

            // Wrap-around
            const margin = 30;
            if (this.x < -margin) this.x = width + margin;
            if (this.x > width + margin) this.x = -margin;
            if (this.y < -margin) this.y = height + margin;
            if (this.y > height + margin) this.y = -margin;
        }

        draw(ctx) {
            let opacity = this.isCore ? OPACITY_CORE : OPACITY_BASE;
            if (ENABLE_GLOW) {
                const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.003 + this.phase);
                opacity *= pulse;
            }
            
            if (ENABLE_SHADOWS) {
                ctx.shadowColor = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, 0.5)`;
                ctx.shadowBlur = this.isCore ? 10 : 5;
            }
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${opacity})`;
            ctx.fill();
            
            // Glow adicional apenas desktop
            if (this.isCore && ENABLE_GLOW && performanceLevel === 'desktop') {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 1.6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${opacity * 0.2})`;
                ctx.fill();
            }
            
            if (ENABLE_SHADOWS) ctx.shadowBlur = 0;
        }
    }

    // ============================================================
    // 4. CONEXÕES (apenas se habilitado)
    // ============================================================
    function drawConnections() {
        if (!ENABLE_CONNECTIONS || CONNECTION_DISTANCE === 0) return;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DISTANCE) {
                    let intensity = (1 - dist / CONNECTION_DISTANCE) * 0.3;
                    let opacity = Math.min(0.4, intensity);
                    // Tablet: conexões mais sutis
                    if (performanceLevel === 'tablet') opacity *= 0.7;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${opacity})`;
                    ctx.lineWidth = (performanceLevel === 'desktop') ? LINE_WIDTH : (LINE_WIDTH * 0.7);
                    if (ENABLE_SHADOWS) {
                        ctx.shadowBlur = 2;
                        ctx.shadowColor = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, 0.3)`;
                    }
                    ctx.stroke();
                }
            }
        }
        ctx.shadowBlur = 0;
    }

    // ============================================================
    // 5. FUNDO (gradiente para todos, leve em mobile)
    // ============================================================
    function drawBackground() {
        if (performanceLevel === 'mobile') {
            // Fundo sólido escuro para economizar recursos
            ctx.fillStyle = '#03060a';
            ctx.fillRect(0, 0, width, height);
        } else {
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
    }

    // ============================================================
    // 6. GERENCIAMENTO DE PARTÍCULAS
    // ============================================================
    function initParticles() {
        particles = [];
        const count = MAX_PARTICLES;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function resizeAndRestart() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        setPerformanceLevel();
        updateParamsByLevel();
        initParticles();
    }

    // ============================================================
    // 7. ANIMAÇÃO (requestAnimationFrame)
    // ============================================================
    function animate() {
        drawBackground();
        for (let p of particles) {
            p.update();
            p.draw(ctx);
        }
        drawConnections();
        animationId = requestAnimationFrame(animate);
    }

    // ============================================================
    // 8. EVENTOS DE RESIZE (com debounce)
    // ============================================================
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeAndRestart();
        }, 200);
    });

    // ============================================================
    // 9. START (aguarda intro-complete ou fallback)
    // ============================================================
    function start() {
        resizeAndRestart();
        if (animationId) cancelAnimationFrame(animationId);
        animate();
    }

    window.addEventListener('intro-complete', start);
    setTimeout(() => {
        if (particles.length === 0) start();
    }, 4000);
})();
