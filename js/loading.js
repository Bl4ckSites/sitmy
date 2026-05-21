/**
 * CÓDIGO FONTE — Sequência de Introdução
 * Exibe o nome DENSE66 e o status criptografado, depois revela o site.
 */

(function() {
    const introOverlay = document.getElementById('intro-overlay');
    const introStatus = document.getElementById('intro-status');
    const app = document.getElementById('app');

    // Simula verificação de sinal
    function startIntro() {
        // Mantém a tela por 2 segundos
        setTimeout(() => {
            // Muda o status para "FEITO"
            introStatus.textContent = '[ CONEXÃO ESTABELECIDA ]';
            introStatus.style.color = '#00F080';

            // Pequena pausa e fade out
            setTimeout(() => {
                introOverlay.style.transition = 'opacity 0.6s ease-out';
                introOverlay.style.opacity = '0';

                // Revela o app
                setTimeout(() => {
                    app.classList.remove('invisible');
                    // Remove overlay do DOM
                    setTimeout(() => {
                        introOverlay.style.display = 'none';
                        // Dispara evento para iniciar partículas e ativar primeira seção
                        window.dispatchEvent(new CustomEvent('intro-complete'));
                    }, 300);
                }, 200);
            }, 600);
        }, 2000);
    }

    // Inicia após o carregamento da página
    window.addEventListener('load', () => {
        // Pequeno delay para garantir que tudo carregou
        setTimeout(startIntro, 300);
    });
})();