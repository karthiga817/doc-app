// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import Doctors from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#eee' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/doctors" style={{ marginRight: '1rem' }}>Doctors</Link>
        <Link to="/book" style={{ marginRight: '1rem' }}>Book Appointment</Link>
        <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
        <Link to="/register">Register</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
