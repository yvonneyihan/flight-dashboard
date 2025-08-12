import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch('/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/users/login');
      } else if (response.status === 409) {
        const data = await response.json();
        alert(data.error || 'Email already registered. Please log in.');
        navigate('/users/login'); 
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
    <div className="container">
      <h1>📝 Create Account</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          required
          value={formData.name}
          onChange={handleChange}
        /><br /><br />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
        /><br /><br />
        <input
          name="password"
          type="password"
          placeholder="Set your password"
          required
          value={formData.password}
          onChange={handleChange}
        /><br /><br />
        
        <button type="submit">Register</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      <div>
        {/* <a href="/users/login" className="register-link"></a> */}
        <Link to="/users/login" className="register-link">Already have an account? Login here</Link>
      </div>
    </div>
  );
};

export default Register;
