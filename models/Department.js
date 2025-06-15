// File: models/Department.js
const mongoose = require('mongoose');

const StaffMemberSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  roleInDepartment: {
    type: String,
    enum: ['رئيس قسم', 'مناوب', 'تحت الطلب', 'أخصائي'],
    required: true,
  },
  onDuty: {
    type: Boolean,
    default: true,
  }
});

const DepartmentSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a department name'],
    trim: true,
  },
  icon: {
    type: String,
    default: 'hospital-box-outline',
  },
  isAvailable: {
      type: Boolean,
      default: true
  },
  staff: [StaffMemberSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

DepartmentSchema.virtual('activeStaffCount').get(function() {
  return this.staff.filter(member => member.onDuty).length;
});

module.exports = mongoose.model('Department', DepartmentSchema);