const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

const SuperAdmin = require('./models/SuperAdmin');
const Doctor = require('./models/Doctor');
const Hospital = require('./models/Hospital');
const Patient = require('./models/Patient');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {});

const importData = async () => {
  try {
    await SuperAdmin.deleteMany();
    await Doctor.deleteMany();
    await Hospital.deleteMany();
    await Patient.deleteMany();

    await SuperAdmin.create({
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
    });

    console.log('Default Super Admin created...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await SuperAdmin.deleteMany();
    await Doctor.deleteMany();
    await Hospital.deleteMany();
    await Patient.deleteMany();
    console.log('All Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
