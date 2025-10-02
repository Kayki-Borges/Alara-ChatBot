# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from langdetect import detect, LangDetectException

app = Flask(__name__)
CORS(app)  # Isso é importante para permitir requisições do frontend

# Dicionário com respostas para diferentes idiomas
respostas_idiomas = {
    'pt': {
        'saudacao': 'Olá! Detectei que você está escrevendo em português.',
        'ajuda': 'Como posso ajudá-lo com informações sobre a UFCA?'
    },
    'en': {
        'saudacao': 'Hello! I detected that you are writing in English.',
        'ajuda': 'How can I help you with information about UFCA?'
    },
    'es': {
        'saudacao': '¡Hola! Detecté que estás escribiendo en español.',
        'ajuda': '¿Cómo puedo ayudarte con información sobre la UFCA?'
    },
    'zh-cn': {
        'saudacao': '你好！我检测到您正在用中文写作。',
        'ajuda': '我如何帮助您了解UFCA的信息？'
    }
}

nomes_idiomas = {
    'pt': 'Português',
    'en': 'Inglês',
    'es': 'Espanhol',
    'fr': 'Francês',
    'de': 'Alemão',
    'it': 'Italiano',
    'zh-cn': 'Chinês Simplificado',
    'zh-tw': 'Chinês Tradicional',
    'ja': 'Japonês',
    'ko': 'Coreano'
}

@app.route('/detect-language', methods=['POST', 'GET'])  # Adicione GET para teste
def detect_language():
    try:
        # Para debugging
        print("Requisição recebida!")
        
        if request.method == 'GET':
            return jsonify({'message': 'Backend funcionando!'})
        
        data = request.get_json()
        print("Dados recebidos:", data)
        
        texto = data.get('message', '') if data else ''
        
        if not texto or len(texto.strip()) < 2:
            return jsonify({
                'success': False,
                'error': 'Texto muito curto para detecção'
            })
        
        # Detecta o idioma
        idioma = detect(texto)
        nome_idioma = nomes_idiomas.get(idioma, idioma)
        
        print(f"Idioma detectado: {idioma} ({nome_idioma})")
        
        return jsonify({
            'success': True,
            'detected_language': idioma,
            'language_name': nome_idioma
        })
        
    except LangDetectException as e:
        print("Erro LangDetect:", str(e))
        return jsonify({
            'success': False,
            'error': 'Não foi possível detectar o idioma'
        })
    except Exception as e:
        print("Erro geral:", str(e))
        return jsonify({
            'success': False,
            'error': f'Erro na detecção: {str(e)}'
        })

@app.route('/test', methods=['GET'])
def test():
    return jsonify({'status': 'Backend funcionando!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')