import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAction } from '../utils/fetchAction';
import '../styles/style.css';

function UpdateProfileForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(location.state?.user || {});
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!userData.email) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      } else {
        alert('No user data found. Redirecting to login.');
        navigate('/login');
      }
    }
  }, [userData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      alert('The new passwords do not match!');
      return;
    }

    const updateData = {
      id: userData.id,
      birthdate: userData.birthdate,
      nickname: userData.nickname,
    };

    if (passwords.newPassword) {
      updateData.password = passwords.newPassword;
    }

    const result = await fetchAction('updateUser', updateData);
    if (result.success) {
      localStorage.setItem('user', JSON.stringify(userData));
      alert('Profile updated successfully!');
      navigate('/dashboard');
    } else {
      alert(result.message || 'Update failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wrapper">
      <h2>Update Profile</h2>
      <div>
        <label>
          Nickname:
          <input
            type="text"
            value={userData.nickname}
            onChange={(e) => setUserData({ ...userData, nickname: e.target.value })}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Birthdate:
          <input
            type="date"
            value={userData.birthdate}
            onChange={(e) => setUserData({ ...userData, birthdate: e.target.value })}
            required
          />
        </label>
      </div>
      <div>
        <label>
          New Password:
          <input
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />
        </label>
      </div>
      <div>
        <label>
          Confirm New Password:
          <input
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          />
        </label>
      </div>

      <button type="submit">Save Changes</button>
      <button onClick={() => navigate('/dashboard')}>Back</button>
    </form>
  );
}

export default UpdateProfileForm;
