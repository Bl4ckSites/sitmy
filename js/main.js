/**
 * CÓDIGO FONTE — Controlador Principal
 * Navegação suave, cursor customizado, efeito de digitação, glass cards.
 */

(function() {
    // Elementos
    const cursor = document.getElementById('cursor');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const yearSpan = document.getElementById('current-year');

    let currentSection = 'home';

    // ============================================================
    // CURSOR CUSTOMIZADO (DESKTOP ONLY)
    // ============================================================
    const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;

    function updateCursorVisibility() {
        if (isDesktop()) {
            cursor.style.display = 'block';
        } else {
            cursor.style.display = 'none';
        }
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDesktop()) return;
        cursor.style.top = `${e.clientY}px`;
        cursor.style.left = `${e.clientX}px`;
    });

    document.querySelectorAll('a, .nav-item, .contact-btn, .glass-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (isDesktop()) cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });

    window.addEventListener('resize', updateCursorVisibility);
    updateCursorVisibility();

    // ============================================================
    // ANO ATUAL NO FOOTER DO SIDEBAR
    // ============================================================
    yearSpan.textContent = new Date().getFullYear();

    // ============================================================
    // NAVEGAÇÃO SUAVE COM ATIVAÇÃO DE SEÇÕES
    // ============================================================
    function activateSection(sectionId) {
        if (currentSection === sectionId) return;

        // Desativa seção atual
        const activeSection = document.querySelector('.section.active');
        if (activeSection) {
            activeSection.classList.remove('active');
            // Remove classes de visibilidade dos elementos internos
            resetSectionAnimations(activeSection);
        }

        // Ativa nova seção
        const newSection = document.getElementById(sectionId);
        if (newSection) {
            newSection.classList.add('active');
            // Inicia animações após um pequeno delay
            setTimeout(() => {
                triggerSectionAnimations(newSection);
            }, 100);
        }

        // Atualiza links ativos
        navItems.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        currentSection = sectionId;
    }

    function resetSectionAnimations(section) {
        // Remove classes de visibilidade dos textos
        section.querySelectorAll('.card-text, .services-list, .process-flow, .contact-buttons, .privacy-indicator')
            .forEach(el => el.classList.remove('visible'));
        // Reseta títulos com efeito de digitação
        section.querySelectorAll('.typing-title').forEach(el => {
            el.classList.remove('typing', 'typing-done');
            el.textContent = '';
        });
    }

    function triggerSectionAnimations(section) {
        // Efeito de digitação nos títulos
        const titles = section.querySelectorAll('.typing-title');
        titles.forEach(title => {
            typeTitle(title);
        });

        // Fade-in dos textos após digitação
        const fadeElements = section.querySelectorAll('.card-text, .services-list, .process-flow, .contact-buttons, .privacy-indicator');
        setTimeout(() => {
            fadeElements.forEach(el => el.classList.add('visible'));
        }, 400);
    }

    // ============================================================
    // EFEITO DE DIGITAÇÃO
    // ============================================================
    function typeTitle(element) {
        const text = element.dataset.text;
        if (!text) return;

        element.classList.add('typing');
        let index = 0;
        const speed = 50; // ms por caractere

        function type() {
            if (index < text.length) {
                element.textContent += text[index];
                index++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing');
                element.classList.add('typing-done');
            }
        }

        type();
    }

    // ============================================================
    // CLIQUE NOS LINKS DE NAVEGAÇÃO
    // ============================================================
    navItems.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            if (sectionId) {
                // Scroll suave até a seção (se necessário)
                const target = document.getElementById(sectionId);
                if (target && window.innerWidth <= 900) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                activateSection(sectionId);
            }
        });
    });

    // ============================================================
    // INICIALIZAÇÃO APÓS INTRO
    // ============================================================
    window.addEventListener('intro-complete', () => {
        // Ativa a seção home com animações
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.classList.add('active');
            setTimeout(() => {
                triggerSectionAnimations(homeSection);
            }, 200);
        }
    });

    // ============================================================
    // ATUALIZAR SEÇÃO ATIVA AO ROLAR (MOBILE)
    // ============================================================
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (window.innerWidth > 900) return; // Apenas mobile

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollPos = window.scrollY + 100;

            sections.forEach(section => {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;

                if (scrollPos >= top && scrollPos < bottom) {
                    const id = section.id;
                    if (currentSection !== id) {
                        activateSection(id);
                    }
                }
            });
        }, 100);
    });

})();
function resetSectionAnimations(section) {
    // Remove classes de visibilidade dos textos
    section.querySelectorAll('.card-text, .services-list, .process-flow, .contact-buttons, .privacy-indicator')
        .forEach(el => el.classList.remove('visible'));
    // Reseta títulos com efeito de digitação
    section.querySelectorAll('.typing-title').forEach(el => {
        el.classList.remove('typing', 'typing-done');
        el.textContent = '';
    });
    // Força reset da animação do glass-card (remove e re-adiciona a classe para permitir re-animação)
    const glassCard = section.querySelector('.glass-card');
    if (glassCard) {
        glassCard.style.animation = 'none';
        glassCard.offsetHeight; // trigger reflow
        glassCard.style.animation = '';
    }
}
/**
 * CÓDIGO FONTE — Som de clique (Web Audio API)
 * Feedback sonoro sutil ao interagir com links e botões.
 */
(function() {
    let audioCtx = null;

    function playClick() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Garante que o contexto esteja ativo (autoplay policy)
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const now = audioCtx.currentTime;

            // Oscilador principal (tom agudo breve)
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.05);

            // Pequeno ruído para dar textura
            const bufferSize = audioCtx.sampleRate * 0.04;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.04;
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseGain = audioCtx.createGain();
            noiseGain.gain.setValueAtTime(0.06, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            noise.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);
            noise.start(now);
            noise.stop(now + 0.04);
        } catch (e) {
            // Silencia caso o navegador bloqueie
        }
    }

    // Dispara o som em todos os links e botões (exclui interações de input, etc.)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, .nav-item, .contact-btn, .logo, .insta-link');
        if (target) {
            playClick();
        }
    });
})();