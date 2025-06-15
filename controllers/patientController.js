// File: controllers/patientController.js

const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Create a new patient record
// @route   POST /api/patients
// @access  Private (Doctor)
exports.createPatient = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;

        const patient = await Patient.create(req.body);

        res.status(201).json({ success: true, data: patient });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
