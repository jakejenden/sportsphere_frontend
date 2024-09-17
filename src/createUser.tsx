// CreateUser.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import './createUser.css'; // Import the custom CSS file for styling
import { validateEmail } from './validation/validateEmail';
import { validateUsername } from './validation/validateUsername';
import { validatePassword } from './validation/validatePassword';
import { validatePostcode } from './validation/validatePostcode';

interface FormData {
  username: string;
  password: string;
  email: string;
  postcode: string;
}

interface UsernameEmailUniqueResponse {
  UsernameUnique: boolean;
  EmailUnique: boolean;
}

interface Errors {
  username?: string;
  password?: string;
  email?: string;
  postcode?: string;
}

const CreateUser: React.FC = () => {
  const apiCreateUserURL = `${API_URL}/createuser`
  const apiCheckUsernameEmailUnique = `${API_URL}/checkusernameemailunique`
  const navigate = useNavigate(); // Access the history object
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
    postcode: '',
  });
  
  const [retypePassword, setRetypePassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const validateForm = (isEmailUnique: boolean, isUsernameUnique: boolean) => {
    const emailError =  validateEmail(formData.email, isEmailUnique);
    const usernameError = validateUsername(formData.username, isUsernameUnique);
    const passwordError = validatePassword(formData.password, retypePassword);
    const postcodeError = validatePostcode(formData.postcode);

    setErrors({
      email: emailError,
      username: usernameError,
      password: passwordError,
      postcode: postcodeError,
    });

    return !emailError && !usernameError && !passwordError;
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'postcode' ? value.toUpperCase() : value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const usernameEmailUniqueResponse = await axios.post<UsernameEmailUniqueResponse>(apiCheckUsernameEmailUnique, {email: formData.email, username: formData.username}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const {UsernameUnique, EmailUnique} = usernameEmailUniqueResponse.data

    console.log(EmailUnique, UsernameUnique)

    if (validateForm(UsernameUnique, EmailUnique)) {
      try {
        const response = await axios.post(apiCreateUserURL, formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        // Handle success, e.g., show a success message or redirect to another page
        console.log('User created successfully', response.data);

        // Redirect to the login page
        navigate('/login');
      } catch (error) {
        // Handle errors, e.g., display an error message
        console.error('Error creating user', error);
      }
      console.log('Form is valid. Submitting...');
    } else {
      console.log('Form is invalid. Fix errors.', errors);
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
        Back to Login
      </button>
      <h1 className="text-white mb-4">Create User</h1>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '350px' }}>
        <div className="mb-3 space-out">
          <label htmlFor="username" className="text-white" style={{ fontSize: '20px' }}>
            Username:
          </label>
          <br />
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter Username"
            required
            className="col-12"
            style={{ fontSize: '14px', paddingRight: '30px' }}
          />
          {errors.username && <span style={{ color: 'red' }}>{errors.username}</span>}
        </div>

        <div className="mb-3 space-out">
          <label htmlFor="password" className="text-white" style={{ fontSize: '20px' }}>
            Password:
          </label>
          <br />
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter Password"
            required
            className="col-12"
            style={{ fontSize: '14px', paddingRight: '30px' }}
          />
          {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}
        </div>

        <div className="mb-3">
          <label htmlFor="retypePassword" className="text-white" style={{ fontSize: '20px' }}>
            Retype Password:
          </label>
          <br />
          <input
            type="password"
            id="retypePassword"
            name="retypePassword"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            placeholder="Enter Password again"
            required
            className="col-12"
            style={{ fontSize: '14px', paddingRight: '30px' }}
          />
        </div>

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
          {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
        </div>

        <div className="mb-3" style={{ paddingBottom: '20px' }}>
          <label htmlFor="postcode" className="text-white" style={{ fontSize: '20px' }}>
            Postcode:
          </label>
          <br />
          <input
            type="postcode"
            id="postcode"
            name="postcode"
            value={formData.postcode}
            onChange={handleInputChange}
            placeholder="Enter Your Postcode"
            required
            className="col-12"
            style={{ fontSize: '14px', paddingRight: '30px' }}
          />
          {errors.postcode && <span style={{ color: 'red' }}>{errors.postcode}</span>}
        </div>

        <button
          type="submit"
          style={{ fontSize: '20px', padding: '5px' }}
        >
          Create User
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
