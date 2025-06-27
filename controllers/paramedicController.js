const Paramedic = require('../models/Paramedic');
const Hospital = require('../models/Hospital');
const HospitalStatus = require('../models/HospitalStatus');

// @desc    Get current logged in paramedic's profile
// @route   GET /api/paramedic/profile
// @access  Private (Paramedic)
exports.getProfile = async (req, res) => {
    // The user object is already attached to req by the 'protect' middleware
    res.status(200).json({ success: true, data: req.user });
};

// @desc    Update password for the current logged in paramedic
// @route   PUT /api/paramedic/profile
// @access  Private (Paramedic)
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'يرجى إدخال كلمة المرور الحالية والجديدة.' });
        }

        const user = await Paramedic.findById(req.user.id).select('+password');
        if (!user) {
             return res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'تم تحديث كلمة المرور بنجاح.' });

    } catch (error) {
        console.error("Password Update Error:", error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
};

// @desc    Get status of all hospitals for the paramedic map
// @route   GET /api/paramedic/hospital-statuses
// @access  Private (Paramedic)
exports.getHospitalStatuses = async (req, res) => {
    try {
        const allHospitals = await Hospital.find().select('name location');
        const allStatuses = await HospitalStatus.find();

        const statusMap = new Map();
        allStatuses.forEach(status => {
            statusMap.set(status.hospital.toString(), status);
        });

        const combinedData = allHospitals.map(hospital => {
            const status = statusMap.get(hospital._id.toString());
            return {
                hospital: {
                    _id: hospital._id,
                    name: hospital.name,
                    location: hospital.location
                },
                isERAvailable: status ? status.isERAvailable : false, // Default to unavailable
                availableBeds: status ? status.availableBeds : {}
            };
        });

        res.status(200).json({ success: true, data: combinedData });
    } catch (error) {
        console.error("Error fetching hospital statuses for paramedic:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
