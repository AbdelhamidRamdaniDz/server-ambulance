// File: controllers/requestController.js

const Patient = require('../models/Patient');

// @desc    Get all incoming requests for a hospital
// @route   GET /api/requests/incoming
// @access  Private (Hospital)
exports.getIncomingRequests = async (req, res) => {
    try {
        const requests = await Patient.find({ 
            assignedHospital: req.user.id, 
            status: 'pending' 
        }).populate('createdBy', 'firstName lastName assignedAmbulance');

        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Accept a request
// @route   PUT /api/requests/:id/accept
// @access  Private (Hospital)
exports.acceptRequest = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, 
            { status: 'confirmed' }, 
            { new: true, runValidators: true }
        );

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }
        
        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update a request to 'treated'
// @route   PUT /api/requests/:id/treat
// @access  Private (Hospital)
exports.treatRequest = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, 
            { status: 'treated' }, 
            { new: true, runValidators: true }
        );

        if (!patient) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }
        
        res.status(200).json({ success: true, data: patient });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
