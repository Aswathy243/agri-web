import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      await axios.post('http://localhost:5000/api/login/send-otp', { phone });
      alert('OTP sent');
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login/verify-otp', { phone, otp });
      if (res.data.success) {
        //localStorage.setItem('userPhone', phone);
        // window.location.href = 'about:blank';
       localStorage.setItem('token', res.data.token); // Store the token instead of phone
             localStorage.setItem('user', JSON.stringify(res.data.user)); // Store user data

        navigate('/farmerforum');

      
      }
    } catch (err) {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-card">
        <h2 className="login-page-title">Login to Idukki Agro</h2>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          className="login-input"
        />
        {otpSent && (
          <>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="login-input otp-input"
            />
            <button onClick={sendOtp} className="login-btn resend-otp-btn">
              Resend OTP
            </button>
          </>
        )}
        {!otpSent ? (
          <button onClick={sendOtp} className="login-btn send-otp-btn">
            Send OTP
          </button>
        ) : (
          <button onClick={verifyOtp} className="login-btn verify-otp-btn">
            Verify OTP
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
