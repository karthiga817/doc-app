import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios.get('/api/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Doctors List</h2>
      <ul>
        {doctors.map(doc => (
          <li key={doc._id}>{doc.name} - {doc.specialization}</li>
        ))}
      </ul>
    </div>
  );
};

export default Doctors;