const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const HospitalStatus = require('../models/HospitalStatus');

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

// @desc    Get status of all hospitals for the paramedic map
// @route   GET /api/paramedic/hospital-statuses
// @access  Private (Paramedic)
exports.getHospitalStatuses = async (req, res) => {
    try {
        const statuses = await HospitalStatus.find().populate({
            path: 'hospital',
            select: 'name location'
        });
        res.status(200).json({ success: true, data: statuses });
    } catch (error) {
        console.error("Error fetching hospital statuses:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};