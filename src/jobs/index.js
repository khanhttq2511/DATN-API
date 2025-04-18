const { loadJobs } = require("../schedule.cron");
const toggleDeviceJob = require("./toggle-device");
module.exports = async (agenda) => {
  await toggleDeviceJob(agenda);
};