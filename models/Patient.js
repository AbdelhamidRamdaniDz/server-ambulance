const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  medicalHistory: {
    allergies: [String],
    chronicConditions: [String],
  },
  currentCondition: { type: String, required: true },
  bloodType: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paramedic',
    required: true,
  },
  assignedHospital: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hospital' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'treated', 'rejected'], 
    default: 'pending' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);