import React, { useEffect, useState } from "react";
import axios from "axios";

// Definição das props que serão passadas ao componente
interface PaymentProps {
  paymentHash: string;
  qrCode: string;
  user: string;
}

// Componente de pagamento que exibe o QR code e verifica o status do pagamento
const Payment: React.FC<PaymentProps> = ({ paymentHash, qrCode, user }) => {
  const [paymentStatus, setPaymentStatus] = useState<string>("Waiting for Payment...");

  // Função para verificar o status do pagamento chamando o backend
  const checkPaymentStatus = async () => {
    try {
      const response = await axios.post("/verificar_pagamento", {
        payment_hash: paymentHash,
        usuario: user,
      });
      if (response.data.status === "Pagamento confirmado") {
        setPaymentStatus("Payment confirmed! Redirecting...");
        // Redirecionar o usuário de volta ao chat após o pagamento ser confirmado
        setTimeout(() => {
          window.location.href = "/chat";
        }, 2000);
      } else {
        setPaymentStatus("Waiting for Payment...");
      }
    } catch (error) {
      console.error("Error checking payment status", error);
      setPaymentStatus("Error verifying payment");
    }
  };

  // UseEffect para verificar o pagamento a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(checkPaymentStatus, 10000); // 10 segundos
    return () => clearInterval(interval); // Limpa o intervalo quando o componente é desmontado
  }, []);

  return (
    <div>
      <h1>Buy More Messages</h1>
      <p>Scan the QR code below to pay and receive more messages.</p>

      <div>
        <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
      </div>

      <h3>{paymentStatus}</h3>
    </div>
  );
};

export default Payment;
