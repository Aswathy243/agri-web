import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = ({ email }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert('Passwords do not match');
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/reset-password', {
        email,
        otp,
        newPassword,
      });
      alert('Password changed successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleReset}>
      <h2 className="login-page-title">Reset Password</h2>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="login-input"
        required
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="login-input"
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="login-input"
        required
      />
      <button
        type="submit"
        className="login-btn login-submit-btn"
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Reset Password'}
      </button>
    </form>
  );
};

export default ResetPassword;
