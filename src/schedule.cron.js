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


// ======= Start Agenda =======
const initAgenda = async () => {
  await agenda.start();
  console.log("📅 Agenda started & ready to process jobs");
  const jobs = await agenda.jobs({});
  // console.log("jobs", jobs);
};



const clearJobs = async () => {
  await agenda.cancel({});
  console.log("🔄 All jobs cleared");
};

module.exports = {
  initAgenda,
  agenda,
  clearJobs,
};  