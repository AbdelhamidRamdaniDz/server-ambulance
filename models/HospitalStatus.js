const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema({
  total: { type: Number, default: 0, min: 0 },
  occupied: { type: Number, default: 0, min: 0 }
});

const HospitalStatusSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    unique: true
  },
  isERAvailable: {
    type: Boolean,
    default: true
  },
  availableBeds: {
    ICU: BedSchema,
    emergency: BedSchema,
    general: BedSchema,
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

HospitalStatusSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('HospitalStatus', HospitalStatusSchema);
