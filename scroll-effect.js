// Configuração da barra de rolagem horizontal
        const horizontalScroll = document.getElementById('horizontalScroll');
        const scrollDots = document.querySelectorAll('.scroll-dot');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        // Função para atualizar indicadores de scroll
        function updateScrollIndicators() {
            const scrollLeft = horizontalScroll.scrollLeft;
            const scrollWidth = horizontalScroll.scrollWidth - horizontalScroll.clientWidth;
            const scrollPercentage = scrollLeft / scrollWidth;

            scrollDots.forEach((dot, index) => {
                dot.classList.remove('active');
            });

            if (scrollPercentage < 0.33) {
                scrollDots[0].classList.add('active');
            } else if (scrollPercentage < 0.66) {
                scrollDots[1].classList.add('active');
            } else {
                scrollDots[2].classList.add('active');
            }
        }

        // Event listeners para os itens da barra de scroll
        document.querySelectorAll('.scroll-item').forEach(item => {
            item.addEventListener('click', function() {
                messageInput.focus();
                
                // Efeito visual de confirmação
                this.style.background = 'linear-gradient(135deg, #5a9ca8, #5a7ca8)';
                setTimeout(() => {
                    this.style.background = 'linear-gradient(135deg, #66afbd, #668cbd)';
                }, 300);
            });
        });

        // Atualizar indicadores ao scrollar
        horizontalScroll.addEventListener('scroll', updateScrollIndicators);

        // Inicializar indicadores
        updateScrollIndicators();

        // Efeito de aparecer/desaparecer baseado no scroll da página
        window.addEventListener('scroll', function() {
            const bottomBar = document.querySelector('.bottom-bar-container');
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Mostrar/ocultar baseado na posição do scroll
            if (scrollY + windowHeight >= documentHeight - 100) {
                bottomBar.style.transform = 'translateY(0)';
                bottomBar.style.opacity = '1';
            } else {
                bottomBar.style.transform = 'translateY(100%)';
                bottomBar.style.opacity = '0';
            }
        });

        // Inicializar posição
        window.dispatchEvent(new Event('scroll'));
