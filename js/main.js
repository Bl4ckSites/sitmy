/**
 * CÓDIGO FONTE
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
    // AJUSTE RESPONSIVO: evita corte de letras em telas pequenas
    // ============================================================
    function applyResponsiveTextFix() {
        // Adiciona regras CSS dinamicamente para garantir quebra de palavras e tamanho adequado
        if (!document.getElementById('responsive-fix-styles')) {
            const style = document.createElement('style');
            style.id = 'responsive-fix-styles';
            style.textContent = `
                /* Evita corte de letras em títulos e textos */
                .typing-title, .card-text, .services-list li, .process-flow p {
                    word-break: break-word;
                    white-space: normal;
                    overflow-wrap: break-word;
                    max-width: 100%;
                }
                /* Ajuste adicional para mobile */
                @media (max-width: 600px) {
                    .typing-title {
                        font-size: clamp(1.2rem, 5vw, 1.8rem);
                        line-height: 1.3;
                    }
                    .glass-card {
                        padding: 1rem;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    applyResponsiveTextFix();

    // ============================================================
    // CURSOR CUSTOMIZADO (DESKTOP ONLY) - levemente reduzido
    // ============================================================
    const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;

    function updateCursorVisibility() {
        if (isDesktop()) {
            cursor.style.display = 'block';
            // Reduz o tamanho do cursor (antes provavelmente 20x20, agora 16x16)
            cursor.style.width = '16px';
            cursor.style.height = '16px';
            cursor.style.borderRadius = '50%';
            cursor.style.backgroundColor = 'var(--accent-color, #ffffff)';
            cursor.style.mixBlendMode = 'difference';
            cursor.style.pointerEvents = 'none';
            cursor.style.position = 'fixed';
            cursor.style.zIndex = '9999';
            cursor.style.transition = 'transform 0.1s ease, width 0.2s, height 0.2s';
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
            if (isDesktop()) {
                cursor.classList.add('hover');
                // Efeito hover levemente menor que o original (antes 2x, agora 1.6x)
                cursor.style.transform = 'scale(1.6)';
            }
        });
        el.addEventListener('mouseleave', () => {
            if (isDesktop()) {
                cursor.classList.remove('hover');
                cursor.style.transform = 'scale(1)';
            }
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
            resetSectionAnimations(activeSection);
        }

        // Ativa nova seção
        const newSection = document.getElementById(sectionId);
        if (newSection) {
            newSection.classList.add('active');
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
        section.querySelectorAll('.card-text, .services-list, .process-flow, .contact-buttons, .privacy-indicator')
            .forEach(el => el.classList.remove('visible'));
        section.querySelectorAll('.typing-title').forEach(el => {
            el.classList.remove('typing', 'typing-done');
            el.textContent = '';
        });
        // Força reset da animação do glass-card
        const glassCard = section.querySelector('.glass-card');
        if (glassCard) {
            glassCard.style.animation = 'none';
            glassCard.offsetHeight;
            glassCard.style.animation = '';
        }
    }

    function triggerSectionAnimations(section) {
        const titles = section.querySelectorAll('.typing-title');
        titles.forEach(title => {
            typeTitle(title);
        });

        const fadeElements = section.querySelectorAll('.card-text, .services-list, .process-flow, .contact-buttons, .privacy-indicator');
        setTimeout(() => {
            fadeElements.forEach(el => el.classList.add('visible'));
        }, 400);
    }

    // ============================================================
    // EFEITO DE DIGITAÇÃO (velocidade ajustável para responsividade)
    // ============================================================
    function typeTitle(element) {
        const text = element.dataset.text;
        if (!text) return;

        element.classList.add('typing');
        let index = 0;
        // Velocidade um pouco mais rápida em mobile para evitar atrasos na quebra de linha
        const isMobile = window.matchMedia('(max-width: 600px)').matches;
        const speed = isMobile ? 30 : 50; // ms por caractere

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
        if (window.innerWidth > 900) return;

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

/**
 * CÓDIGO FONTE — Som de clique (Web Audio API)
 * Feedback sonoro sutil ao interagir com links e botões.
 * (sem alterações, mantido original)
 */
(function() {
    let audioCtx = null;

    function playClick() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const now = audioCtx.currentTime;

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
            // Silencia erro
        }
    }

    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, .nav-item, .contact-btn, .logo, .insta-link');
        if (target) {
            playClick();
        }
    });
})();
