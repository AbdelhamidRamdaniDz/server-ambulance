const Department = require('../models/Department');
const HospitalStatus = require('../models/HospitalStatus');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Create a new Doctor associated with the logged-in hospital
// @route   POST /api/hospitals/doctors
exports.createDoctor = async (req, res) => {
    try {
        const { fullName, specialty, nationalCode, phone } = req.body;
        
        const doctorData = {
            fullName,
            specialty,
            nationalCode,
            phone,
            hospital: req.user.id
        };

        await Doctor.create(doctorData);
        
        res.redirect('/hospital-panel/create-doctor?success=true');

    } catch (error) {
        res.redirect(`/hospital-panel/create-doctor?error=${encodeURIComponent(error.message)}`);
    }
};

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
        await Department.create(req.body);
        res.redirect('/hospital-panel/departments');
    } catch (error) {
        res.redirect(`/hospital-panel/departments?error=${encodeURIComponent(error.message)}`);
    }
};

// @desc    Update a specific department's details
// @route   PUT /api/hospitals/departments/:id
exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).send('Department not found or not authorized');
        }

        const { name, description, icon, isAvailable, beds, staff } = req.body;
        
        department.name = name || department.name;
        department.description = description || department.description;
        department.icon = icon || department.icon;
        department.isAvailable = isAvailable === 'true';
        if (beds) {
            department.beds.total = beds.total || department.beds.total;
            department.beds.occupied = beds.occupied || department.beds.occupied;
        }

        if (staff && Array.isArray(staff)) {
            staff.forEach(staffUpdate => {
                const member = department.staff.id(staffUpdate.staffId);
                if (member) {
                    member.onDuty = staffUpdate.onDuty === 'true';
                }
            });
        }
        
        await department.save();
        res.redirect(`/hospital-panel/departments/${req.params.id}`);

    } catch (error) {
        res.redirect(`/hospital-panel/departments/${req.params.id}?error=${encodeURIComponent(error.message)}`);
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
        res.redirect('/hospital-panel/departments');
    } catch (error) {
        res.redirect(`/hospital-panel/departments?error=${encodeURIComponent(error.message)}`);
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
        res.redirect('/hospital-panel/status');
    } catch (error) {
         res.redirect(`/hospital-panel/status?error=${encodeURIComponent(error.message)}`);
    }
};

// @desc    Get the patient log for the hospital
// @route   GET /api/hospitals/patient-log
// @access  Private (Hospital)
exports.getPatientLog = async (req, res) => {
    try {
        const patients = await Patient.find({ assignedHospital: req.user.id })
            .populate('createdBy', 'firstName lastName');
        res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};


// @desc    Remove a staff member from a department
// @route   DELETE /api/hospitals/departments/:deptId/staff/:staffId
exports.removeStaffFromDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.deptId);

        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).send('Department not found or not authorized');
        }

        department.staff.pull({ _id: req.params.staffId });
        
        await department.save();

        res.redirect(`/hospital-panel/departments/${req.params.deptId}`);
    } catch (error) {
        res.redirect(`/hospital-panel/departments/${req.params.deptId}?error=${encodeURIComponent(error.message)}`);
    }
};

// @desc    Remove a staff member from a department
// @route   DELETE /api/hospitals/departments/:deptId/staff/:staffId
exports.removeStaffFromDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.deptId);

        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).send('Department not found or not authorized');
        }

        // إيجاد وحذف الموظف من مصفوفة الطاقم
        department.staff.pull({ _id: req.params.staffId });
        
        await department.save();

        res.redirect(`/hospital-panel/departments/${req.params.deptId}`);
    } catch (error) {
        res.redirect(`/hospital-panel/departments/${req.params.deptId}?error=${encodeURIComponent(error.message)}`);
    }
};