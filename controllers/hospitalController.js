const Department = require('../models/Department');
const HospitalStatus = require('../models/HospitalStatus');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Get all departments for the logged-in hospital
// @route   GET /api/hospitals/departments
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ hospital: req.user.id });
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create a new department
// @route   POST /api/hospitals/departments
exports.createDepartment = async (req, res) => {
    try {
        req.body.hospital = req.user.id;
        const department = await Department.create(req.body);
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Add a doctor to a department's staff
// @route   POST /api/hospitals/departments/:deptId/staff
exports.addStaffToDepartment = async (req, res) => {
    try {
        const { doctorId, roleInDepartment } = req.body;
        const department = await Department.findById(req.params.deptId);

        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).json({ success: false, error: 'Department not found or not authorized' });
        }
        
        department.staff.push({ doctor: doctorId, roleInDepartment });
        await department.save();
        res.status(200).json({ success: true, data: department });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Update hospital status (beds, ER availability)
// @route   PUT /api/hospitals/status
exports.updateHospitalStatus = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        let status = await HospitalStatus.findOne({ hospital: hospitalId });

        if (!status) {
            status = await HospitalStatus.create({ hospital: hospitalId, ...req.body });
        } else {
            status = await HospitalStatus.findByIdAndUpdate(status._id, req.body, {
                new: true, runValidators: true
            });
        }
        res.status(200).json({ success: true, data: status });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get the patient log for the hospital
// @route   GET /api/hospitals/patient-log
exports.getPatientLog = async (req, res) => {
    try {
        const patients = await Patient.find({ assignedHospital: req.user.id })
            .populate('createdBy', 'firstName lastName');
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
