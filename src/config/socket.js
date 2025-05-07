const { Server } = require('socket.io');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    const { roomId, organizationId, sensorType } = socket.handshake.query;

    console.log(`Client connected: Room ${roomId}, Org ${organizationId}, Sensor ${sensorType}`);

    // Join room for specific sensor
    socket.join(`sensor_${sensorType}_${roomId}`);

    // Handle sensor data updates
    socket.on('sensor_data', (data) => {
      // Broadcast to all clients in the room
      io.to(`sensor_${sensorType}_${roomId}`).emit(`sensor_update_${sensorType}_${roomId}`, {
        value: data.value,
        timestamp: new Date(),
        ...data
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: Room ${roomId}, Org ${organizationId}, Sensor ${sensorType}`);
    });

    // Handle sensor notifications
    socket.on('sensor_notification', async (data) => {
      // Save notification to database
      const notification = await saveNotificationToDb(data);
      
      // Emit to all connected clients in the organization
      io.to(data.organizationId).emit('new_notification', notification);
    });

    // Handle notification updates
    socket.on('notification_update', async (data) => {
      // Update notification in database
      await updateNotificationInDb(data.notificationId, data.updates);
      
      // Emit update to all connected clients
      io.emit('notification_update', data);
    });

    // Handle notification deletions
    socket.on('notification_delete', async (notificationId) => {
      // Delete notification from database
      await deleteNotificationFromDb(notificationId);
      
      // Emit deletion to all connected clients
      io.emit('notification_delete', notificationId);
    });
  });

  return io;
};

module.exports = setupSocket; 