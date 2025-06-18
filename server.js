const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // <-- استيراد المكتبة
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const authRoutes = require('./routes/authRoutes');
const adminApiRoutes = require('./routes/adminRoutes');
const hospitalApiRoutes = require('./routes/hospitalRoutes');
const patientApiRoutes = require('./routes/patientRoutes');
const requestApiRoutes = require('./routes/requestRoutes');
const adminViewRoutes = require('./routes/adminViewRoutes');
const hospitalViewRoutes = require('./routes/hospitalViewRoutes');

const app = express();

// إعداد Middlewares
app.set('view engine', 'ejs');
app.use(express.static('public')); 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser()); // <-- تفعيل قارئ الكوكيز
app.use(cors());

// تركيب المسارات
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminApiRoutes);
app.use('/api/hospitals', hospitalApiRoutes);
app.use('/api/patients', patientApiRoutes);
app.use('/api/requests', requestApiRoutes);
app.use('/admin', adminViewRoutes);
app.use('/hospital-panel', hospitalViewRoutes);

// مسارات الواجهة الرئيسية
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));
