//@flow weak
var subscribe = 'OFF'
var subs = []
var seneca = require('seneca')({
        timeout: 2000
    })
    .use(plugin)
    .listen({
        pin: 'role:client'
    })
    .client({
        port: 10102
    })

function plugin(options) {
    seneca.add({
        role: 'client',
        cmd: 'subscribe'
    }, handleSubscribe)
    seneca.add({
        role: 'client',
        cmd: 'unsubscribe'
    }, handleUnsubscribe)
    seneca.add({
        role: 'client',
        cmd: 'showSubs'
    }, showSubs)

    function handleSubscribe(args, done) {
        subs.push(args);
        subscribe = 'ON';
        done(null, {status:"OK"});
    }

    function handleUnsubscribe(args, done) {
        subscribe = 'OFF';
        done(null, {status:"OK"});
    }

    function showSubs(args,done) {
        done(null, {status:'ok',data:subs});
    }
}

var servicePlugin = function() {

}

servicePlugin.prototype.showDevices = function(callback) {
    seneca.act({
        role: 'database',
        cmd: 'showDevices'
    }, function(err, res) {
        if (err)
            callback(err)
        else {
            callback(null,res)
        }
    })
}

servicePlugin.prototype.getData = function(args, callback) {
    seneca.act({
        role: 'database',
        cmd: 'getData'
    }, {
        device: args.DeviceID,
        beginTime: args.beginTime,
        endTime: args.endTime
    }, function(err, res) {
        console.log("SERVICE END")
        if (err){
            console.log(err)
            callback(err)
        }
        else {
            callback(null,res)
        }
    })
}

servicePlugin.prototype.startLog = function(args, callback) {
    seneca.act({
        role: 'database',
        cmd: 'startLog'
    }, {
        device: args.DeviceID,
        notification: args.notification
    }, function(err, res) {
        if (err != null) callback(err)
        else callback(null,res)

    })
}

servicePlugin.prototype.stopLog = function(args, callback) {
    seneca.act({
        role: 'database',
        cmd: 'stopLog'
    }, {
        device: args.DeviceID,
        notification: args.notification
    }, function(err, res) {
        if (err)
            callback(err)
        else {
            callback(null,res)
        }
    })
}

servicePlugin.prototype.showSubs = function(callback) {
    seneca.act({
        role: 'database',
        cmd: 'showSubs'
    }, function(err, res) {
        if (err)
            callback(err)
        else {
            callback(null,res)
        }
    })
}

function logData(args, callback) {
    seneca.act({
        role: 'database',
        cmd: 'logData'
    }, {
        device: args.DeviceID,
        power: args.power,
        energy: args.energy
    }, function(err, res) {
        if (err){ var c=2
            //callback(err)
          }
        else {
          //  callback(null,res)
          var r=2
        }
    })
}

function getRandomFloat(min, max) {
    return parseFloat(Math.random() * (max - min + 1) + min);
}

setInterval(function() {
    if (subscribe == 'ON') {
        logData({
            DeviceID: 'TestDevice',
            power: 123.8,
            energy: 123.9
        },function(err,res){
          if(err){

          }
            //console.error(err)
          else {
            //console.log(res)
          }
        })
    }

}, 5000)

module.exports = servicePlugin;
