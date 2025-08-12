const Doctor = require('../models/Doctor');

exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
};

exports.addDoctor = async (req, res) => {
  const { name, specialization } = req.body;
  const doctor = new Doctor({ name, specialization });
  await doctor.save();
  res.send('Doctor added');
};
