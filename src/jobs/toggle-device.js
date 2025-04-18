const toggleDevice = async (agenda) => {
    agenda.define("toggle-device", async (job) => {
      const { deviceId, action } = job.attrs.data;
      console.log(`⏰ [JOB] Device ${deviceId} → ${action}`);
      // TODO: Gửi lệnh MQTT hoặc API tới thiết bị tại đây
    });
  };
  
  module.exports = toggleDevice;