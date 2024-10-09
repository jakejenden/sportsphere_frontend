import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';
import { validatePostcode } from './validation/validatePostcode';

type UserDetails = {
  Username: string;
  Email: string;
  Postcode: string;
};

const AccountDetailsPage: React.FC = () => {
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const [userDetails, setUserDetails] = useState<UserDetails>({
    Username: '',
    Email: '',
    Postcode: '',
  });
  const navigate = useNavigate();

  const apiUpdatePostcodeURL = `${API_URL}/updatepostcode`;
  const apiGetUserDetailsURL = `${API_URL}/getuserdetails`;
  const apiLogoutURL = `${API_URL}/logout`;
  const apiDeleteAccount = `${API_URL}/removeuser`

  const handlePostcodeChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
    }

    const postcodeError = validatePostcode(postcode);

    setError(postcodeError);

    setLoading(true); // Set loading state
    setError('');
    setSuccess('');

    try {
      // Call your backend API to reset the password
      const response = await axios.post(apiUpdatePostcodeURL, {
        Postcode: postcode,
      },
        { withCredentials: true });

      setSuccess('Postcode updated successfully!')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'An error occurred while updating the postcode');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const payload = {Username: userDetails.Username};
      await axios.delete(apiDeleteAccount, {
        data: payload,
        withCredentials: true,
      });

      localStorage.removeItem('token');

      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  }

  const handleLogout = async () => {
    try {
      await axios.get(apiLogoutURL, {
        withCredentials: true,
      });

      localStorage.removeItem('token');

      navigate('/login'); // Use navigate to redirect after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleRedirectToEventSearch = () => {
    navigate('/return-results')
  };

  useEffect(() => {
    axios.get<UserDetails>(apiGetUserDetailsURL, {
      withCredentials: true,
    })
    .then((response) => {
      setUserDetails(response.data);
    })
    .catch((error) => {
      console.error("Error fetching user details:", error);
    });
  }, []);

  return (
    <div className="container mt-5">
      <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
              Settings
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li><a className="dropdown-item" href="#" onClick={handleRedirectToEventSearch}>Event Search</a></li>
              <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
            </ul>
      </div>
      <h2>User Profile</h2>
      {userDetails ? (
        <div>
          <p><strong>Username:</strong> {userDetails.Username}</p>
          <p><strong>Email:</strong> {userDetails.Email}</p>
          <p><strong>Postcode:</strong> {userDetails.Postcode}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <h1>Update Postcode</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handlePostcodeChange}>
        <label>
          New Postcode:
          <input
            type="postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            disabled={loading} // Disable input while loading
          />
        </label>
        <br />
        <button type="submit" disabled={loading}> {/* Disable button while loading */}
          {loading ? 'Updating...' : 'Update Postcode'}
        </button>
        <br />
      </form>
      <br />
      <button type="submit" disabled={loading} onClick={handleDeleteAccount}> {/* Disable button while loading */}
        {loading ? 'Deleting...' : 'Delete Account'}
      </button>
    </div>
  );
};

export default AccountDetailsPage;
