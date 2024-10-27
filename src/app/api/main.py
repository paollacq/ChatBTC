import os
import requests
from flask import Flask, jsonify, request
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Use your OpenNode API key from the .env file
OPENNODE_API_KEY = os.getenv("OPENNODE_API_KEY")
OPENNODE_API_URL = "https://api.opennode.com/v1/charges"  # For test environment

# Simulated user database
users = {
    "user1": {"messages_left": 3}
}

# Function to create an OpenNode Lightning invoice
def generate_invoice_opennode(amount_btc):
    headers = {
        "Authorization": f"Bearer {OPENNODE_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "amount": amount_btc,  # Amount in BTC or satoshis
        "currency": "BTC",  # Lightning network payment
        "description": "Payment for ChatGPT messages",
        "callback_url": "https://your-website.com/callback",  # Optional: add callback for notifications
        "success_url": "https://your-website.com/success"  # Optional: redirect after successful payment
    }
    response = requests.post(f"{OPENNODE_API_URL}/charges", json=data, headers=headers)
    if response.status_code == 201:
        invoice_data = response.json()['data']
        return invoice_data['lightning_invoice']['payreq'], invoice_data['id']
    else:
        raise Exception(f"Failed to generate invoice. Status: {response.status_code}, Response: {response.text}")

# API route to create a payment request (invoice)
@app.route('/purchase_messages', methods=['POST'])
def purchase_messages():
    user = request.form.get("user")
    payment_request, payment_id = generate_invoice_opennode(0.0001)  # Amount in BTC (adjust as needed)
    return jsonify({"payment_request": payment_request, "payment_id": payment_id, "user": user})

# Function to verify the payment status via OpenNode
def verify_payment_opennode(payment_id):
    headers = {
        "Authorization": f"Bearer {OPENNODE_API_KEY}"
    }
    response = requests.get(f"{OPENNODE_API_URL}/charge/{payment_id}", headers=headers)
    if response.status_code == 200:
        return response.json()['data']['status'] == 'paid'
    else:
        raise Exception(f"Failed to verify payment. Status: {response.status_code}, Response: {response.text}")

# API route to check if the payment is complete and update the user's balance
@app.route('/check_payment', methods=['POST'])
def check_payment_status():
    payment_id = request.form.get("payment_id")
    user = request.form.get("user")
    if verify_payment_opennode(payment_id):
        users[user]['messages_left'] += 10  # Add messages after payment confirmation
        return jsonify({"status": "Payment confirmed", "messages_left": users[user]['messages_left']})
    else:
        return jsonify({"status": "Payment not confirmed"}), 400

# Run Flask server
if __name__ == "__main__":
    app.run(debug=True)
