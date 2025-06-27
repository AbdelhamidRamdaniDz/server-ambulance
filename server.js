const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const authRoutes = require('./routes/authRoutes');
const adminApiRoutes = require('./routes/adminRoutes');
const hospitalApiRoutes = require('./routes/hospitalRoutes');
const patientApiRoutes = require('./routes/patientRoutes');
const requestApiRoutes = require('./routes/requestRoutes');
const paramedicRoutes = require('./routes/paramedicRoutes');
const statusRoutes = require('./routes/statusRoutes');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
  }));

app.use(methodOverride('_method'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminApiRoutes);
app.use('/api/hospitals', hospitalApiRoutes);
app.use('/api/patients', patientApiRoutes);
app.use('/api/requests', requestApiRoutes);
app.use('/api/hospitals', hospitalApiRoutes);
app.use('/api/paramedic', paramedicRoutes);
app.use('/api/status', statusRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));
