const Department = require('../models/Department')
const HospitalStatus = require('../models/HospitalStatus')
const Patient = require('../models/Patient')
const Doctor = require('../models/Doctor')

exports.createDoctor = async (req, res) => {
    try {
        const { fullName, specialty, nationalCode, phone } = req.body
        const doctorData = { fullName, specialty, nationalCode, phone, hospital: req.user.id }
        const doctor = await Doctor.create(doctorData)
        res.status(201).json({ success: true, data: doctor })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'فشل في الإضافة. الرقم الوطني الذي أدخلته مسجل مسبقًا.' })
        }
        res.status(400).json({ success: false, message: error.message })
    }
}

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ hospital: req.user.id }).select('_id fullName specialty nationalCode phone email')
        res.status(200).json({ success: true, data: doctors })
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب الأطباء' })
    }
}

exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ hospital: req.user.id })
            .populate({
                path: 'staff.doctor',
                select: 'fullName'
            })
        res.status(200).json({ success: true, data: departments })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' })
    }
}

exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('staff.doctor', 'fullName phone email')
        if (!department) {
            return res.status(404).json({ success: false, message: 'القسم غير موجود' })
        }
        res.status(200).json({ success: true, data: department })
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في الخادم' })
    }
}

exports.createDepartment = async (req, res) => {
    try {
        const { name, description, icon, color, isAvailable, beds } = req.body
        const departmentData = {
            hospital: req.user.id,
            name,
            description,
            icon,
            color,
            isAvailable,
            beds
        }
        const department = await Department.create(departmentData)
        res.status(201).json({ success: true, data: department })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

exports.updateDepartment = async (req, res) => {
    try {
        let department = await Department.findById(req.params.id)
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' })
        }
        if (department.hospital.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'User not authorized' })
        }
        department = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({ success: true, data: department })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' })
    }
}

exports.addStaffToDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.deptId)
        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Department not found' })
        }
        const { doctorId, roleInDepartment, onDuty } = req.body
        if (department.staff.some(member => member.doctor.toString() === doctorId)) {
            return res.status(400).json({ success: false, message: 'هذا الطبيب مضاف بالفعل إلى هذا القسم.' })
        }
        if (roleInDepartment === 'رئيس قسم' && department.staff.some(m => m.roleInDepartment === 'رئيس قسم')) {
            return res.status(400).json({ success: false, message: 'لا يمكن تعيين أكثر من رئيس قسم واحد.' })
        }
        department.staff.push({ doctor: doctorId, roleInDepartment, onDuty: onDuty || false })
        await department.save()
        res.status(201).json({ success: true, data: department })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

exports.removeStaffFromDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.deptId)
        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Department not found' })
        }
        department.staff.pull({ _id: req.params.staffId })
        await department.save()
        res.status(200).json({ success: true, message: 'تم حذف الموظف بنجاح' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' })
    }
}

exports.updateStaffMember = async (req, res) => {
    try {
        const department = await Department.findById(req.params.deptId)
        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Department not found' })
        }
        const staffMember = department.staff.id(req.params.staffId)
        if (!staffMember) {
            return res.status(404).json({ success: false, message: 'Staff member not found' })
        }
        const { roleInDepartment, onDuty } = req.body
        if (roleInDepartment) staffMember.roleInDepartment = roleInDepartment
        if (typeof onDuty === 'boolean') staffMember.onDuty = onDuty
        await department.save()
        res.status(200).json({ success: true, data: department })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' })
    }
}

exports.updateHospitalStatus = async (req, res) => {
    try {
        const hospitalId = req.user.id
        let status = await HospitalStatus.findOne({ hospital: hospitalId })
        if (!status) {
            status = await HospitalStatus.create({ hospital: hospitalId, ...req.body })
        } else {
            status = await HospitalStatus.findByIdAndUpdate(status._id, req.body, { new: true, runValidators: true })
        }
        res.status(200).json({ success: true, data: status })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' })
    }
}

exports.getPatientLog = async (req, res) => {
    try {
        const patients = await Patient.find({ assignedHospital: req.user.id }).populate('createdBy', 'fullName')
        res.status(200).json({ success: true, count: patients.length, data: patients })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' })
    }
}

exports.getHospitalStatusesForParamedic = async (req, res) => {
    try {
        const statuses = await HospitalStatus.find().populate({
            path: 'hospital',
            select: 'name location'
        })
        res.status(200).json({ success: true, data: statuses })
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' })
    }
}



