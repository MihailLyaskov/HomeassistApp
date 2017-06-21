//@flow weak
var chai = require('chai');
var should = chai.should();
var servicePlugin = require('./servicePlugin.js');
var moment = require('moment-timezone');
var service = new servicePlugin();

var beginTime = moment().tz("Europe/Sofia").format();
var endTime = '';
describe('Database service tests', function() {
    it('should start logging data for TestDevice', function(done) {
        service.startLog({
            DeviceID: 'TestDevice',
            notification: 'notif'
        }, function(err, res) {
            res.status.should.equal("OK");
            res.result.should.equal("Started logging data for TestDevice!");
            console.log(res)
            done();
        })
    });
    it('should show subscription for TestDevice', function(done) {
        service.showSubs(function(err, res) {
            res.status.should.equal("OK");
            console.log(res.result[0].params)
            done();
        })
    });
    it('should stop logging data for TestDevice after 2 minutes', function(done) {
        console.log(beginTime)
        this.timeout(140000);
        setTimeout(function() {
            service.stopLog({
                DeviceID: 'TestDevice',
                notification: 'notif'
            }, function(err, res) {
                res.status.should.equal("OK");
                res.result.should.equal("Stoped log for TestDevice!");
                endTime = moment().tz("Europe/Sofia").format();
                console.log(endTime)
                done();
            })
        }, 20000);
    });
    it('should show logged devices',function(done){
      service.showDevices(function(err,res){
        res.status.should.equal("OK");
        console.log(res.result)
        done();
      })
    });
    it('should return logged data',function(done){
      service.getData({DeviceID:'TestDevice',beginTime: beginTime, endTime: endTime},function(err,res){
        res.status.should.equal("OK");
        console.log(res.result)
        done();
      })
    });
});
