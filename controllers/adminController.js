const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

// @desc    Create a new user (hospital or doctor) by a super-admin
// @route   POST /api/admin/users
// @access  Private (super-admin)
exports.createUser = async (req, res) => {
    try {
        const { role, displayName, email, password, location, formattedAddress, nationalId, associatedAmbulance } = req.body;
        let user;

        if (role === 'hospital') {
            // إنشاء كائن بيانات للمستشفى، مع تحويل displayName إلى name
            const hospitalData = {
                name: displayName,
                email,
                password,
                location: location ? JSON.parse(location) : undefined, // Ensure location is an object if provided
                formattedAddress
            };
            user = await Hospital.create(hospitalData);
        } else if (role === 'paramedic' || role === 'doctor') {
            // تقسيم displayName إلى firstName و lastName
            const nameParts = displayName.split(' ');
            const firstName = nameParts.shift() || ''; // الجزء الأول هو الاسم الأول
            const lastName = nameParts.join(' ') || '';  // الباقي هو اسم العائلة

            const doctorData = {
                firstName,
                lastName,
                email,
                password,
                nationalCode: nationalId, // مطابقة nationalId مع nationalCode المطلوب في النموذج
                associatedAmbulance
            };
            user = await Doctor.create(doctorData);
        } else {
            return res.status(400).json({ success: false, error: 'Invalid user role specified' });
        }
        
        user.password = undefined; 
        // عند النجاح، أعد التوجيه إلى لوحة التحكم
        res.redirect('/admin/dashboard');

    } catch (error) {
        let errorMessage = 'حدث خطأ غير متوقع.';
        if (error.code === 11000) {
            errorMessage = 'البريد الإلكتروني أو الرقم الوطني موجود بالفعل.';
        } else if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            errorMessage = `خطأ في التحقق: ${messages}`;
        }
        
        // عند الفشل، أعد التوجيه إلى نفس الصفحة مع رسالة الخطأ
        const role = req.body.role || 'paramedic';
        res.redirect(`/admin/create-user-form?role=${role}&error=${encodeURIComponent(errorMessage)}`);
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
