const Department = require('../models/Department');
const HospitalStatus = require('../models/HospitalStatus');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

exports.createDoctor = async (req, res) => {
    try {
        const { fullName, specialty, nationalCode, phone } = req.body;
        const doctorData = { fullName, specialty, nationalCode, phone, hospital: req.user.id };
        const doctor = await Doctor.create(doctorData);
        res.status(201).json({ success: true, data: doctor });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'فشل في الإضافة. الرقم الوطني الذي أدخلته مسجل مسبقًا.' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ hospital: req.user.id }).select('_id fullName specialty nationalCode phone email');
        res.status(200).json({ success: true, data: doctors });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب الأطباء' });
    }
};

exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ hospital: req.user.id })
            .populate({ path: 'staff.doctor', select: 'fullName' });
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('staff.doctor', 'fullName phone email');
        if (!department) {
            return res.status(404).json({ success: false, message: 'القسم غير موجود' });
        }
        res.status(200).json({ success: true, data: department });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { name, description, icon, color, isAvailable, beds } = req.body;
        const departmentData = { hospital: req.user.id, name, description, icon, color, isAvailable, beds };
        const department = await Department.create(departmentData);
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        let department = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        });
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.status(200).json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.addStaffToDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.deptId);
        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        const { doctorId, roleInDepartment, onDuty } = req.body;
        if (department.staff.some(member => member.doctor.toString() === doctorId)) {
            return res.status(400).json({ success: false, message: 'هذا الطبيب مضاف بالفعل إلى هذا القسم.' });
        }
        department.staff.push({ doctor: doctorId, roleInDepartment, onDuty: onDuty || false });
        await department.save();
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.removeStaffFromDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.deptId);
        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        department.staff.pull({ _id: req.params.staffId });
        await department.save();
        res.status(200).json({ success: true, message: 'تم حذف الموظف بنجاح' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateStaffMember = async (req, res) => {
    try {
        const department = await Department.findById(req.params.deptId);
        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        const staffMember = department.staff.id(req.params.staffId);
        if (!staffMember) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }
        const { roleInDepartment, onDuty } = req.body;
        if (roleInDepartment) staffMember.roleInDepartment = roleInDepartment;
        if (typeof onDuty === 'boolean') staffMember.onDuty = onDuty;
        await department.save();
        res.status(200).json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateHospitalStatus = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        let status = await HospitalStatus.findOne({ hospital: hospitalId });
        if (!status) {
            status = await HospitalStatus.create({ hospital: hospitalId, ...req.body });
        } else {
            status.isERAvailable = req.body.isERAvailable;
            status.availableBeds = req.body.availableBeds;
            await status.save();
        }
        res.status(200).json({ success: true, data: status });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getPatientLog = async (req, res) => {
    try {
        const patients = await Patient.find({ assignedHospital: req.user.id }).populate('createdBy', 'fullName');
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getHospitalStatusesForParamedic = async (req, res) => {
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
                isERAvailable: status ? status.isERAvailable : false,
                availableBeds: status ? status.availableBeds : {}
            };
        });

        res.status(200).json({ success: true, data: combinedData });
    } catch (error) {
        console.error("Error fetching hospital statuses for paramedic:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};