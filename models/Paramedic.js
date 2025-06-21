const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ParamedicSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, select: false },
  nationalId: { type: String, required: true, unique: true },
  associatedAmbulance: String,
  role: { type: String, default: 'paramedic' }
}, { timestamps: true });

ParamedicSchema.pre('save', async function(next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

ParamedicSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: 'paramedic' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

ParamedicSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Paramedic', ParamedicSchema);