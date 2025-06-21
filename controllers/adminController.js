const Hospital = require('../models/Hospital');
const Paramedic = require('../models/Paramedic');

exports.createUser = async (req, res) => {
    try {
        const { role, displayName, email, password, formattedAddress, longitude, latitude, nationalId, associatedAmbulance } = req.body;
        
        let newUser;

        if (role === 'hospital') {
            if (!displayName || !email || !password || !longitude || !latitude) {
                 return res.status(400).json({ success: false, message: 'يرجى إدخال جميع الحقول المطلوبة للمستشفى.' });
            }
            const hospitalData = {
                name: displayName,
                email,
                password,
                formattedAddress,
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                }
            };
            newUser = await Hospital.create(hospitalData);
        } else if (role === 'paramedic') {
             if (!displayName || !email || !password || !nationalId) {
                 return res.status(400).json({ success: false, message: 'يرجى إدخال جميع الحقول المطلوبة للمسعف.' });
            }
            newUser = await Paramedic.create({ 
                fullName: displayName, 
                email, 
                password, 
                nationalId, 
                associatedAmbulance 
            });
        } else {
            return res.status(400).json({ success: false, message: 'الدور المحدد غير صالح.' });
        }
        
        res.status(201).json({ success: true, message: `تم إنشاء حساب ${role} بنجاح.`, data: newUser });

    } catch (error) {
        console.error("Error creating user:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'فشل في الإنشاء. البريد الإلكتروني أو الرقم الوطني مسجل مسبقًا.' 
            });
        }
        
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        const paramedics = await Paramedic.find();
        res.status(200).json({ success: true, data: { hospitals, paramedics } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
