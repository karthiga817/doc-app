
// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('/api/auth/login', formData)
      .then(res => {
        localStorage.setItem('token', res.data.token);
        alert('Logged in!');
      })
      .catch(err => alert('Login failed'));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={{ margin: '0.5rem' }} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={{ margin: '0.5rem' }} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;