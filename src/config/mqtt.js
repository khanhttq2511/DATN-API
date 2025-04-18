const mqttService = require("../services/mqtt.service");
const deviceService = require("../services/device.service");
const sensorService = require("../services/sensor.service");
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

      mqttService.subscribe("connected", (err) => {
        if (err) {
          console.error("❌ Lỗi khi đăng ký topic connected:", err);
        } else {
          console.log("✅ Đăng ký topic connected thành công");
        }
      });

      // mqttService.subscribe("esp32/status", (err) => {
      //   if (err) {
      //     console.error("❌ Lỗi khi đăng ký topic esp32/status:", err);
      //   } else {
      //     console.log("✅ Đăng ký topic esp32/status thành công");
      //   }
      // });

      mqttService.subscribe("devices-up", (err) => {
        if (err) {
          console.error("❌ Lỗi khi đăng ký topic devices:", err);
        } else {
          console.log("✅ Đăng ký topic devices thành công");
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
          console.log("parse", JSON.parse(message.toString()));

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
          console.log(message.toString())

          // client.publish(message.toString(), JSON.stringify(formatToPub));
        }
        // if (topic === "esp32/status") {
        //   if (!message.toString()) return;
        //   const parsedSensorsData = JSON.parse(message.toString());
        //   const orgId = parsedSensorsData.orgId;
        //   const roomId = parsedSensorsData.roomId;
        //   const data = parsedSensorsData.data;
        //   console.log("data", data);
        //   console.log("orgId", orgId);
        //   sensorService.updateSensorStatus(roomId, orgId, data);

        //   // client.publish(message.toString(), JSON.stringify(formatToPub));
        // }
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