// CreateUser.tsx

import React, { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import './createUser.css'; // Import the custom CSS file for styling

const CreateUser: React.FC = () => {
  const apiURL = `${API_URL}/createuser`
  const navigate = useNavigate(); // Access the history object
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });

  const [retypePassword, setRetypePassword] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Validate if the passwords match
    if (formData.password !== retypePassword) {
      console.error('Passwords do not match');
      // Add your logic for handling the password mismatch (e.g., show an error message)
      return;
    }
  
    try {
      const response = await axios.post(apiURL, formData, {
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
  };
  
  return (
    <div className="dark-background text-center" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: '20px' }}>
      <h1 className="text-white mb-4">Create User</h1>
      <Form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '350px' }}>
        <Form.Group controlId="formUsername" className="mb-3 space-out">
          <Form.Label className="text-white" style={{ fontSize: '20px' }}>Username:</Form.Label><br />
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="col-12"
            style={{ fontSize: '14px', paddingRight: '30px' }}
          />
        </Form.Group>

        <Form.Group controlId="formPassword" className="mb-3 space-out">
          <Form.Label className="text-white" style={{ fontSize: '20px' }}>Password:</Form.Label><br />
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="col-12"
            style={{ fontSize: '14px', paddingRight: '30px' }}
          />
        </Form.Group>

        <Form.Group controlId="formRetypePassword" className="mb-3">
          <Form.Label className="text-white" style={{ fontSize: '20px' }}>Retype Password:</Form.Label><br />
          <Form.Control
            type="password"
            name="retypePassword"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            required
            className="col-12"
            style={{ fontSize: '14px', paddingRight: '30px' }}
          />
        </Form.Group>

        <Form.Group controlId="formEmail" className="mb-3 space-out" style={{ paddingBottom: '20px' }}>
          <Form.Label className="text-white" style={{ fontSize: '20px' }}>Email:</Form.Label><br />
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="col-12"
            style={{ fontSize: '14px', paddingRight: '30px' }}
          />
        </Form.Group>

        <Button variant="primary" type="submit" style={{ fontSize: '20px', padding: '5px' }}>
          Create User
        </Button>
      </Form>
    </div>
  );
};

export default CreateUser;
