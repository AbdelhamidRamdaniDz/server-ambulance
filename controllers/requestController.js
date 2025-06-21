const Patient = require('../models/Patient');

exports.getIncomingRequests = async (req, res) => {
    try {
        const requests = await Patient.find({ 
            assignedHospital: req.user.id, 
            status: 'pending' 
        }).populate('createdBy', 'fullName assignedAmbulance');

        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

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