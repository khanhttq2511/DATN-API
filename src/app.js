const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { setupMQTT } = require('./config/mqtt');
require('dotenv').config();

const userRoutes = require('./routes/user.routes.js');
const roomRoutes = require('./routes/room.routes.js');
const deviceRoutes = require('./routes/device.routes.js');
const sensorRoutes = require('./routes/sensor.routes.js');
const mediaRoutes = require('./routes/media.routes.js');
const organizationRoutes = require('./routes/organization.routes.js');
const historyRoutes = require('./routes/history.routes.js');
// const addmemberRoutes = require('./routes/addmember.routes.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Nếu dùng body-parser

// Routes
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/history', historyRoutes);
// app.use('/api/addmember', addmemberRoutes);
setupMQTT(app);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/express-api')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));
console.log(process.env.MONGODB_URI);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
