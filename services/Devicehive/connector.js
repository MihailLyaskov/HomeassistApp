//@flow weak
//var Devicehive = require('devicehive');
const { init } = require(`../../node_modules/devicehive/src/api.js`);
var Subscribe = require('./subscribe')

var _config = null;
var _devicehive = null;
var _seneca = null;
var _subscriptions = [];

var Connector = function(config, seneca) {
  _config = config;
  _seneca = seneca;
}

Connector.prototype.init = function() {
  return new Promise(async function(resolve, reject) {
    try {
      _devicehive = await init(_config.DeviceHive.url)
      let newToken = await _devicehive.refreshToken(_config.DeviceHive.token)
      _devicehive.setTokens({accessToken:newToken['accessToken'],refreshToken:_config.DeviceHive.token})
      console.log('AccessToken received');
      refreshToken()
      let deviceConfig = _config.device_config.main_config;
      let registerDevice = await _devicehive.saveDevice(deviceConfig.guid, {
        name: deviceConfig.name
      })
      console.log(`Registered ${deviceConfig.name} device`)
      let getInfo = await _devicehive.getInfo()
      console.log('Info received, start polling...')
      let timestamp = getInfo['serverTimestamp']
      poll(timestamp, deviceConfig.guid);
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

Connector.prototype.subscribe = function(subData){
  console.log('in connector subscribe')
  console.log(subData)
  return new Promise(function(resolve,reject){
    let subscription = new Subscribe(_devicehive,_seneca,_config.device_config.services_and_sub_paths[subData.service],subData)
    subscription.start();
    _subscriptions.push(subscription);
    resolve()
  })
}

Connector.prototype.unsubscribe = function(subData){
  return new Promise(function(resolve,reject){
    for(let i = 0; i < _subscriptions.length; i++){
      if(_subscriptions[i].deviceIds == subData.Device &&
         _subscriptions[i].names == subData.notification &&
         _subscriptions[i].service == subData.subService){
           _subscriptions[i].stop();
           _subscriptions.splice(i,1);
           break;
         }
    }
    resolve()
  })
}

Connector.prototype.sendNotification = function(notif,data){
  return new Promise(async function(resolve,reject){
    try {
      let notif1 = await _devicehive.createDeviceNotification(_config.device_config.main_config.guid, {
        notification: notif,
        parameters: data
      })
      resolve(notif1)
    } catch (err) {
      reject(err)
    }
  })
}

Connector.prototype.sendCommand = function(device,cmd,data){
  return new Promise(async function(resolve,reject){
    try {
      let send = await _devicehive.createDeviceCommand(device, {
        command: cmd,
        parameters: data
      })
      let poll = await _devicehive.getDeviceCommandPoll(device, send.id.toString(), 15)
      resolve(poll)
    } catch (err) {
      reject(err)
    }
  })
}


function refreshToken(){
  setInterval(async function(){
    try {
      let newToken = await _devicehive.refreshToken(_config.DeviceHive.token)
      _devicehive.token = newToken['accessToken'];
      console.log('Token refreshed');
    }catch(err){
      console.log(err)
    }
  },300000)
}

async function poll(_timestamp, deviceID) {
  try {
    let timestamp = null
    let id = null
    let result = null
    let commands = await _devicehive.getDevicesCommandPoll({
      timestamp: _timestamp,
      deviceIds: deviceID
    })
    let checkCommands = _config.device_config.sub_for_comands
    if (commands.length > 1) {
      for (let i = 0; i < commands.length; i++) {
        if (checkCommands[commands[i]['command']]) {
          console.log(commands[i])
          timestamp = commands[i]['timestamp']
          id = commands[i]['id']
          result = await pushToService(checkCommands[commands[i]['command']], commands[i]['parameters'])
          let update = await _devicehive.updateCommand(deviceID, id, result)
        }
      }
    } else if (commands.length == 1) {
      if (checkCommands[commands[0]['command']]) {
        console.log('Connector recieved:')
        console.log(commands[0])
        timestamp = commands[0]['timestamp']
        id = commands[0]['id']
        result = await pushToService(checkCommands[commands[0]['command']], commands[0]['parameters'])
        console.log('Connector got response')
        console.log(result)
        let update = await _devicehive.updateCommand(deviceID, id, {"result":result})
      }
    }
    poll(timestamp, deviceID)
  } catch (err) {
    console.error(err)
  }
}


function pushToService(command, data) {
  return new Promise(async function(resolve, reject) {
    _seneca.act(command, data, function(err, res) {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

module.exports = Connector;
