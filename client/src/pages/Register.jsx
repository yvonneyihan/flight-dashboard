import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import useDarkMode from '../hooks/useDarkMode';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [dark, setDark] = useDarkMode();

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/login');
      } else if (response.status === 409) {
        const data = await response.json();
        setError(data.error || 'Email already registered. Please log in.');
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('An error occurred during registration.');
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
            <h1>Create an account</h1>
            <p>Start tracking flights in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="sl-auth-form">
            <div>
              <label className="sl-label">Full name</label>
              <div className="sl-auth-input">
                <FiUser size={15} />
                <input
                  name="name"
                  placeholder="Alex Johnson"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="sl-label">Email</label>
              <div className="sl-auth-input">
                <FiMail size={15} />
                <input
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="sl-label">Password</label>
              <div className="sl-auth-input">
                <FiLock size={15} />
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" className="sl-auth-eye" onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password visibility">
                  {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="sl-auth-error">{error}</p>}

            <button type="submit" className="sl-btn-primary sl-auth-submit">Create account</button>
          </form>

          <div className="sl-auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;