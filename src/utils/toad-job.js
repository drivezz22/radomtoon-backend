const { AsyncTask, SimpleIntervalJob } = require("toad-scheduler");
const { checkDeadline } = require("./check-deadline-scheduler");

const task = new AsyncTask(
  "check deadline",
  () => {
    checkDeadline();
  },
  (err) => {
    console.error(err);
  }
);

module.exports.checkDeadlineJob = new SimpleIntervalJob({ hours: 3 }, task);
