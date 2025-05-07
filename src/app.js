const express = require('express');
const cors = require('cors');
const http = require('http');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { setupMQTT } = require('./config/mqtt');
const setupSocket = require('./config/socket');
require('dotenv').config();

const userRoutes = require('./routes/user.routes.js');
const roomRoutes = require('./routes/room.routes.js');
const deviceRoutes = require('./routes/device.routes.js');
const sensorRoutes = require('./routes/sensor.routes.js');
const mediaRoutes = require('./routes/media.routes.js');
const contactRoutes = require('./routes/contact.routes.js');
const organizationRoutes = require('./routes/organization.routes.js');
const historyRoutes = require('./routes/history.routes.js');
const scheduleRoutes = require('./routes/schedule.routes.js');
const { initAgenda, agenda } = require('./schedule.cron.js');
const scheduleService = require('./services/schedule.service');
const notifyRoutes = require('./routes/notify.routes.js');
const { ServerApiVersion } = require('mongodb');
const app = express();
const server = http.createServer(app);


// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://velthome.online',
      'https://api.velthome.online',
      'https://smarthome-henna.vercel.app', 
      'https://www.smarthome-henna.vercel.app',
      'http://localhost:3001',
      'http://localhost:3000'
    ];
    // Cho phép các yêu cầu không có nguồn gốc (như ứng dụng di động, yêu cầu curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log("Nguồn gốc bị chặn:", origin);
      return callback(null, true); // Tạm thời cho phép tất cả các nguồn để gỡ lỗi
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept']
}));

// Thêm xử lý OPTIONS preflight cho tất cả các routes
app.options('*', cors());

// Thêm headers cụ thể cho tất cả các responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

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
app.use('/api/schedules', scheduleRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/contact', contactRoutes);


const io = setupSocket(server);
global.io = io;
setupMQTT(app);
initAgenda();
app.set('agenda', agenda);


    // Start agenda scheduler
  agenda.define("executeSchedule", async (job) => {
      const now = new Date();
      const scheduleData = job.attrs.data;
      const executeAt = new Date(scheduleData.executeAt);

      // Chỉ thực thi nếu đã đến hoặc qua thời gian executeAt
      if (now >= executeAt) {
        await scheduleService.executeSchedule({scheduleId: scheduleData.scheduleId});
      } else {
        console.log(
          `Job ${job.attrs.name} scheduled for ${executeAt}, skipping execution`
        );
      }
    });

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
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
