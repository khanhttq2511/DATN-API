const mqttService = require("../services/mqtt.service");
const deviceService = require("../services/device.service");
const sensorService = require("../services/sensor.service");
const roomService = require("../services/room.service");
const { sendMessageToTopic } = require('../utils');


require('dotenv').config();
const MQTT_CONFIG = {
  host: process.env.MQTT_HOST || "6550ae3976cb4c62a64fc781224785da.s1.eu.hivemq.cloud", // Broker miễn phí để test
  port: process.env.MQTT_PORT || 8883,
  protocol: "mqtts",
  clientId: `mqtt_${Math.random().toString(16).substr(2, 8)}`,
  username: process.env.MQTT_USERNAME, // Nếu cần
  password: process.env.MQTT_PASSWORD, // Nếu cần
  keepalive: 60,
  reconnectPeriod: 5000, // Thêm tùy chọn kết nối lại
  connectTimeout: 30000, // Tăng thời gian timeout
};
console.log(MQTT_CONFIG);
module.exports = MQTT_CONFIG;

const setupMQTT = (app) => {
  mqttService.connect(
    MQTT_CONFIG,
    (client) => {
      console.log("🚀 Kết nối MQTT thành công!");


      mqttService.subscribe("esp32/status", (err) => {
        if (err) {
          console.error("❌ Lỗi khi đăng ký topic esp32/status:", err);
        } else {
          console.log("✅ Đăng ký topic esp32/status thành công");
        }
      });

      mqttService.subscribe("devices-up", (err) => {
        if (err) {
          console.error("❌ Lỗi khi đăng ký topic devices:", err);
        } else {
          console.log("✅ Đăng ký topic devices-up thành công");
        }
      });

      mqttService.subscribe("esp32/automode-change-up", (err) => {
        if (err) {
          console.error("❌ Lỗi khi đăng ký topic esp32/automode-change-up:", err);
        } else {
          console.log("✅ Đăng ký topic esp32/automode-change-up thành công");
        }
      });

      mqttService.subscribe("connected", (err) => {
        if (err) {
          console.error("❌ Lỗi khi đăng ký topic connected:", err);
        } else {
          console.log("✅ Đăng ký topic connected thành công");
        }
      });

      client.on("message", async (topic, message) => {
        console.log(`📩 Nhận message từ topic ${topic}:`, message.toString());

        if (topic === "connected") {
          const formatToPub = await deviceService.updateDeviceAfterConnected(
            message.toString()
          );
          if (!formatToPub) return;

          client.publish(message.toString(), JSON.stringify(formatToPub));
        }
        if(topic === "devices-up") {
          if (!message.toString()) return;
          
          const parsedSensorsData = JSON.parse(message.toString());
          const roomId = parsedSensorsData.roomId;
          const type = parsedSensorsData.type;
          const status = parsedSensorsData.status === true ? 'active' : 'inactive';
          const roomType = parsedSensorsData.roomType;

          await deviceService.updateDeviceStatusAfterConnected(
            roomId,
            type,
            status,
            roomType
          );
          global.io.emit('newDeviceStatus', parsedSensorsData);
          // client.publish(message.toString(), JSON.stringify(formatToPub));
        }
        if (topic === "esp32/status") {
          if (!message.toString()) return;
          const parsedSensorsData = JSON.parse(message.toString());
          const orgId = parsedSensorsData.orgId;
          const roomId = parsedSensorsData.roomId;
          const isActive = parsedSensorsData.isActive;
          const roomType = parsedSensorsData.roomType;

          // Wait for both updates to complete
          await Promise.all([
            roomService.updateRoomActive(roomId, isActive, orgId),
            deviceService.updateDeviceActive(roomId, isActive, orgId),
            sensorService.updateSensorActive(roomId, isActive, orgId)
          ]);
          
          if (isActive === true) {
            const devices = await deviceService.getAllDevicesByRoomId(roomId);
            const room = await roomService.getRoomById(orgId, roomId);
            const roommode = room.isAuto;
            for (const device of devices) {
              
                let formattoPub = {
                  roomId: device.roomId,
                  type: device.type,
                  status: device.status === 'active' ,
                  roomType: roomType
                }
                //format send topic 
                const topic = `devices-down`;
                sendMessageToTopic(topic, formattoPub);;
              
            }
            let formattoPub = {
              roomId: roomId,
              isAuto: roommode,
              orgId: orgId
            }
            const topic = `esp32/automode-change-down`;
            sendMessageToTopic(topic, formattoPub);

          }
          global.io.emit('esp32Status', "Cập nhật trạng thái esp32 thành công");
        }

        if (topic === "esp32/automode-change-up") {
          if (!message.toString()) return;
          const parsedSensorsData = JSON.parse(message.toString());
          const orgId = parsedSensorsData.orgId;
          const roomId = parsedSensorsData.roomId;
          const isAuto = parsedSensorsData.isAuto;
          // Wait for both updates to complete
          await Promise.all([
            roomService.changeAutomode(isAuto, orgId, roomId),
          ]);
          
          global.io.emit('automode-change-up', "Cập nhật chế độ esp32 thành công");
        }

      });
    },
    (error) => {
      console.error("❌ Lỗi khi kết nối MQTT:", error);
    }
  );

  // Set MQTT service for use in routes
  app.set("mqttService", mqttService);

  return mqttService;
};

module.exports = { setupMQTT };