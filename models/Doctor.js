// File: models/Doctor.js
const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, 'Please add a full name'] 
  },
  specialty: { 
    type: String, 
    required: [true, 'Please add a specialty'] 
  },
  nationalCode: { 
    type: String, 
    required: [true, 'Please add a national code'],
    unique: true 
  },
  phone: {
    type: String,
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
