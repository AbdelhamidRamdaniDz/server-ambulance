// File: models/Hospital.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a hospital name'] },
  email: { type: String, required: [true, 'Please add an email'], unique: true },
  password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false },
  role: { type: String, default: 'hospital' }
  // Add other hospital-specific fields like location here
}, { timestamps: true });

HospitalSchema.pre('save', async function(next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

HospitalSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: 'hospital' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

HospitalSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Hospital', HospitalSchema);
