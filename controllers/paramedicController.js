const HospitalStatus = require('../models/HospitalStatus');

exports.getHospitalStatuses = async (req, res) => {
  try {
    const statuses = await HospitalStatus.find().populate({
        path: 'hospital',
        select: 'name location'
    });
    res.status(200).json({ success: true, data: statuses });
  } catch (error) {
     res.status(500).json({ success: false, error: 'Server Error' });
  }
};