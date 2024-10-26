// CreateUser.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import './createUser.css'; // Import the custom CSS file for styling
import { validateEmail } from './validation/validateEmail';

interface FormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const apiForgotPasswordURL = `${API_URL}/forgotpassword`
  const navigate = useNavigate(); // Access the history object
  const [formData, setFormData] = useState<FormData>({
    email: '',
  });
  const [message, setMessage] = useState('');

  const validateForm = () => {
    const emailError = validateEmail(formData.email, true);

    return !emailError;
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const _ = await axios.post(apiForgotPasswordURL, { email: formData.email }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        // console.log(forgotPasswordResponse.data);
        setMessage('An email will be sent to your email address if it exists');
      } catch (error) {
        // console.error('error sending forgot password email for this user', error);
        setMessage('An email will be sent to your email address if it exists');
      }
    }  else {
      console.log('Email form is invalid. Fix errors.');
      setMessage('The email format provided is invalid')
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div
      className="dark-background text-center"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <button
        onClick={handleLoginRedirect}
        style={{
          position: 'absolute',
          top: '10px',  // Distance from the top
          left: '10px', // Distance from the left
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Back to Login Page
      </button>
      <h1 className="text-white mb-4">Reset Password</h1>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '350px' }}>

        <div className="mb-3 space-out" style={{ paddingBottom: '20px' }}>
          <label htmlFor="email" className="text-white" style={{ fontSize: '20px' }}>
            Email:
          </label>
          <br />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter Email Address"
            required
            className="col-12"
            style={{ fontSize: '14px', paddingRight: '30px' }}
          />
          {message && <span style={{color: 'green'}}>{message}</span>}
        </div>

        <button
          type="submit"
          style={{ fontSize: '20px', padding: '5px' }}
        >
          Send Password Reset Email
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
