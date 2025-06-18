const mongoose = require('mongoose');
// الأطباء ليس لديهم كلمة مرور خاصة بهم، بل يتم إدارتهم من قبل المستشفى
// إذا أردت لهم تسجيل دخول منفصل، يمكن إضافة نفس منطق تشفير كلمة المرور هنا

const DoctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  specialty: { type: String, required: true }, // تخصص الطبيب
  nationalId: { type: String, unique: true, required: true },
  // ربط الطبيب بالمستشفى الذي قام بإنشائه
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
