// @flow weak
var chai = require('chai');
var should = chai.should();
var hiveWrapper = require('../../Devicehive/wrapper');
var createService = new hiveWrapper();
var moment = require('moment-timezone');

/*
describe('Devicehive connector and schedule service tests.', function() {
  var devicehive = null
  before(function(done) {
    createService.init(function(err, res) {
      if (err) {
        console.error(err)
      } else {
        devicehive = res;
        done()
      }
    })
  })
  it('should start logging data for TestDevice', function(done) {
    console.log('TEST 1:')
    this.timeout = 100000;
    let time = moment();
    devicehive.device.handleCommand("schedule/create", {
      "DeviceID": "TestDevice",
      "schedule": [{
        "beginTime": time.hour().toString()+':'+time.minute().toString()+':'+(time.second()+5).toString(),
        "endTime": time.hour().toString()+':'+time.minute().toString()+':'+(time.second()+15).toString()
      }],
      "maxEnergy": 1500.0
    }, function(err, result) {
      if (err) {
        console.error(err)
      } else {
        console.log(result)
        result.status.should.equal("OK");
        setTimeout(()=>{
          done()
        },60000)
      }
    })
  });
});*/
var devicehive = null
createService.init(async function(err, res) {
  if (err) {
    console.log(err)
  } else {
    try {
      let createSchedule = await test1(res)
      let removeSchedule = await test2(res)
    } catch (err) {
      console.log(err)
    }
  }
})

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

function test1(devicehive) {
  return new Promise(function(resolve, reject) {
    console.log('TEST 1:')
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
      "maxEnergy": 1500.0
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

function test2(devicehive) {
  return new Promise(function(resolve, reject) {
    console.log('TEST 2:')
    setTimeout(function(){
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
    },20000)
  })
}
