const cron = require("node-cron");

module.exports.nodeCron = (cronTime, callback) => cron.schedule(cronTime, callback);
