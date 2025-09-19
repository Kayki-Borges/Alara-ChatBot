document.addEventListener('DOMContentLoaded', function() {
            const chatMessages = document.getElementById('chatMessages');
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');
            const typingIndicator = document.getElementById('typingIndicator');

             const knowledgeBase = {
                'saudacao': {
                    patterns: ['olá', 'oi', 'e aí', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi', 'saudações', 'opa'],
                    responses: [
                        'Olá! Sou a Alara, assistente virtual da UFCA. Como posso ajudar?',
                        'Oi! Em que posso ser útil hoje?',
                        'Saudações! Como posso ajudá-lo com informações sobre a UFCA?'
                    ]
                },
                'despedida': {
                    patterns: ['tchau', 'até logo', 'até mais', 'bye', 'encerrar', 'sair', 'obrigado', 'adeus'],
                    responses: [
                        'Até logo! Estarei aqui se precisar de mais alguma informação.',
                        'Foi um prazer ajudar! Volte sempre que tiver dúvidas.',
                        'Até mais! Não hesite em entrar em contato se tiver mais perguntas.'
                    ]
                },
                'ufca': {
                    patterns : ['oque é', 'para que','o que é'],
                    responses : ['A Universidade Federal do Cariri (UFCA) é uma instituição pública de ensino superior localizada na cidade de Juazeiro do Norte, no estado do Ceará. Foi criada em 2006 e tem como missão promover a educação superior de qualidade']
                },
                'matricula': {
                    patterns: ['matrícula', 'como me matricular', 'processo seletivo', 'vestibular', 'ingresso', 'matriculo'],
                    responses: [
                        'O processo de matrícula na UFCA varia conforme o curso e o tipo de seleção. Geralmente é feito através do SiSU ou vestibulares próprios. Para informações detalhadas, visite: https://www.ufca.edu.br/ingresso/',
                        'Para se matricular na UFCA, você precisa participar de processos seletivos como SiSU, vestibular ou transferência. Confira mais em: https://www.ufca.edu.br/ingresso/'
                    ]
                },
                'localizacao':{
                    patterns: ['localização','onde fica', 'em que lugar fica', 'onde tá', 'onde acho'],
                    responses: [
                        'A Universidade Federal do Cariri (UFCA) está localizada no sul do Ceará, com campus em várias cidades da região:Campus Juazeiro do Norte - Sede da Reitoria, Campus Crato,Campus Barbalha,Campus Brejo Santo e Campus Icó. Endereço da sede da reitoria:Av. Tenente Raimundo Rocha, 1639 - Cidade Universitária, Juazeiro do Norte - CE'
                    ]
                },
                'cursos': {
                    patterns: ['cursos', 'graduação', 'que cursos oferece', 'áreas de estudo'],
                    responses: [
                        'A UFCA oferece diversos cursos de graduação nas áreas de Engenharias, Ciências Sociais, Saúde e Tecnologia. Veja a lista completa em: https://www.ufca.edu.br/cursos/',
                        'Temos cursos nas áreas de Engenharia, Computação, Física, Matemática, Educação, Enfermagem e muitos outros. Confira: https://www.ufca.edu.br/cursos/'
                    ]
                },
                'contato': {
                    patterns: ['contato', 'telefone', 'email', 'endereço', 'como entrar em contato', 'localização'],
                    responses: [
                        'A UFCA possui campi em Juazeiro do Norte, Crato, Barbalha e Brejo Santo. O contato geral é (88) 3221-9200. Mais informações: https://www.ufca.edu.br/contato/',
                        'Você pode entrar em contato com a UFCA pelo telefone (88) 3221-9200 ou pelo email: gabinete@ufca.edu.br. Endereço: Av. Tenente Raimundo Rocha, 1639, Juazeiro do Norte-CE.'
                    ]
                },
                'calendario': {
                    patterns: ['calendário', 'calendario academico', 'período letivo', 'semestre'],
                    responses: [
                        'O calendário acadêmico da UFCA é definido por semestre. Você pode consultar o calendário atual em: https://www.ufca.edu.br/calendario-academico/',
                        'Para acessar o calendário acadêmico com todos os prazos e períodos letivos, visite: https://www.ufca.edu.br/calendario-academico/'
                    ]
                },
                'default': {
                    responses: [
                        'Desculpe, não entendi completamente. Poderia reformular sua pergunta?',
                        'Não tenho informações suficientes sobre isso. Entre em contato com a UFCA diretamente pelo telefone (88) 3221-9200.',
                        'Essa pergunta é complexa. Você pode verificar no site oficial da UFCA: https://www.ufca.edu.br/'
                    ]
                }
            };

            addMessage('Olá! Eu sou a Alara, estou aqui para te ajudar. O que você precisa saber sobre a UFCA?', 'received');

            // Função para adicionar mensagem ao chat
            function addMessage(text, type) {
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message', type);
                
                const messageText = document.createElement('div');
                messageText.textContent = text;
                
                const timeSpan = document.createElement('div');
                timeSpan.classList.add('time');
                timeSpan.textContent = getCurrentTime();
                
                messageDiv.appendChild(messageText);
                messageDiv.appendChild(timeSpan);
                chatMessages.appendChild(messageDiv);
                
                // Rolagem automática para a última mensagem
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            function processMessage(message) {
                // Converter para minúsculas e remover acentos para melhor correspondência
                const normalizedMessage = message.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                
                // Verificar se a mensagem corresponde a algum padrão conhecido
                for (const intent in knowledgeBase) {
                    if (intent === 'default') continue;
                    
                    for (const pattern of knowledgeBase[intent].patterns) {
                        const normalizedPattern = pattern.toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        
                        if (normalizedMessage.includes(normalizedPattern)) {
                            const responses = knowledgeBase[intent].responses;
                            return responses[Math.floor(Math.random() * responses.length)];
                        }
                    }
                }
                
                // Se não encontrou correspondência, usar resposta padrão
                const defaultResponses = knowledgeBase.default.responses;
                return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
            }
            // Função para obter a hora atual formatada
            function getCurrentTime() {
                const now = new Date();
                return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            }
            
            // Mostrar indicador de digitação
            function showTypingIndicator() {
                typingIndicator.classList.add('active');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // Esconder indicador de digitação
            function hideTypingIndicator() {
                typingIndicator.classList.remove('active');
            }
            
            // Enviar mensagem ao clicar no botão
            sendButton.addEventListener('click', sendMessage);
            
            // Enviar mensagem ao pressionar Enter
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            // Focar no input quando a página carregar
            messageInput.focus();
            
            function sendMessage() {
                const message = messageInput.value.trim();
                if (message !== '') {
                    addMessage(message, 'sent');
                    messageInput.value = '';
                    
                    // Mostrar que a Alara está digitando
                    showTypingIndicator();
                    
                    // Simular resposta após um curto período
                      setTimeout(() => {
                        hideTypingIndicator();
                        const response = processMessage(message);
                        addMessage(response, 'received');
                    }, 1500);
                }
            }
        });
        
