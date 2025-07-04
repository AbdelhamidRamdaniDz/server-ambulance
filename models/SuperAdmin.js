const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SuperAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, default: 'super-admin' }
}, { timestamps: true });

SuperAdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

SuperAdminSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: 'super-admin' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

SuperAdminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);