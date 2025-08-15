import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting login...");

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      // Handle incorrect credentials
      if (res.status === 401) {
        const data = await res.json();
        alert(data.error || 'Incorrect email or password.');
        return;
      }

      // Handle other non-success statuses
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Login failed. Server returned ${res.status}.`);
        return;
      }

      // Success
      const data = await res.json();
      localStorage.setItem('userId', data.userId || '1');
      navigate('/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
  };
  return (
    <div className="container">
      <h1>🔐 Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        /><br /><br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br /><br />

        <button type="submit">Login</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div>
        <Link to="/register" className="register-link">Need an account? Register here</Link>
      </div>
    </div>
  );
};

export default Login;
