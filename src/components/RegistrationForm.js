import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAction } from '../utils/fetchAction';
import '../styles/style.css';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const result = await fetchAction('registerUser', { email, nickname, birthdate, password});
    if (result.success) {
      alert('Registration successful! You can now login.');
      navigate('/login');
    } else {
      alert(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="wrapper">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nickname:</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Birthdate:</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>

      <p>Already have an account? <button onClick={() => navigate('/login')}>Login Here</button></p>
    </div>
  );
}

export default RegisterForm;