// const Department = require('../models/Department');
// const HospitalStatus = require('../models/HospitalStatus');
// const Patient = require('../models/Patient');
// const Doctor = require('../models/Doctor');

// exports.createDoctor = async (req, res) => {
//     try {
//         const { fullName, specialty, nationalCode, phone } = req.body;
//         const doctorData = {
//             fullName,
//             specialty,
//             nationalCode,
//             phone,
//             hospital: req.user.id
//         };
//         const doctor = await Doctor.create(doctorData);
//         res.status(201).json({ success: true, data: doctor });
//     } catch (error) {
//         console.error('Error creating doctor:', error);
//         if (error.code === 11000) {
//             return res.status(400).json({ success: false, message: 'فشل في الإضافة. الرقم الوطني الذي أدخلته مسجل مسبقًا.' });
//         }
//         res.status(400).json({ success: false, message: error.message });
//     }
// };

// exports.createDepartment = async (req, res) => {
//     try {
//         const { name, description, icon, color, isAvailable, beds } = req.body;      
//         const departmentData = {
//             hospital: req.user.id,
//             name,
//             description,
//             icon,
//             color,
//             isAvailable,
//             beds
//         };

//         const department = await Department.create(departmentData);
//         res.status(201).json({ success: true, data: department });

//     } catch (error) {
//         console.error('Error creating department:', error);
//         res.status(400).json({ success: false, message: error.message });
//     }
// };

// exports.updateDepartment = async (req, res) => {
//     try {
//         const department = await Department.findById(req.params.id);
//         if (!department) {
//             return res.status(404).json({ success: false, message: 'Department not found' });
//         }
//         if (department.hospital.toString() !== req.user.id) {
//             return res.status(403).json({ success: false, message: 'User not authorized to update this department' });
//         }
//         const { name, icon, color, isAvailable } = req.body;
//         if (name) department.name = name;
//         if (icon) department.icon = icon;
//         if (color) department.color = color;
//         if (typeof isAvailable === 'boolean') {
//             department.isAvailable = isAvailable;
//         }
//         const updatedDepartment = await department.save();
//         res.status(200).json({
//             success: true,
//             data: updatedDepartment
//         });
//     } catch (error) {
//         console.error('Error updating department:', error);
//         res.status(500).json({ success: false, message: 'Server Error' });
//     }
// };

// exports.addStaffToDepartment = async (req, res) => {
//     const { deptId } = req.params;
//     const { doctorId, roleInDepartment, onDuty } = req.body;
//     try {
//         const department = await Department.findById(deptId);
//         if (!department || department.hospital.toString() !== req.user.id) {
//             return res.status(404).json({ success: false, message: 'Department not found or not authorized' });
//         }
//         const isAlreadyStaff = department.staff.some(member => member.doctor.toString() === doctorId);
//         if (isAlreadyStaff) {
//             return res.status(400).json({ success: false, message: 'هذا الطبيب مضاف بالفعل إلى هذا القسم.' });
//         }
//         if (roleInDepartment === 'رئيس قسم') {
//             const hasHeadOfDepartment = department.staff.some(member => member.roleInDepartment === 'رئيس قسم');
//             if (hasHeadOfDepartment) {
//                 return res.status(400).json({ success: false, message: 'لا يمكن تعيين أكثر من رئيس قسم واحد.' });
//             }
//         }
//         department.staff.push({ doctor: doctorId, roleInDepartment, onDuty: onDuty || false });
//         await department.save();
//         res.status(201).json({
//             success: true,
//             data: department
//         });
//     } catch (error) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// };

// exports.removeStaffFromDepartment = async (req, res) => {
//     try {
//         const department = await Department.findById(req.params.deptId);
//         if (!department || department.hospital.toString() !== req.user.id) {
//             return res.status(404).json({ success: false, message: 'Department not found or not authorized' });
//         }
//         department.staff.pull({ _id: req.params.staffId });
//         await department.save();
//         res.status(200).json({ success: true, message: 'تم حذف الموظف بنجاح' });
//     } catch (error) {
//         console.error('Error removing staff:', error);
//         res.status(500).json({ success: false, message: 'خطأ في الخادم' });
//     }
// };

