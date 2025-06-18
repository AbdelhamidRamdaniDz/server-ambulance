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
  description: { // <-- تمت إضافة الوصف
    type: String,
    maxlength: 500
  },
  icon: {
    type: String,
    default: 'hospital-box-outline',
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  beds: { // <-- تمت إضافة معلومات الأسرة
    total: { type: Number, default: 0, min: 0 },
    occupied: { type: Number, default: 0, min: 0 }
  },
  staff: [StaffMemberSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// الخصائص الافتراضية لحساب الأعداد تلقائيًا
DepartmentSchema.virtual('activeStaffCount').get(function() {
  return this.staff.filter(member => member.onDuty).length;
});

DepartmentSchema.virtual('availableBeds').get(function() {
  return this.beds.total - this.beds.occupied;
});

module.exports = mongoose.model('Department', DepartmentSchema);
