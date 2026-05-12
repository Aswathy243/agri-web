import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    panchayat: '',
    block: '',
  });

  const [message, setMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/register', formData);
      setShowSuccessPopup(true);
      setFormData({ name: '', phone: '', village: '', panchayat: '', block: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  const closePopup = () => {
    setShowSuccessPopup(false);
    navigate('/login'); // Redirect to login page after closing popup
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Farmer Registration</h2>
      {message && <p className="register-message">{message}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        {['name', 'phone', 'village', 'panchayat', 'block'].map(field => (
          <div key={field} className="form-field">
            <label className="form-label">{field}</label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required={field === 'name' || field === 'phone'}
              className="form-input"
            />
          </div>
        ))}
        <button type="submit" className="submit-button">
          Register
        </button>
      </form>

      {/* Success Popup */}
      {showSuccessPopup && (
        <>
          <div className="overlay"></div>
          <div className="success-popup">
            <h3>Registration Successful!</h3>
            <p>Your account has been created successfully.</p>
            <button onClick={closePopup}>Continue to Login</button>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterPage;