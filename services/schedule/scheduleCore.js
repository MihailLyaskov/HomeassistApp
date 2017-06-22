// @flow weak
const config = require('config');
const mongodb = require("mongodb").MongoClient;
const scheduler = require('node-schedule');
var _jobs = []
var _seneca = null
var _collection = null;

var schedule = function(seneca) {
  _seneca = seneca;
}

schedule.prototype.init = async function(callback) {
  try {
    let mongo = await mongodb.connect('mongodb://' + config.device_config.mongoSchedule.host + ':' + config.device_config.mongoSchedule.port + '/' + config.device_config.mongoSchedule.database);
    _collection = await mongo.collection(config.device_config.mongoSchedule.collection);
    callback(null, _collection);
  } catch (err) {
    callback(err)
  }
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
schedule.prototype.create = async function(args, done) {
  if (args.hasOwnProperty('DeviceID') == true &&
    args.hasOwnProperty('schedule') == true &&
    args.hasOwnProperty('maxEnergy') == true) {
    if (typeof args.DeviceID === 'string' && Array.isArray(args.schedule) && typeof args.maxEnergy === 'number') {
      //Create the jobs that will be working on the new schedule
      let len = args.schedule.length;
      let jobs = [];
      let name = args.DeviceID;
      for (let i = 0; i < len; i++) {
        let beginJob = createJob(args.DeviceID, args.schedule[i].beginTime, "On")
        jobs.push(beginJob)
        let endJob = createJob(args.DeviceID, args.schedule[i].endTime, "Off")
        jobs.push(endJob)
      }
      //Add schedule jobs objects to _jobs array for use later
      _jobs.push({
        jobs: jobs
      });
      //Save the new schedule to database
      try {
        let saveToMongo = await store(args, _jobs.length - 1)
        //console.log(saveToMongo)
      } catch (err) {
        console.error(err)
      }
      //MAKE SUBSCRIPTION
      done(null, {
        result: "Created daily schedule for " + args.DeviceID,
        status: "OK"
      })
    } else {
      done(null, {
        result: 'Missing or wrong argumets!',
        status: "ERROR"
      })
    }
  } else {
    done(null, {
      result: 'Missing or wrong argumets!',
      status: "ERROR"
    })
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
schedule.prototype.remove = async function(args, done) {
  if (args.hasOwnProperty('DeviceID') == true) {
    let index;
    // Remove schedule from database and get schedule index
    try {
      index = await remove(args.DeviceID)
    } catch (err) {
      console.error(err)
    }
    //Cancel jobs working on the removed schedule
    let len = _jobs[index].jobs.length;
    for (let i = 0; i < len; i++) {
      _jobs[index].jobs[i].cancel();
    }
    //Remove jobs from _jobs array
    _jobs.splice(index, 1);
    //Send result message
    done(null, {
      result: "Schedule for " + args.DeviceID + " is removed!",
      status: "OK"
    })
  } else {
    done(null, {
      result: 'Missing argumets!',
      status: "ERROR"
    })
  }
}

/**
 * @api {get} schedule/showAll Remove a daily schedule for a device
 * @apiVersion 1.0.0
 * @apiName showAll
 * @apiGroup Schedule
 *
 * @apiExample  Example usage:
 *{}
 */
schedule.prototype.showAll = async function(args, done) {
  try {
    let result = await _collection.find().toArray()
    done(null, {
      result: result,
      status: "OK"
    })
  } catch (err) {
    console.error(err)
    done(null, {
      result: "Error",
      status: "ERROR"
    })
  }
}

function store(args, index) {
  return new Promise(async function(resolve, reject) {
    try {
      let insert = await _collection.insertOne({
        Device: args.DeviceID,
        schedule: args.schedule,
        maxEnergy: args.maxEnergy,
        index: index
      })
      resolve(insert)
    } catch (err) {
      reject(err)
    }
  })
}

function remove(DeviceID) {
  return new Promise(async function(resolve, reject) {
    try {
      let remove = await _collection.findOneAndDelete({
        Device: DeviceID
      })
      resolve(remove.value.index)
    } catch (err) {
      reject(err)
    }
  })
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



module.exports = schedule;
