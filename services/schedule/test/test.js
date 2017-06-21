// @flow weak

var scheduler = require('../scheduleCore');
var moment = require('moment');
var sch = new scheduler({});



setTimeout(() => {
  sch.create({
    "DeviceID": "TestDevice",
    "schedule": [{
      "beginTime": "00:19:00",
      "endTime": "00:19:30"
    }],
    "maxEnergy": 1500.0
  }, function(err, res) {
    if (err)
      console.log(err)
    else {
      console.log(res)
    }
  })
},2000)
