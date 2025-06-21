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
  description: {
    type: String,
    maxlength: 500
  },
  icon: {
    type: String,
    default: 'hospital-box-outline',
  },
  color: {
    type: String,
    default: '#000000',
    validate: {
      validator: function(v) {
        return /^#[0-9A-Fa-f]{6}$/.test(v);
      },
      message: props => `${props.value} ليس كود لون صالح (مثل #FF0000)`
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  beds: {
    total: { type: Number, default: 0, min: 0 },
    occupied: { type: Number, default: 0, min: 0 }
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

DepartmentSchema.virtual('availableBeds').get(function() {
  return this.beds.total - this.beds.occupied;
});

module.exports = mongoose.model('Department', DepartmentSchema);
