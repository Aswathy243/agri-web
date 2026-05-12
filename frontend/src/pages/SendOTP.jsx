import React, { useState } from 'react';
import axios from 'axios';

const SendOTP = ({ setStep, setEmail }) => {
  const [inputEmail, setInputEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/send-otp', { email: inputEmail });
      alert('OTP sent to your email');
      setEmail(inputEmail);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendOTP}>
      <h2 className="login-page-title">Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={inputEmail}
        onChange={(e) => setInputEmail(e.target.value)}
        className="login-input"
        required
      />
      <button
        type="submit"
        className="login-btn login-submit-btn"
        disabled={loading}
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </form>
  );
};

export default SendOTP;
