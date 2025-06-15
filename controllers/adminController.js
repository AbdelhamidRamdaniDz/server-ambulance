const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

// @desc    Create a new user (role is determined by the request body)
// @route   POST /api/admin/users
// @access  Private (super-admin)
exports.createUser = async (req, res) => {
    try {
        const { role, displayName, email, password, location, formattedAddress, nationalId, associatedAmbulance } = req.body;
        let user;

        if (role === 'hospital') {
            const hospitalData = {
                name: displayName,
                email,
                password,
                location,
                formattedAddress
            };
            user = await Hospital.create(hospitalData);
        } else if (role === 'paramedic' || role === 'doctor') {
            const nameParts = displayName.split(' ');
            const firstName = nameParts.shift() || '';
            const lastName = nameParts.join(' ') || ''; 

            const doctorData = {
                firstName,
                lastName,
                email,
                password,
                nationalId,
                nationalCode: nationalId,
                associatedAmbulance
            };
            user = await Doctor.create(doctorData);
        } else {
            return res.status(400).json({ success: false, error: 'Invalid user role specified' });
        }
        
        user.password = undefined; 
        res.redirect('/admin/dashboard');

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send('خطأ: البريد الإلكتروني أو الرقم الوطني موجود بالفعل.');
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).send(`خطأ في التحقق: ${messages}`);
        }
        res.status(400).send(`خطأ: ${error.message}`);
    }
};


// @desc    Get all users (both hospitals and doctors)
// @route   GET /api/admin/users
// @access  Private (super-admin)
exports.getUsers = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        const doctors = await Doctor.find();
        res.status(200).json({ 
            success: true, 
            data: { hospitals, doctors } 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
