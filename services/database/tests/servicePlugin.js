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

servicePlugin.prototype.showDevices = function() {
  return new Promise(async function(resolve,reject){
    try{
      let showDevices = await sendToService({
          role: 'database',
          cmd: 'showDevices'
      })
      resolve(showDevices)
    }catch(err){
      reject(err)
    }
  })
}

servicePlugin.prototype.getData = function(args) {
  return new Promise(async function(resolve,reject){
    try{
      let getData = await sendToService({
          role: 'database',
          cmd: 'getData'
      }, {
          device: args.DeviceID,
          beginTime: args.beginTime,
          endTime: args.endTime
      })
      resolve(getData)
    }catch(err){
      reject(err)
    }
  })
}

servicePlugin.prototype.startLog = function(args) {
  return new Promise(async function(resolve,reject){
    try{
      let start = await sendToService({
          role: 'database',
          cmd: 'startLog'
      },{
          device: args.DeviceID,
          notification: args.notification
      })
      resolve(start)
    }catch(err){
      reject(err)
    }
  })
}


servicePlugin.prototype.stopLog = function(args) {
  return new Promise(async function(resolve,reject){
    try{
      let stopLog = await sendToService({
        role: 'database',
        cmd: 'stopLog'
      }, {
        device: args.DeviceID,
        notification: args.notification
      })
      resolve(stopLog)
    }catch(err){
      reject(err)
    }
  })
}

servicePlugin.prototype.showSubs = function() {
  return new Promise(async function(resolve,reject){
    try{
      let show = await sendToService({
          role: 'database',
          cmd: 'showSubs'
      },{})
      resolve(show)
    }catch(err){
      reject(err)
    }
  })
}

servicePlugin.prototype.logData = function(args) {
  return new Promise(async function(resolve,reject){
    try{
      let logData = await sendToService({
          role: 'database',
          cmd: 'logData'
      }, {
          device: args.DeviceID,
          power: args.power,
          energy: args.energy
      })
      resolve(logData)
    }catch(err){
      reject(err)
    }
  })
}


function sendToService(command, data) {
  return new Promise(async function(resolve, reject) {
    seneca.act(command, data, function(err, res) {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}



module.exports = servicePlugin;
