import React, { useEffect, useState } from "react";
import axios from "axios";

interface PaymentProps {
  paymentId: string;
  qrCode: string;
  user: string;
}

const Payment: React.FC<PaymentProps> = ({ paymentId, qrCode, user }) => {
  const [paymentStatus, setPaymentStatus] = useState<string>("Waiting for Payment...");

  // Check payment status by calling the back-end every 10 seconds
  const checkPaymentStatus = async () => {
    try {
      const response = await axios.post("/check_payment", {
        payment_id: paymentId,
        user: user,
      });
      if (response.data.status === "Payment confirmed") {
        setPaymentStatus("Payment confirmed! Redirecting...");
        setTimeout(() => {
          window.location.href = "/chat";
        }, 2000);  // Redirect after 2 seconds
      } else {
        setPaymentStatus("Waiting for Payment...");
      }
    } catch (error) {
      setPaymentStatus("Error checking payment status");
    }
  };

  useEffect(() => {
    const interval = setInterval(checkPaymentStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div>
      <h1>Purchase More Messages</h1>
      <p>Scan the QR code below to pay for more messages:</p>
      <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
      <h3>{paymentStatus}</h3>
    </div>
  );
};

export default Payment;
