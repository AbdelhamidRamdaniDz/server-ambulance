const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override'); // <-- 1. استيراد المكتبة
const connectDB = require('./config/db');

dotenv.config();
connectDB();



// استيراد جميع المسارات
const authRoutes = require('./routes/authRoutes');
const adminApiRoutes = require('./routes/adminRoutes');
const hospitalApiRoutes = require('./routes/hospitalRoutes');
const patientApiRoutes = require('./routes/patientRoutes');
const requestApiRoutes = require('./routes/requestRoutes');
const adminViewRoutes = require('./routes/adminViewRoutes');
const hospitalViewRoutes = require('./routes/hospitalViewRoutes');
const paramedicRoutes = require('./routes/paramedicRoutes');
const statusRoutes = require('./routes/statusRoutes');
const app = express();

// إعداد Middlewares
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));

// --- 2. تفعيل method-override ---
// هذا السطر يبحث عن `?_method=DELETE` في الرابط ويحول الطلب
app.use(methodOverride('_method'));


// تركيب المسارات
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminApiRoutes);
app.use('/api/hospitals', hospitalApiRoutes);
app.use('/api/patients', patientApiRoutes);
app.use('/api/requests', requestApiRoutes);
// app.use('/admin', adminViewRoutes);
// app.use('/hospital-panel', hospitalViewRoutes);
app.use('/api/hospitals', hospitalApiRoutes);
app.use('/api/paramedic', paramedicRoutes);
app.use('/api/status', statusRoutes);
// مسارات الواجهة الرئيسية
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.render('login'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));
