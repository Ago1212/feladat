import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAction } from '../utils/fetchAction';
import '../styles/style.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await fetchAction('loginUser', { email, password });
    if (result.success) {
      console.log(result.type);
      localStorage.setItem('user', JSON.stringify(result.user));
      alert('Login successful!');
      navigate('/dashboard');
    } else {
      alert(result.message || 'Login failed.');
    }
  };

  return (
    <div className="wrapper">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <button onClick={() => navigate('/register')}>Register Here</button></p>
    </div>
  );
}

export default LoginForm;
