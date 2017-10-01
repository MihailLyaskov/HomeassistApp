//@flow weak
var subscribe = 'OFF'
var moment = require('moment-timezone');
var subs = []
var seneca = require('seneca')({
        timeout: 2000
    })
    .use(plugin)
    .listen({
        pin: 'role:client'
    })
    .client({
        port: 10103
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
    seneca.add({
      role: 'client',
      cmd: 'sendCommand'
    }, handleCommand)

    function handleCommand(args,done){
      console.log('Test , handleCommand:\n')
      console.log(args)
      console.log('\n')
      done(null,{status:"OK"});
    }

    function handleSubscribe(args, done) {
        subs.push(args);
        subscribe = 'ON';
        console.log('Test , handleSubscribe, SUBSCRIPTION IS MADE')
        done(null, {status:"OK"});
    }

    function handleUnsubscribe(args, done) {
        subscribe = 'OFF';
        console.log('Test , handleUnsubscribe, UNSUBSCRIBE DONE')
        done(null, {status:"OK"});
    }

    function showSubs(args,done) {
        done(null, {status:'ok',data:subs});
    }
}

var servicePlugin = function() {

}

servicePlugin.prototype.showAll = function() {
  return new Promise(async function(resolve,reject){
    try{
      let showAll = await sendToService({
          role: 'schedule',
          cmd: 'showAll'
      })
      resolve(showAll)
    }catch(err){
      reject(err)
    }
  })
}


servicePlugin.prototype.create = function() {
  return new Promise(async function(resolve,reject){
    try{
      let time = moment();
      let begin1 = calcTime(time.hour(), time.minute(), time.second() + 5)
      let end1 = calcTime(time.hour(), time.minute() + 1, time.second() + 5)
      let create = await sendToService({
          role: 'schedule',
          cmd: 'create'
      },{
        "DeviceID": "TestDevice",
        "start": {
          "command":"device/control",
          "parameters":{
            "state":"On"
          }
        },
        "stop": {
          "command":"device/control",
          "parameters":{
            "state":"Off"
          }
        },
        "schedule": [{
          "beginTime": begin1,
          "endTime": end1
        }],
        "maxEnergy": 1500.0,
        "notification": "device/init"
      })
      resolve(create)
    }catch(err){
      reject(err)
    }
  })
}


servicePlugin.prototype.remove = function() {
  return new Promise(async function(resolve,reject){
    try{
      let remove = await sendToService({
        role: 'schedule',
        cmd: 'remove'
      }, {
        "DeviceID": "TestDevice"
      })
      resolve(remove)
    }catch(err){
      reject(err)
    }
  })
}

servicePlugin.prototype.showSubs = function() {
  return new Promise(async function(resolve,reject){
    try{
      let show = await sendToService({
          role: 'schedule',
          cmd: 'showSubs'
      },{})
      resolve(show)
    }catch(err){
      reject(err)
    }
  })
}

servicePlugin.prototype.evaluate = function(args) {
  return new Promise(async function(resolve,reject){
    try{
      let evaluate = await sendToService({
          role: 'schedule',
          cmd: 'evaluate'
      }, {
          DeviceID: args.DeviceID,
          power: args.power,
          energy: args.energy
      })
      resolve(evaluate)
    }catch(err){
      reject(err)
    }
  })
}


function sendToService(command, data) {
  return new Promise(async function(resolve, reject) {
    console.log(command)
    console.log(data)
    seneca.act(command, data, function(err, res) {
      if (err) {
        reject(err)
      } else {
        resolve(res)
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


module.exports = servicePlugin;
