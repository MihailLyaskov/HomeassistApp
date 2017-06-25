// @flow weak
var chai = require('chai');
var should = chai.should();
var hiveWrapper = require('../../Devicehive/wrapper');
var createService = new hiveWrapper();
var moment = require('moment-timezone');

var devicehive = null
createService.init(async function(err, res) {
  if (err) {
    console.log(err)
  } else {
    try {
      let create = await createSchedule2(res,"TEST 1")
      let showAll = await showSchedules(res,"TEST 2")
      //setTimeout(async function(){
        //let showAll2 = await showSchedules(res,"TEST 4")
        //let showSubs = await showSubscriptions(res,"TEST 5")
        //let sendData = await sendSubData(res, "TEST 6")
        //let showAll3 = await showSchedules(res,"TEST 4")
        setTimeout(async function(){
          let remove = await removeSchedule(res,"TEST 3")
          let showAll2 = await showSchedules(res,"TEST 4")
        }, 30000)
      //},30000)
    } catch (err) {
      console.log(err)
    }
  }
})

function sendSubData(devicehive, test) {
  return new Promise(function(resolve, reject) {
    console.log(test + ':')
    devicehive.client.sendSubData(
      'TestDevice', {
        device: 'TestDevice',
        power: 1000.3,
        energy: 2000.4
      },
      function(err, result) {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          console.log(result)
          resolve(result)
        }
      })
  })
}

function calcTime(hour, minute, second) {
  let _hour = 0,
    _second = 0,
    _minute = 0;
  if (second > 59) {
    _minute = minute + 1;
    _second = second - 60;
  } else {
    _minute = minute;
    _second = second;
  }
  if (_minute > 59) {
    _hour = hour + 1;
    _minute = _minute - 60;
  } else {
    _hour = hour;
  }
  if (_hour > 23) {
    _hour = _hour - 23;
  }
  _hour = _hour < 10 ? '0' + _hour.toString() : _hour.toString()
  _minute = _minute < 10 ? '0' + _minute.toString() : _minute.toString()
  _second = _second < 10 ? '0' + _second.toString() : _second.toString()
  return _hour + ':' + _minute + ':' + _second
}

function createSchedule2(devicehive, test) {
  return new Promise(function(resolve, reject) {
    console.log(test + ':')
    let time = moment();
    let begin1 = calcTime(time.hour(), time.minute(), time.second() + 5)
    let end1 = calcTime(time.hour(), time.minute() + 1, time.second() + 5)
    devicehive.device.handleCommand("schedule/create", {
      "DeviceID": "TestDevice",
      "schedule": [{
        "beginTime": begin1,
        "endTime": end1
      }],
      "maxEnergy": 1500.0,
      "notification": "device/init"
    }, function(err, result) {
      if (err) {
        reject(err)
      } else {
        console.log(result)
        result.status.should.equal("OK");
        resolve(result)
      }
    })
  })
}


function createSchedule(devicehive, test) {
  return new Promise(function(resolve, reject) {
    console.log(test + ':')
    let time = moment();
    let begin1 = calcTime(time.hour(), time.minute(), time.second() + 5)
    let end1 = calcTime(time.hour(), time.minute(), time.second() + 10)
    let begin2 = calcTime(time.hour(), time.minute(), time.second() + 15)
    let end2 = calcTime(time.hour(), time.minute(), time.second() + 20)
    let begin3 = calcTime(time.hour(), time.minute(), time.second() + 25)
    let end3 = calcTime(time.hour(), time.minute(), time.second() + 30)
    devicehive.device.handleCommand("schedule/create", {
      "DeviceID": "TestDevice",
      "schedule": [{
        "beginTime": begin1,
        "endTime": end1
      }, {
        "beginTime": begin2,
        "endTime": end2
      }, {
        "beginTime": begin3,
        "endTime": end3
      }],
      "maxEnergy": 1500.0,
      "notification": "device/init"
    }, function(err, result) {
      if (err) {
        reject(err)
      } else {
        console.log(result)
        result.status.should.equal("OK");
        resolve(result)
      }
    })
  })
}

function removeSchedule(devicehive, test) {
  return new Promise(function(resolve, reject) {
    console.log(test + ':')
    //setTimeout(function() {
      console.log('Sending schedule/remove command.')
      devicehive.device.handleCommand("schedule/remove", {
        "DeviceID": "TestDevice"
      }, function(err, result) {
        if (err) {
          reject(err)
        } else {
          console.log(result)
          result.status.should.equal("OK");
          resolve(result)
        }
      })
    //}, 20000)
  })
}

function showSchedules(devicehive, test) {
  return new Promise(function(resolve, reject) {
    console.log(test + ':')
    console.log('Sending schedule/showAll command.')
    devicehive.device.handleCommand("schedule/showAll", {}, function(err, result) {
      if (err) {
        reject(err)
      } else {
        console.log(result)
        result.status.should.equal("OK");
        resolve(result)
      }
    })
  })
}

function showSubscriptions(devicehive, test) {
  return new Promise(function(resolve, reject) {
    console.log(test + ':')
    console.log('Sending schedule/showSubs command.')
    devicehive.device.handleCommand("schedule/showSubs", {}, function(err, result) {
      if (err) {
        reject(err)
      } else {
        console.log(result)
        result.status.should.equal("OK");
        resolve(result)
      }
    })
  })
}
