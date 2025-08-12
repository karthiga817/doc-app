const express = require('express');
const router = express.Router();
const { getDoctors, addDoctor } = require('../controllers/doctorController');
const auth = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.post('/', auth, addDoctor);

module.exports = router;
