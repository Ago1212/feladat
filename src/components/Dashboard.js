import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAction } from '../utils/fetchAction';
import '../styles/style.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      alert('Nincs bejelentkezve, átiránytás a bejelentkező oldalra');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    const result = await fetchAction('logoutUser', {id:userData.id});
    if (result && result.success) {
      localStorage.removeItem('user'); 
      alert('Kijelentkezés sikeres!');
      navigate('/login'); 
    } else {
      alert(result.message || 'Logout failed.');
    }
  };

  const handleProfileUpdate = () => {
    if (userData) {
      navigate('/update-profile', { state: { user: userData } });
    }
  };

  return (
    <div className="wrapper">
      <h2>User data</h2>
      {userData ? (
        <div>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Nickname:</strong> {userData.nickname}</p>
          <p><strong>Birthdate:</strong> {userData.birthdate}</p>
          <button onClick={handleProfileUpdate}>Update Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}

export default Dashboard;
