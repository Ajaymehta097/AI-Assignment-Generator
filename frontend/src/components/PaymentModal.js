// src/components/PaymentModal.js
import React, { useState } from "react";
import styles from "./PaymentModal.module.css";

const UPI_ID   = "7725813053@ybl";
const AMOUNT   = "10";
const UPI_NAME = "AssignmentAI";
const UPI_NOTE = "Assignment Download Fee";

function getQrImageUrl() {
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent(UPI_NOTE)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
}

export default function PaymentModal({ onConfirm, onClose }) {
  const [confirmed, setConfirmed] = useState(false);
  const [checked, setChecked]     = useState(false); // user must tick checkbox

  const handleConfirm = () => {
    if (!checked) return;
    setConfirmed(true);
    setTimeout(() => onConfirm(), 500);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.header}>
          <span className={styles.icon}>💳</span>
          <h2>Pay to Download</h2>
          <p>Scan QR and pay <strong>₹{AMOUNT}</strong> to download</p>
        </div>

        {/* QR Code */}
        <div className={styles.qrBox}>
          <img src={getQrImageUrl()} alt="UPI Payment QR" className={styles.qrImage} />
          <p className={styles.upiId}>UPI: {UPI_ID}</p>
        </div>

        {/* App labels */}
        <div className={styles.apps}>
          <span>Pay using</span>
          <div className={styles.appList}>
            <span>GPay</span>
            <span>PhonePe</span>
            <span>Paytm</span>
            <span>Any UPI</span>
          </div>
        </div>

        <div className={styles.divider}><span>After payment</span></div>

        {/* Checkbox — user must confirm they paid */}
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>I have completed the payment of ₹{AMOUNT}</span>
        </label>

        {/* Download button — only enabled after checkbox ticked */}
        {!confirmed ? (
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!checked}
          >
            ✅ I have paid — Download Now
          </button>
        ) : (
          <div className={styles.downloading}>⏳ Starting download...</div>
        )}

        <p className={styles.note}>
          ⚠️ Tick the checkbox only after completing payment
        </p>
      </div>
    </div>
  );
}   