//@flow weak
var chai = require('chai');
var should = chai.should();
var hiveWrapper = require('../wrapper');
var createService = new hiveWrapper();
var moment = require('moment-timezone');

var beginTime = moment().tz("Europe/Sofia").format();
var endTime = '';

describe('Devicehive connector and database service tests.', function() {
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
    devicehive.device.handleCommand("database/startLog", {
      device: 'TestDevice',
      notification: 'notif'
    }, function(err, result) {
      if (err) {
        console.error(err)
      } else {
        result.status.should.equal("OK");
        result.result.should.equal("Started logging data for TestDevice!");
        done()
      }
    })
  });
  it('should show subscription for TestDevice', function(done) {
    console.log('TEST 2:')
    devicehive.device.handleCommand("database/showSubs", {}, function(err, result) {
      if (err) {
        console.log("EEEEEEEEEEERRROOOOOORRRR")
        console.error(err)
      } else {
        result.status.should.equal("OK");
        console.log(result)
        done()
      }
    })
  })
  it('should start sendind notifications with data', function(done) {
    console.log('TEST 3:')
    devicehive.client.sendSubData(
      'TestDevice', {
        device: 'TestDevice',
        power: 1000.3,
        energy: 1110.4
      },
      function(err, result) {
        if (err) {
          console.log(err)
        } else {
          console.log(result)
          done()
        }
      })
  });
  it('should stop loging data', function(done) {
    console.log('TEST 4:')
    this.timeout(7000);
    setTimeout(function() {
      devicehive.device.handleCommand("database/stopLog", {
        device: 'TestDevice',
        notification: 'notif'
      }, function(err, result) {
        if (err) {
          console.log(err)
        } else {
          console.log(result)
          result.status.should.equal("OK");
          result.result.should.equal("Stoped log for TestDevice!");
          endTime = moment().tz("Europe/Sofia").format();
          done()
        }
      })
    }, 2000)
  });
  it('should show subscription for TestDevice', function(done) {
    console.log('TEST 5:')
    devicehive.device.handleCommand("database/showSubs", {}, function(err, result) {
      if (err) {
        console.log("EEEEEEEEEEERRROOOOOORRRR")
        console.error(err)
      } else {
        result.status.should.equal("OK");
        console.log(result)
        done()
      }
    })
  })
  it('should show logged data', function(done) {
    console.log('TEST 6:')
    devicehive.device.handleCommand("database/getData", {
      device: 'TestDevice',
      beginTime: beginTime,
      endTime: endTime
    }, function(err, result) {
      if (err) {
        console.error(err)
      } else {
        result.status.should.equal("OK");
        console.log(result.result)
        done()
      }
    })
  })
  it('should show logged devices', function(done) {
    console.log('TEST 7:')
    devicehive.device.handleCommand("database/showDevices", {}, function(err, result) {
      if (err) {
        console.error(err)
      } else {
        result.status.should.equal("OK");
        console.log(result.result)
        done()
      }
    })
  })
})
