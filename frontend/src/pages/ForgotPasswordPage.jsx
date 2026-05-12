import React, { useState } from 'react';
import SendOTP from './SendOTP';
import ResetPassword from './ResetPassword';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // Step 1 = send OTP, Step 2 = reset password
  const [email, setEmail] = useState('');

  return (
    <div className="login-page-container">
      <div className="login-page-card">
        {step === 1 ? (
          <SendOTP setStep={setStep} setEmail={setEmail} />
        ) : (
          <ResetPassword email={email} />
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
