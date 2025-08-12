const Appointment = require('../models/Appointment');

exports.bookAppointment = async (req, res) => {
  const { doctorId, date, time } = req.body;
  const appointment = new Appointment({ doctorId, date, time });
  await appointment.save();
  res.send('Appointment booked');
};

exports.getAppointments = async (req, res) => {
  const appointments = await Appointment.find().populate('doctorId');
  res.json(appointments);
};
