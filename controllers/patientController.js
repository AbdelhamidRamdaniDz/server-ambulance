const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

exports.createPatient = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const patient = await Patient.create(req.body);

        res.status(201).json({ success: true, data: patient });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate('createdBy', 'fullName')
            .populate('assignedHospital', 'name');

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }
        
        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};