// @flow weak
const scheduler = require('node-schedule');

var schedule = function(seneca) {
  this._seneca = seneca;
  this._jobs = {};
}

/**
 * @api {get} schedule/create Create a daily schedule for a device
 * @apiVersion 1.0.0
 * @apiName create
 * @apiGroup Schedule
 *
 * @apiParam {String} DeviceID Unique device name.
 * @apiParam {Array} schedule An array containing objects with begin and end hour for an event.
 * @apiParam {String} beginTime Begin time - example: "13:00:00"
 * @apiParam {String} endTime End time - example "14:00:00"
 * @apiParam {Float} maxEnergy Maximum energy that should not be passed.
 *
 * @apiExample  Example usage:
 *{
 *    "DeviceID": "TestDevice",
 *    "schedule": [{
 *        "beginTime": "17:00:00",
 *        "endTime": "18:00:00"
 *    }],
 *    "maxEnergy": 1500.0
 *}
 */
schedule.prototype.create = function(args, done) {
  if (args.hasOwnProperty('DeviceID') == true &&
    args.hasOwnProperty('schedule') == true &&
    args.hasOwnProperty('maxEnergy') == true) {
    let len = args.schedule.length;
    let jobs = [];
    for (let i = 0; i < len; i++) {
      let beginJob = createJob(args.schedule[i].beginTime)
      jobs.push(beginJob)
      let endJob = createJob(args.schedule[i].endTime)
      jobs.push(endJob)
    }
    this._jobs[args.DeviceID] = jobs;
    done(null, {
      result: this._jobs,
      status: "OK"
    })
  } else {
    done(null, {
      result: 'Missing argumets!',
      status: "ERROR"
    })
  }
}

function createJob(time) {
  let timeArr = parceTimeData(time)
  console.log(timeArr)
  let rule = new scheduler.RecurrenceRule();
  rule.hour = timeArr.hour;
  rule.minute = timeArr.minute;
  rule.second = timeArr.second;
  return scheduler.scheduleJob(rule, function() {
    console.log(time);
  });
}

function parceTimeData(time) {
  if (typeof time === 'string') {
    let result = time.split(":");
    return {
      hour: result[0],
      minute: result[1],
      second: result[2]
    }
  }
}

module.exports = schedule;
