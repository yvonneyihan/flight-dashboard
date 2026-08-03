import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import useDarkMode from '../hooks/useDarkMode';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [dark, setDark] = useDarkMode();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (res.status === 401) {
        const data = await res.json();
        setError(data.error || 'Incorrect email or password.');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Login failed. Server returned ${res.status}.`);
        return;
      }

      const data = await res.json();
      localStorage.setItem('userId', data.userId || '1');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="sl-auth-page">
      <button className="sl-auth-theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle theme">
        {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
      </button>
      <div className="sl-auth-wrap">
        <div className="sl-auth-brand">
          <div className="sl-auth-brand-mark"><FaPlane size={16} /></div>
          <span>Skylink</span>
        </div>

        <div className="sl-auth-card">
          <div className="sl-auth-heading">
            <h1>Welcome back</h1>
            <p>Sign in to your Skylink workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="sl-auth-form">
            <div>
              <label className="sl-label">Email</label>
              <div className="sl-auth-input">
                <FiMail size={15} />
                <input
                  type="email"
                  name="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="sl-label">Password</label>
              <div className="sl-auth-input">
                <FiLock size={15} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="sl-auth-eye" onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password visibility">
                  {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="sl-auth-error">{error}</p>}

            <button type="submit" className="sl-btn-primary sl-auth-submit">Sign in to Skylink</button>
          </form>

          <div className="sl-auth-footer">
            <p>
              No account yet?{' '}
              <Link to="/register">Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;