// exports.updateStaffMember = async (req, res) => {
//     try {
//         const department = await Department.findById(req.params.deptId);
//         if (!department || department.hospital.toString() !== req.user.id) {
//             return res.status(404).json({ success: false, message: 'Department not found or not authorized' });
//         }
//         const staffMember = department.staff.id(req.params.staffId);
//         if (!staffMember) {
//             return res.status(404).json({ success: false, message: 'Staff member not found' });
//         }
//         const { roleInDepartment, onDuty } = req.body;
//         if (roleInDepartment) {
//             staffMember.roleInDepartment = roleInDepartment;
//         }
//         if (typeof onDuty === 'boolean') {
//             staffMember.onDuty = onDuty;
//         }
//         await department.save();
//         res.status(200).json({
//             success: true,
//             data: department
//         });
//     } catch (error) {
//         console.error('Error updating staff member:', error);
//         res.status(500).json({ success: false, message: 'خطأ في الخادم' });
//     }
// };

// exports.getPatientLog = async (req, res) => {
//     try {
//         const patients = await Patient.find({ assignedHospital: req.user.id })
//             .populate('createdBy', 'fullName');
//         res.status(200).json({ success: true, count: patients.length, data: patients });
//     } catch (error) {
//         res.status(500).json({ success: false, error: 'Server Error' });
//     }
// };

// exports.getHospitalStatusesForParamedic = async (req, res) => {
//     try {
//         const statuses = await HospitalStatus.find().populate({
//             path: 'hospital',
//             select: 'name location'
//         });
//         res.status(200).json({ success: true, data: statuses });
//     } catch (error) {
//         res.status(500).json({ success: false, error: 'Server Error' });
//     }
// };

// exports.updateStaffMember = async (req, res) => {
//     try {
//         const department = await Department.findById(req.params.deptId);
//         if (!department || department.hospital.toString() !== req.user.id) {
//             return res.status(404).json({ success: false, message: 'Department not found or not authorized' });
//         }
//         const staffMember = department.staff.id(req.params.staffId);
//         if (!staffMember) {
//             return res.status(404).json({ success: false, message: 'Staff member not found' });
//         }
//         const { roleInDepartment, onDuty } = req.body;
//         if (roleInDepartment) {
//             staffMember.roleInDepartment = roleInDepartment;
//         }
//         if (typeof onDuty === 'boolean') {
//             staffMember.onDuty = onDuty;
//         }
//         await department.save();
//         res.status(200).json({
//             success: true,
//             data: department
//         });
//     } catch (error) {
//         console.error('Error updating staff member:', error);
//         res.status(500).json({ success: false, message: 'خطأ في الخادم' });
//     }
// };

// exports.getDepartmentById = async (req, res) => {
//     try {
//         const department = await Department.findById(req.params.id)
//             .populate('staff.doctor', 'fullName phone email');
//         if (!department) {
//             return res.status(404).json({ success: false, message: 'القسم غير موجود' });
//         }
//         res.status(200).json(department);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: 'خطأ في الخادم' });
//     }
// };

// exports.getAllDoctors = async (req, res) => {
//     try {
//         const doctors = await Doctor.find({ hospital: req.user.id })
//             .select('_id fullName specialty nationalCode phone email');
            
//         res.status(200).json({ success: true, data: doctors });
//     } catch (err) {
//         console.error('Error fetching doctors:', err);
//         res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب الأطباء' });
//     }
// };

// exports.getDepartmentById = async (req, res) => {
//     try {
//         const department = await Department.findById(req.params.id)
//             .populate('staff.doctor', 'fullName email phone');
//         if (!department) {
//             return res.status(404).json({ success: false, message: 'القسم غير موجود' });
//         }
//         res.status(200).json(department);
//     } catch (err) {
//         console.error('خطأ في جلب القسم:', err);
//         res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب بيانات القسم' });
//     }
// };

// exports.updateHospitalStatus = async (req, res) => {
//     try {
//         const hospitalId = req.user.id;
//         let status = await HospitalStatus.findOne({ hospital: hospitalId });
//         if (!status) {
//             status = await HospitalStatus.create({ hospital: hospitalId, ...req.body });
//         } else {
//             status = await HospitalStatus.findByIdAndUpdate(status._id, req.body, {
//                 new: true,
//                 runValidators: true
//             });
//         }
//         res.status(200).json({ success: true, data: status });
//     } catch (error) {
//         console.error('Error updating hospital status:', error);
//         res.status(500).json({ success: false, message: 'Server Error' });
//     }
// };

// exports.getDepartments = async (req, res) => {
//     try {
//         const departments = await Department.find({ hospital: req.user.id })
//             .populate({
//                 path: 'staff.doctor',
//                 select: 'fullName'
//             });
//         res.status(200).json({ success: true, data: departments });
//     } catch (error) {
//         console.error("Error in getDepartments:", error);
//         res.status(500).json({ success: false, error: 'Server Error' });
//     }
// };