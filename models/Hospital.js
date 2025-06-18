const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a hospital name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false 
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  availabilityStatus: { 
    type: String, 
    enum: ['available', 'limited', 'unavailable'], 
    default: 'available' 
  },
  equipment: [String],
  specialties: [String]
}, { timestamps: true });

// تشفير كلمة المرور قبل الحفظ
HospitalSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// إنشاء توكن JWT
HospitalSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: 'hospital' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// التحقق من كلمة المرور
HospitalSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Hospital', HospitalSchema);
