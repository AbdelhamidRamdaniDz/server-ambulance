const HospitalStatus = require('../models/HospitalStatus');

exports.getAllHospitalStatuses = async (req, res) => {
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

exports.updateMyHospitalStatus = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    let status = await HospitalStatus.findOne({ hospital: hospitalId });

    if (!status) {
      status = await HospitalStatus.create({ hospital: hospitalId, ...req.body });
    } else {
      status = await HospitalStatus.findByIdAndUpdate(status._id, req.body, {
        new: true, runValidators: true
      });
    }
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};