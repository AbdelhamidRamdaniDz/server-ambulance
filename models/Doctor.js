const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DoctorSchema = new mongoose.Schema({
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
      default: 'doctor'
  }
}, { timestamps: true });

DoctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) { next(); }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

DoctorSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: 'doctor' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

DoctorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Doctor', DoctorSchema);
