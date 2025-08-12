
// src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('/api/auth/register', formData)
      .then(res => alert('Registered successfully'))
      .catch(err => alert('Registration failed'));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required style={{ margin: '0.5rem' }} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={{ margin: '0.5rem' }} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={{ margin: '0.5rem' }} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
