// @flow weak
const scheduler = require('node-schedule');
var _jobs = []
var _seneca = null

var schedule = function(seneca) {
  _seneca = seneca;
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
    let name = args.DeviceID;
    for (let i = 0; i < len; i++) {
      let beginJob = createJob(args.DeviceID, args.schedule[i].beginTime, "On")
      jobs.push(beginJob)
      let endJob = createJob(args.DeviceID, args.schedule[i].endTime, "Off")
      jobs.push(endJob)
    }
    _jobs[args.DeviceID] = {jobs:jobs};
    console.log(_jobs)
    //SAVE TO MONGODB
    //SAVE JOB INDEX WITH SCHEDULE IN MONGO
    //MAKE SUBSCRIPTION
    done(null, {
      result: "Created daily schedule for " + args.DeviceID,
      status: "OK"
    })
  } else {
    done(null, {
      result: 'Missing argumets!',
      status: "ERROR"
    })
  }
}

function createJob(device, time, state) {
  console.log(time)
  let timeArr = parceTimeData(time)
  let rule = new scheduler.RecurrenceRule();
  rule.hour = timeArr.hour;
  rule.minute = timeArr.minute;
  rule.second = timeArr.second;
  return scheduler.scheduleJob(rule, function() {
    console.log(time);
    _seneca.act({
      role: "client",
      cmd: "sendCommand"
    }, {
      DeviceID: device,
      command: "state",
      params: {
        state: state
      }
    }, function(err, res) {
      if (err)
        console.log(err)
    });
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

/**
 * @api {get} schedule/remove Remove a daily schedule for a device
 * @apiVersion 1.0.0
 * @apiName remove
 * @apiGroup Schedule
 *
 * @apiParam {String} DeviceID Unique device name.
 *
 * @apiExample  Example usage:
 *{
 *    "DeviceID": "TestDevice",
 *}
 */
schedule.prototype.remove = function(args, done) {
  if (args.hasOwnProperty('DeviceID') == true) {
    let len = _jobs[args.DeviceID].jobs.length;
    for(let i = 0; i < len; i++){
      _jobs[args.DeviceID].jobs[i].cancel();
    }
    //REMOVE FROM MONGO
    // MUST CLEAR JOBS ARRAY
    done(null,{
      result:"Schedule for "+args.DeviceID+" is removed!",
      status:"OK"
    })
  } else {
    done(null, {
      result: 'Missing argumets!',
      status: "ERROR"
    })
  }
}

module.exports = schedule;
