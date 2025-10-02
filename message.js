document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');

    // Configuração do backend
    const BACKEND_URL = 'http://localhost:5000';
    
    // Função para verificar se o backend está online
    async function checkBackend() {
        try {
            const response = await fetch(`${BACKEND_URL}/test`);
            const data = await response.json();
            console.log('Backend status:', data);
            return true;
        } catch (error) {
            console.warn('Backend offline, usando modo local');
            return false;
        }
    }

    // Conhecimento base local (fallback)
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
            patterns : ['oque é', 'para que','o que é', 'ufca'],
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
            patterns: ['localização','onde fica', 'em que lugar fica', 'onde tá', 'onde acho', 'endereço'],
            responses: [
                'A Universidade Federal do Cariri (UFCA) está localizada no sul do Ceará, com campus em várias cidades da região: Campus Juazeiro do Norte - Sede da Reitoria, Campus Crato, Campus Barbalha, Campus Brejo Santo e Campus Icó. Endereço da sede da reitoria: Av. Tenente Raimundo Rocha, 1639 - Cidade Universitária, Juazeiro do Norte - CE'
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

    // Respostas multilíngues
    const multilingualResponses = {
        'saudacao': {
            'pt': ['Olá! Sou a Alara, assistente virtual da UFCA. Como posso ajudar?', 'Oi! Em que posso ser útil hoje?'],
            'en': ['Hello! I am Alara, UFCA virtual assistant. How can I help you?', 'Hi! How can I assist you today?'],
            'es': ['¡Hola! Soy Alara, asistente virtual de la UFCA. ¿Cómo puedo ayudarte?', '¡Hola! ¿En qué puedo serte útil hoy?']
        },
        'despedida': {
            'pt': ['Até logo! Estarei aqui se precisar de mais informações.', 'Foi um prazer ajudar! Volte sempre.'],
            'en': ['Goodbye! I\'ll be here if you need more information.', 'It was a pleasure to help! Come back anytime.'],
            'es': ['¡Hasta luego! Estaré aquí si necesitas más información.', '¡Fue un placer ayudar! Vuelve cuando quieras.']
        },
        'ufca': {
            'pt': ['A Universidade Federal do Cariri (UFCA) é uma instituição pública de ensino superior localizada na região do Cariri, Ceará.'],
            'en': ['The Federal University of Cariri (UFCA) is a public higher education institution located in the Cariri region, Ceará.'],
            'es': ['La Universidad Federal de Cariri (UFCA) es una institución pública de educación superior ubicada en la región de Cariri, Ceará.']
        },
        'default': {
            'pt': ['Desculpe, não entendi completamente. Poderia reformular sua pergunta?'],
            'en': ['Sorry, I didn\'t fully understand. Could you rephrase your question?'],
            'es': ['Lo siento, no entendí completamente. ¿Podría reformular su pregunta?']
        }
    };

    // Variável para controlar se o backend está disponível
    let backendOnline = false;

    // Verifica o backend ao carregar
    checkBackend().then(online => {
        backendOnline = online;
        console.log('Backend online:', online);
    });

    addMessage('Olá! Eu sou a Alara, estou aqui para te ajudar. O que você precisa saber sobre a UFCA?', 'received');

    // Função para adicionar mensagem ao chat
    function addMessage(text, type, language = null) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        
        // Cabeçalho da mensagem
        const messageHeader = document.createElement('div');
        messageHeader.classList.add('message-header');
        
        const senderName = document.createElement('div');
        senderName.classList.add('sender-name');
        senderName.textContent = type === 'sent' ? 'Você' : 'Alara';
        
        messageHeader.appendChild(senderName);
        
        // Adiciona badge de idioma se disponível
        if (language && type === 'received') {
            const languageBadge = document.createElement('span');
            languageBadge.classList.add('language-badge');
            languageBadge.textContent = getLanguageName(language);
            messageHeader.appendChild(languageBadge);
        }
        
        const messageText = document.createElement('div');
        messageText.textContent = text;
        
        const timeSpan = document.createElement('div');
        timeSpan.classList.add('time');
        timeSpan.textContent = getCurrentTime();
        
        messageDiv.appendChild(messageHeader);
        messageDiv.appendChild(messageText);
        messageDiv.appendChild(timeSpan);
        chatMessages.appendChild(messageDiv);
        
        // Rolagem automática para a última mensagem
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Função para obter nome do idioma
   // Função para obter nome do idioma
function getLanguageName(languageCode) {
    const languageNames = {
        'pt': 'PT',
        'en': 'EN', 
        'es': 'ES',
        'fr': 'FR',
        'de': 'DE',
        'it': 'IT',
        'zh-cn': '中文',
        'zh-tw': '中文',
        'ja': 'JA',
        'ko': 'KO'
    };
    return languageNames[languageCode] || languageCode;
}

    // Função para detectar idioma
    async function detectLanguage(message) {
        if (!backendOnline) {
            return { success: false, error: 'Backend offline' };
        }

        try {
            const response = await fetch(`${BACKEND_URL}/detect-language`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro na detecção de idioma:', error);
            return { success: false, error: error.message };
        }
    }

    // Processamento local de mensagens (fallback)
    function processMessageLocal(message) {
        const normalizedMessage = message.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        for (const intent in knowledgeBase) {
            if (intent === 'default') continue;
            
            for (const pattern of knowledgeBase[intent].patterns) {
                const normalizedPattern = pattern.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                
                if (normalizedMessage.includes(normalizedPattern)) {
                    const responses = knowledgeBase[intent].responses;
                    return {
                        text: responses[Math.floor(Math.random() * responses.length)],
                        language: 'pt'
                    };
                }
            }
        }
        
        const defaultResponses = knowledgeBase.default.responses;
        return {
            text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
            language: 'pt'
        };
    }

    // Processamento com detecção de idioma
    // Substitua a função processMessageWithLanguage completa por esta:
function processMessageWithLanguage(message, detectedLanguage = 'pt') {
    const normalizedMessage = message.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Respostas multilíngues COMPLETAS
    // Respostas multilíngues COMPLETAS (incluindo chinês)
const multilingualResponses = {
    'saudacao': {
        'pt': ['Olá! Sou a Alara, assistente virtual da UFCA. Como posso ajudar?', 'Oi! Em que posso ser útil hoje?'],
        'en': ['Hello! I am Alara, UFCA virtual assistant. How can I help you?', 'Hi! How can I assist you today?'],
        'es': ['¡Hola! Soy Alara, asistente virtual de la UFCA. ¿Cómo puedo ayudarte?', '¡Hola! ¿En qué puedo serte útil hoy?'],
        'fr': ['Bonjour ! Je suis Alara, l\'assistante virtuelle de l\'UFCA. Comment puis-je vous aider ?'],
        'de': ['Hallo! Ich bin Alara, der virtuelle Assistent der UFCA. Wie kann ich Ihnen helfen?'],
        'it': ['Ciao! Sono Alara, l\'assistante virtuale dell\'UFCA. Come posso aiutarti?'],
        'zh-cn': ['你好！我是阿拉拉，UFCA的虚拟助手。我如何帮助您？', '您好！今天我能为您提供什么帮助？']
    },
    'despedida': {
        'pt': ['Até logo! Estarei aqui se precisar de mais informações.', 'Foi um prazer ajudar! Volte sempre.'],
        'en': ['Goodbye! I\'ll be here if you need more information.', 'It was a pleasure to help! Come back anytime.'],
        'es': ['¡Hasta luego! Estaré aquí si necesitas más información.', '¡Fue un placer ayudar! Vuelve quando quieras.'],
        'fr': ['Au revoir ! Je serai là si vous avez besoin de plus d\'informations.', 'Ce fut un plaisir de vous aider ! Revenez quand vous voulez.'],
        'de': ['Auf Wiedersehen! Ich bin hier, wenn Sie weitere Informationen benötigen.', 'Es war mir eine Freude zu helfen! Kommen Sie jederzeit wieder.'],
        'it': ['Arrivederci! Sarò qui se avrai bisogno di ulteriori informações.', 'È stato un piacere aiutarti! Torna quando vuoi.'],
        'zh-cn': ['再见！如果您需要更多信息，我会在这里。', '很高兴能帮助您！随时欢迎回来。']
    },
    'ufca': {
        'pt': ['A Universidade Federal do Cariri (UFCA) é uma instituição pública de ensino superior localizada na região do Cariri, Ceará. Foi criada em 2006 para promover educação de qualidade na região.'],
        'en': ['The Federal University of Cariri (UFCA) is a public higher education institution located in the Cariri region, Ceará. It was founded in 2006 to promote quality education in the region.'],
        'es': ['La Universidad Federal de Cariri (UFCA) es una institución pública de educación superior ubicada en la región de Cariri, Ceará. Fue fundada en 2006 para promover educación de calidad en la región.'],
        'fr': ['L\'Université Fédérale de Cariri (UFCA) est une institution publique d\'enseignement supérieur située dans la région de Cariri, Ceará. Elle a été fondée en 2006 pour promouvoir une éducation de qualité dans la région.'],
        'de': ['Die Bundesuniversität von Cariri (UFCA) ist eine öffentliche Hochschuleinrichtung in der Region Cariri, Ceará. Sie wurde 2006 gegründet, um qualitativ hochwertige Bildung in der Region zu fördern.'],
        'it': ['L\'Università Federale di Cariri (UFCA) è un\'istituzione pubblica de istruzione superiore situata nella regione di Cariri, Ceará. È stata fondata nel 2006 per promuovere un\'istruzione di qualità nella regione.'],
        'zh-cn': ['卡里里联邦大学 (UFCA) 是位于塞阿拉州卡里里地区的一所公立高等教育机构。它成立于2006年，旨在促进该地区的优质教育。']
    },
    'matricula': {
        'pt': ['O processo de matrícula na UFCA é feito através do SiSU ou vestibulares próprios. Para informações detalhadas, visite: https://www.ufca.edu.br/ingresso/'],
        'en': ['The enrollment process at UFCA is done through SiSU or entrance exams. Visit: https://www.ufca.edu.br/ingresso/'],
        'es': ['El proceso de matrícula en la UFCA se realiza a través del SiSU o exámenes de acceso. Visite: https://www.ufca.edu.br/ingresso/'],
        'fr': ['Le processus d\'inscription à l\'UFCA se fait par le biais du SiSU ou des examens d\'entrée. Visitez : https://www.ufca.edu.br/ingresso/'],
        'de': ['Das Immatrikulationsverfahren an der UFCA erfolgt über SiSU oder Aufnahmeprüfungen. Besuchen Sie: https://www.ufca.edu.br/ingresso/'],
        'it': ['Il processo di iscrizione all\'UFCA avviene tramite SiSU o esami di ammissione. Visita: https://www.ufca.edu.br/ingresso/'],
        'zh-cn': ['UFCA的注册流程通过SiSU或入学考试进行。详情请访问：https://www.ufca.edu.br/ingresso/']
    },
    'localizacao': {
        'pt': ['A UFCA tem campus em Juazeiro do Norte, Crato, Barbalha, Brejo Santo e Icó. Endereço da reitoria: Av. Tenente Raimundo Rocha, 1639 - Juazeiro do Norte - CE'],
        'en': ['UFCA has campuses in Juazeiro do Norte, Crato, Barbalha, Brejo Santo and Icó. Headquarters address: Av. Tenente Raimundo Rocha, 1639 - Juazeiro do Norte - CE'],
        'es': ['La UFCA tiene campus en Juazeiro do Norte, Crato, Barbalha, Brejo Santo e Icó. Dirección de la rectoría: Av. Tenente Raimundo Rocha, 1639 - Juazeiro do Norte - CE'],
        'fr': ['L\'UFCA a des campus à Juazeiro do Norte, Crato, Barbalha, Brejo Santo et Icó. Adresse du siège : Av. Tenente Raimundo Rocha, 1639 - Juazeiro do Norte - CE'],
        'de': ['Die UFCA hat Standorte in Juazeiro do Norte, Crato, Barbalha, Brejo Santo und Icó. Hauptsitzadresse: Av. Tenente Raimundo Rocha, 1639 - Juazeiro do Norte - CE'],
        'it': ['L\'UFCA ha campus a Juazeiro do Norte, Crato, Barbalha, Brejo Santo e Icó. Indirizzo della sede: Av. Tenente Raimundo Rocha, 1639 - Juazeiro do Norte - CE'],
        'zh-cn': ['UFCA在北茹阿泽鲁、克拉图、巴巴利亚、布雷茹桑托和伊科设有校区。总部地址：Av. Tenente Raimundo Rocha, 1639 - Juazeiro do Norte - CE']
    },
    'cursos': {
        'pt': ['A UFCA oferece diversos cursos de graduação nas áreas de Engenharias, Ciências Sociais, Saúde e Tecnologia. Veja a lista completa em: https://www.ufca.edu.br/cursos/'],
        'en': ['UFCA offers several undergraduate courses in Engineering, Social Sciences, Health and Technology. See the complete list at: https://www.ufca.edu.br/cursos/'],
        'es': ['La UFCA ofrece varios cursos de pregrado en Ingeniería, Ciencias Sociales, Salud y Tecnología. Vea la lista completa en: https://www.ufca.edu.br/cursos/'],
        'fr': ['L\'UFCA propose plusieurs cours de premier cycle en Ingénierie, Sciences Sociales, Santé et Technologie. Voir la liste complète sur : https://www.ufca.edu.br/cursos/'],
        'de': ['Die UFCA bietet mehrere Bachelor-Studiengänge in den Bereichen Ingenieurwesen, Sozialwissenschaften, Gesundheit und Technologie an. Sehen Sie die vollständige Liste unter: https://www.ufca.edu.br/cursos/'],
        'it': ['L\'UFCA offre diversi corsi di laurea in Ingegneria, Scienze Sociali, Salute e Tecnologia. Vedi l\'elenco completo su: https://www.ufca.edu.br/cursos/'],
        'zh-cn': ['UFCA提供工程、社会科学、健康和技术领域的多个本科课程。查看完整列表：https://www.ufca.edu.br/cursos/']
    },
    'contato': {
        'pt': ['Contato da UFCA: Telefone (88) 3221-9200 | Email: gabinete@ufca.edu.br | Site: https://www.ufca.edu.br/contato/'],
        'en': ['UFCA contact: Phone (88) 3221-9200 | Email: gabinete@ufca.edu.br | Website: https://www.ufca.edu.br/contato/'],
        'es': ['Contacto de la UFCA: Teléfono (88) 3221-9200 | Email: gabinete@ufca.edu.br | Sitio web: https://www.ufca.edu.br/contato/'],
        'fr': ['Contact UFCA : Téléphone (88) 3221-9200 | Email : gabinete@ufca.edu.br | Site web : https://www.ufca.edu.br/contato/'],
        'de': ['UFCA Kontakt: Telefon (88) 3221-9200 | E-Mail: gabinete@ufca.edu.br | Website: https://www.ufca.edu.br/contato/'],
        'it': ['Contatto UFCA: Telefono (88) 3221-9200 | Email: gabinete@ufca.edu.br | Sito web: https://www.ufca.edu.br/contato/'],
        'zh-cn': ['UFCA联系方式：电话 (88) 3221-9200 | 邮箱：gabinete@ufca.edu.br | 网站：https://www.ufca.edu.br/contato/']
    },
    'calendario': {
        'pt': ['O calendário acadêmico da UFCA é definido por semestre. Você pode consultar o calendário atual em: https://www.ufca.edu.br/calendario-academico/'],
        'en': ['The academic calendar at UFCA is set by semester. You can check the current calendar at: https://www.ufca.edu.br/calendario-academico/'],
        'es': ['El calendario académico de la UFCA se establece por semestre. Puede consultar el calendario actual en: https://www.ufca.edu.br/calendario-academico/'],
        'fr': ['Le calendrier académique de l\'UFCA est fixé par semestre. Vous pouvez consulter le calendrier actuel sur : https://www.ufca.edu.br/calendario-academico/'],
        'de': ['Der akademische Kalender der UFCA wird semesterweise festgelegt. Sie können den aktuellen Kalender unter https://www.ufca.edu.br/calendario-academico/ einsehen.'],
        'it': ['Il calendario accademico dell\'UFCA è stabilito per semestre. Puoi controllare il calendario corrente su: https://www.ufca.edu.br/calendario-academico/'],
        'zh-cn': ['UFCA的学术日历按学期设置。您可以查看当前日历：https://www.ufca.edu.br/calendario-academico/']
    },
    'default': {
        'pt': ['Desculpe, não entendi completamente. Poderia reformular sua pergunta sobre a UFCA?', 'Não tenho informações suficientes sobre isso. Você pode verificar no site oficial da UFCA: https://www.ufca.edu.br/'],
        'en': ['Sorry, I didn\'t fully understand. Could you rephrase your question about UFCA?', 'I don\'t have enough information about that. You can check on the official UFCA website: https://www.ufca.edu.br/'],
        'es': ['Lo siento, no entendí completamente. ¿Podría reformular su pregunta sobre la UFCA?', 'No tengo suficiente información sobre eso. Puede consultar en el sitio web oficial de la UFCA: https://www.ufca.edu.br/'],
        'fr': ['Désolé, je n\'ai pas bien compris. Pourriez-vous reformuler votre question sur l\'UFCA ?', 'Je n\'ai pas assez d\'informations à ce sujet. Vous pouvez consulter le site officiel de l\'UFCA : https://www.ufca.edu.br/'],
        'de': ['Entschuldigung, ich habe nicht vollständig verstanden. Könnten Sie Ihre Frage zur UFCA umformulieren?', 'Ich habe nicht genug Informationen dazu. Sie können auf der offiziellen UFCA-Website nachsehen: https://www.ufca.edu.br/'],
        'it': ['Mi dispiace, non ho capito completamente. Potresti riformulare la tua domanda sull\'UFCA?', 'Non ho abbastanza informazioni al riguardo. Puoi controllare sul sito ufficiale dell\'UFCA: https://www.ufca.edu.br/'],
        'zh-cn': ['抱歉，我没有完全理解。您能重新表述一下关于UFCA的问题吗？', '我没有足够的信息。您可以在UFCA官方网站上查看：https://www.ufca.edu.br/']
    }
};

    // Padrões de detecção de intenção
const patterns = {
    'saudacao': ['olá', 'oi', 'e aí', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi', 'hey', 'hola', 'bonjour', 'hallo', 'ciao', '你好', '您好', '嗨'],
    'despedida': ['tchau', 'até logo', 'até mais', 'bye', 'encerrar', 'obrigado', 'thanks', 'gracias', 'merci', 'danke', 'grazie', 'adeus', '再见', '拜拜', '谢谢'],
    'ufca': ['oque é', 'para que', 'o que é', 'ufca', 'universidade', 'university', 'universidad', 'université', 'universität', 'università', '大学', '什么是'],
    'matricula': ['matrícula', 'como me matricular', 'processo seletivo', 'vestibular', 'ingresso', 'enrollment', 'admission', 'inscripción', 'admission', 'immatrikulation', 'iscrizione', '注册', '报名', '入学'],
    'localizacao': ['localização', 'onde fica', 'em que lugar', 'endereço', 'location', 'address', 'ubicación', 'adresse', 'standort', 'posizione', '位置', '地址', '在哪里'],
    'cursos': ['cursos', 'graduação', 'que cursos oferece', 'áreas de estudo', 'courses', 'degrees', 'carreras', 'cours', 'studiengänge', 'corsi', '课程', '专业', '学习'],
    'contato': ['contato', 'telefone', 'email', 'como entrar em contato', 'contact', 'phone', 'email', 'contacto', 'téléphone', 'kontakt', 'telefono', '联系', '电话', '邮箱', '联系方式'],
    'calendario': ['calendário', 'calendario academico', 'período letivo', 'semestre', 'calendar', 'academic', 'calendario', 'calendrier', 'kalender', 'calendario', '日历', '学术日历', '学期']
};

    // DEBUG: Mostrar no console o que está sendo detectado
    console.log('Mensagem:', message);
    console.log('Idioma detectado:', detectedLanguage);
    
    // Verifica cada intenção
    for (const intent in patterns) {
        for (const pattern of patterns[intent]) {
            const normalizedPattern = pattern.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            
            if (normalizedMessage.includes(normalizedPattern)) {
                console.log('Intenção detectada:', intent);
                
                // Tenta pegar resposta no idioma detectado
                let responses = multilingualResponses[intent]?.[detectedLanguage];
                
                // Se não tiver resposta no idioma, tenta inglês
                if (!responses) {
                    responses = multilingualResponses[intent]?.['en'];
                }
                
                // Se ainda não tiver, usa português como fallback final
                if (!responses) {
                    responses = multilingualResponses[intent]?.['pt'];
                }
                
                if (responses && responses.length > 0) {
                    const responseText = responses[Math.floor(Math.random() * responses.length)];
                    console.log('Resposta escolhida:', responseText);
                    return {
                        text: responseText,
                        language: detectedLanguage
                    };
                }
            }
        }
    }
    
    // Se não encontrou intenção específica, usa resposta padrão
    console.log('Usando resposta padrão');
    let defaultResponses = multilingualResponses.default[detectedLanguage] || 
                          multilingualResponses.default['en'] || 
                          multilingualResponses.default['pt'];
    
    return {
        text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
        language: detectedLanguage
    };
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
    
    async function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
        addMessage(message, 'sent');
        messageInput.value = '';
        
        // Mostrar que a Alara está digitando
        showTypingIndicator();
        
        try {
            let response;
            let languageResult = null;
            
            if (backendOnline) {
                // Tenta detectar idioma primeiro
                languageResult = await detectLanguage(message);
                console.log('Resultado da detecção:', languageResult);
                
                if (languageResult.success) {
                    response = processMessageWithLanguage(message, languageResult.detected_language);
                    // DEBUG
                    debugLanguageDetection(message, languageResult.detected_language, response);
                } else {
                    // Se não conseguir detectar, usa processamento local
                    console.log('Falha na detecção, usando fallback');
                    response = processMessageLocal(message);
                }
            } else {
                // Backend offline, usa apenas processamento local
                console.log('Backend offline, usando modo local');
                response = processMessageLocal(message);
            }
            
            // Simula um tempo de resposta
            setTimeout(() => {
                hideTypingIndicator();
                addMessage(response.text, 'received', response.language);
            }, 1000 + Math.random() * 1000);
            
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            setTimeout(() => {
                hideTypingIndicator();
                const fallbackResponse = processMessageLocal(message);
                addMessage(fallbackResponse.text, 'received', fallbackResponse.language);
            }, 1000);
        }
    }
}

    // Configuração dos botões de perguntas frequentes
    const suasDivs = document.querySelectorAll('.scroll-item');
    const suasDivs2 = document.querySelectorAll('.p');

    function setupQuestionButtons(buttons) {
        buttons.forEach(div => {
            div.style.cursor = 'pointer';
            
            if (!div.hasAttribute('data-message')) {
                div.setAttribute('data-message', div.textContent.trim());
            }
            
            div.addEventListener('click', async function() {
                const message = this.getAttribute('data-message');
                
                addMessage(message, 'sent');
                showTypingIndicator();
                
                try {
                    let response;
                    
                    if (backendOnline) {
                        const languageResult = await detectLanguage(message);
                        if (languageResult.success) {
                            response = processMessageWithLanguage(message, languageResult.detected_language);
                        } else {
                            response = processMessageLocal(message);
                        }
                    } else {
                        response = processMessageLocal(message);
                    }
                    
                    setTimeout(() => {
                        hideTypingIndicator();
                        addMessage(response.text, 'received', response.language);
                    }, 1000);
                    
                } catch (error) {
                    setTimeout(() => {
                        hideTypingIndicator();
                        const fallbackResponse = processMessageLocal(message);
                        addMessage(fallbackResponse.text, 'received', fallbackResponse.language);
                    }, 1000);
                }
            });
            
            div.addEventListener('mouseenter', function() {
                this.style.opacity = '0.8';
            });
            
            div.addEventListener('mouseleave', function() {
                this.style.opacity = '1';
            });
        });
    }

    setupQuestionButtons(suasDivs);
    setupQuestionButtons(suasDivs2);

    function debugLanguageDetection(message, detectedLanguage, response) {
    console.log('=== DEBUG DETECÇÃO DE IDIOMA ===');
    console.log('Mensagem original:', message);
    console.log('Idioma detectado:', detectedLanguage);
    console.log('Resposta gerada:', response.text);
    console.log('Idioma da resposta:', response.language);
    console.log('==============================');
}

// Adicione esta função para testar a conexão com o backend
async function testBackendConnection() {
    try {
        console.log('Testando conexão com backend...');
        const response = await fetch(`${BACKEND_URL}/test`);
        const data = await response.json();
        console.log('✅ Backend respondendo:', data);
        return true;
    } catch (error) {
        console.log('❌ Backend não conectado:', error);
        return false;
    }
}

// Teste a conexão quando a página carregar
document.addEventListener('DOMContentLoaded', async function() {
    // ... código existente ...
    
    // Teste de conexão mais robusto
    backendOnline = await testBackendConnection();
    console.log('Status final do backend:', backendOnline);
    
    // Teste de detecção de idioma direto
    if (backendOnline) {
        console.log('Testando detecção de idioma...');
        try {
            const testResult = await detectLanguage("Hello, how are you?");
            console.log('Teste de detecção:', testResult);
        } catch (error) {
            console.log('Erro no teste de detecção:', error);
        }
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    // ... código existente ...
    
    // Teste de conexão mais robusto
    backendOnline = await testBackendConnection();
    console.log('Status final do backend:', backendOnline);
    
    // Teste de detecção de idioma direto
    if (backendOnline) {
        console.log('Testando detecção de idioma...');
        try {
            const testResult = await detectLanguage("Hello, how are you?");
            console.log('Teste de detecção:', testResult);
        } catch (error) {
            console.log('Erro no teste de detecção:', error);
        }
    }
});
});
