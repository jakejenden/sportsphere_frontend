import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Extract token from URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const apiResetPasswordURL = `${API_URL}/resetpassword`;

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!token) {
      setError('Token is missing');
      return;
    }

    setLoading(true); // Set loading state
    setError('');
    setSuccess('');

    try {
      // Call your backend API to reset the password
      const response = await axios.post(apiResetPasswordURL, {
        password: password,
        token: token,
      });

      console.log(response.data.success);

      if (response.data.success) {
        setSuccess('Password reset successfully');
        setTimeout(() => navigate('/login'), 2000); // Redirect to login after success
      } else {
        setError('Failed to reset password');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'An error occurred while resetting the password');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handlePasswordReset}>
        <label>
          New Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading} // Disable input while loading
          />
        </label>
        <br />
        <label>
          Confirm New Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading} // Disable input while loading
          />
        </label>
        <br />
        <button type="submit" disabled={loading}> {/* Disable button while loading */}
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
