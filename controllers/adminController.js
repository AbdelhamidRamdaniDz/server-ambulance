const Hospital = require('../models/Hospital');
const Paramedic = require('../models/Paramedic');

// @desc    إنشاء مستخدم جديد (مستشفى أو مسعف)
// @route   POST /api/admin/users
// @access  Private (super-admin)
exports.createUser = async (req, res) => {
    try {
        const { role, displayName, email, password, formattedAddress, nationalId, associatedAmbulance } = req.body;
        
        let user;

        if (role === 'hospital') {
            // --- تم الإصلاح هنا ---
            // إنشاء كائن مخصص لمطابقة حقول النموذج مع شيمة النموذج
            const hospitalData = {
                name: displayName, // مطابقة 'displayName' من النموذج مع حقل 'name'
                email: email,
                password: password,
                formattedAddress: formattedAddress
            };
            user = await Hospital.create(hospitalData);

        } else if (role === 'paramedic') {
            const { displayName, ...rest } = req.body;
            // هذا يطابق 'displayName' بشكل صحيح مع 'fullName' للمسعف
            await Paramedic.create({ fullName: displayName, ...rest });
        } else {
            throw new Error('Invalid role specified');
        }
        
        res.redirect('/admin/dashboard?success=true');

    } catch (error) {
        let errorMessage = error.message;
        if (error.code === 11000) {
            errorMessage = 'البريد الإلكتروني أو الرقم الوطني موجود بالفعل.';
        }
        const failedRole = req.body.role || 'paramedic';
        res.redirect(`/admin/create-user-form?role=${failedRole}&error=${encodeURIComponent(errorMessage)}`);
    }
};

// @desc    جلب جميع المستخدمين (المستشفيات والمسعفين)
// @route   GET /api/admin/users
// @access  Private (super-admin)
exports.getUsers = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        const paramedics = await Paramedic.find();
        res.status(200).json({ success: true, data: { hospitals, paramedics } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
