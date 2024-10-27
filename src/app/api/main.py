import os
import requests
from flask import Flask, jsonify, request, render_template
import qrcode
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()  # Carregar variáveis de ambiente

app = Flask(__name__)

LNBits_API_URL = os.getenv("LNBITS_URL")
LNBits_API_KEY = os.getenv("LNBITS_API_KEY")

# Simulação de banco de dados de usuários
usuarios = {
    "user1": {"mensagens_restantes": 3}
}

# Função para gerar fatura LNBits
def gerar_fatura(valor_sats):
    headers = {
        "X-Api-Key": LNBits_API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "amount": valor_sats,
        "memo": "Pagamento por mensagens no ChatGPT",
        "out": False
    }
    response = requests.post(f"{LNBits_API_URL}", json=data, headers=headers)
    if response.status_code == 201:
        return response.json()['payment_request'], response.json()['payment_hash']
    else:
        raise Exception("Erro ao gerar fatura.")

# Função para verificar o pagamento
def verificar_pagamento(payment_hash):
    headers = {
        "X-Api-Key": LNBits_API_KEY
    }
    response = requests.get(f"{LNBits_API_URL}/{payment_hash}", headers=headers)
    if response.status_code == 200:
        return response.json()['paid']
    else:
        raise Exception("Erro ao verificar pagamento.")

# Rota para gerar QR Code da fatura
@app.route('/comprar_mensagens', methods=['POST'])
def comprar_mensagens():
    user = request.form.get("usuario")
    payment_request, payment_hash = gerar_fatura(1000)  # valor em satoshis
    qr_img = qrcode.make(payment_request)
    buffer = BytesIO()
    qr_img.save(buffer, format="PNG")
    buffer.seek(0)
    
    # Renderiza o QR code e a página de pagamento
    return render_template('compra.html', 
                           qr_code=buffer.getvalue().decode('latin1'), 
                           payment_hash=payment_hash, 
                           user=user)

# Rota para verificar pagamento e atualizar saldo
@app.route('/verificar_pagamento', methods=['POST'])
def verificar_status_pagamento():
    payment_hash = request.form.get("payment_hash")
    user = request.form.get("usuario")
    if verificar_pagamento(payment_hash):
        usuarios[user]['mensagens_restantes'] += 10  # Adiciona mais mensagens
        return jsonify({"status": "Pagamento confirmado", "mensagens_restantes": usuarios[user]['mensagens_restantes']})
    else:
        return jsonify({"status": "Pagamento não confirmado"}), 400

# Iniciar o servidor Flask
if __name__ == "__main__":
    app.run(debug=True)
