import React, { useState } from 'react';

const RequestEmailVerification = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the form submission logic here
    // For example, send a request to your server to send the verification email
    setMessage('Verification email sent! Please check your inbox.');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1>Email Verification Request !!!</h1>
    </div>
  );
};

export default RequestEmailVerification;
