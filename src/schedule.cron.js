// config/agenda.js
const Agenda = require("agenda");
const path = require("path");


const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URI,
    collection: "agendaJobs",
  },
  processEvery: "1 minute",
  maxConcurrency: 20,
});

const agendaAutoMode = new Agenda({
  db: {
    address: process.env.MONGODB_URI,
    collection: "agendaJobsAutoMode",
  },
  processEvery: "1 minute",
  maxConcurrency: 20,
});

// ======= Logging Events =======
agenda.on("start", (job) => {
  console.log(`🚀 Job [${job.attrs.name}] is starting...`);
});

agenda.on("complete", (job) => {
  console.log(`✅ Job [${job.attrs.name}] completed successfully`);
});

agenda.on("fail", (err, job) => {
  console.error(`❌ Job [${job.attrs.name}] failed: ${err.message}`);
});

if (agendaAutoMode) { // Kiểm tra xem nó có được định nghĩa không
  agendaAutoMode.on("start", (job) => {
    console.log(`🚀 AUTO_MODE_CRON Start: Job [${job.attrs.name}], ScheduleID: ${job.attrs.data ? job.attrs.data.scheduleId : 'N/A'}, DeviceID: ${job.attrs.data ? job.attrs.data.deviceId : 'N/A'}`);
  });
  agendaAutoMode.on("complete", (job) => {
    console.log(`✅ AUTO_MODE_CRON Complete: Job [${job.attrs.name}], ScheduleID: ${job.attrs.data ? job.attrs.data.scheduleId : 'N/A'}, DeviceID: ${job.attrs.data ? job.attrs.data.deviceId : 'N/A'}`);
  });
  agendaAutoMode.on("fail", (err, job) => {
    console.error(`❌ AUTO_MODE_CRON Fail: Job [${job.attrs.name}], ScheduleID: ${job.attrs.data ? job.attrs.data.scheduleId : 'N/A'}, DeviceID: ${job.attrs.data ? job.attrs.data.deviceId : 'N/A'}. Error: ${err.message}`, err);
  });
}


// ======= Start Agenda =======
const initAgenda = async () => {
  await agenda.start();
  console.log("📅 Agenda started & ready to process jobs");
  const jobs = await agenda.jobs({});
};

const initAgendaAutoMode = async () => {
  await agendaAutoMode.start();
  console.log("📅 Agenda Auto Mode started & ready to process jobs");
  const jobs = await agendaAutoMode.jobs({});
};



const clearJobs = async () => {
  await agenda.cancel({});
  console.log("🔄 All jobs cleared");
};

const clearJobsAutoMode = async () => {
  await agendaAutoMode.cancel({});
  console.log("🔄 All auto mode jobs cleared");
};

module.exports = {
  initAgenda,
  agenda,
  clearJobs,
  initAgendaAutoMode,
  agendaAutoMode,
  clearJobsAutoMode,
};  