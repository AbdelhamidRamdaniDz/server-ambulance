const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ParamedicSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email' ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false 
  },
  nationalId: { type: String, unique: true, required: true },
  assignedAmbulance: { type: String },
  role: {
      type: String,
      default: 'paramedic'
  }
}, { timestamps: true });

// تشفير كلمة المرور قبل الحفظ
ParamedicSchema.pre('save', async function(next) {
  if (!this.isModified('password')) { next(); }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// إنشاء توكن JWT
ParamedicSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: 'paramedic' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// التحقق من كلمة المرور
ParamedicSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Paramedic', ParamedicSchema);
