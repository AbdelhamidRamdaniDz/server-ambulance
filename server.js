const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const hospitalViewRoutes = require('./routes/hospitalViewRoutes');

dotenv.config();

connectDB();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const patientRoutes = require('./routes/patientRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminViewRoutes = require('./routes/adminViewRoutes');

const app = express();


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); 

app.use(express.json());

app.use(cors());


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/requests', requestRoutes);
app.use('/admin', adminViewRoutes); 
app.use('/api/hospitals', hospitalRoutes);
app.use('/hospital-panel', hospitalViewRoutes); 
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running successfully...');
});
app.get('/login', (req, res) => {
  res.render('login');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));