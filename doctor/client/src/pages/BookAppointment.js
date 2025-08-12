

// src/pages/BookAppointment.js
import React, { useState } from 'react';
import axios from 'axios';

const BookAppointment = () => {
  const [formData, setFormData] = useState({ doctorId: '', date: '', time: '' });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('/api/appointments', formData)
      .then(res => alert('Appointment booked!'))
      .catch(err => alert('Booking failed'));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Book Appointment</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="doctorId" placeholder="Doctor ID" onChange={handleChange} required style={{ margin: '0.5rem' }} />
        <input type="date" name="date" onChange={handleChange} required style={{ margin: '0.5rem' }} />
        <input type="time" name="time" onChange={handleChange} required style={{ margin: '0.5rem' }} />
        <button type="submit">Book</button>
      </form>
    </div>
  );
};

export default BookAppointment;
