//@flow weak
var moment = require('moment-timezone');
var config = require('config')
const { init } = require(`../../../node_modules/devicehive/src/api.js`);
const token = config.DeviceHive.token
var dhNode = null;
var mongoSchedule = null;
var mongoSubs = null;
//var mongodb = require("mongodb").MongoClient;


async function start() {
  try {
    dhNode = await init(config.DeviceHive.url)
    //let mongo = await mongodb.connect('mongodb://' + config.device_config.mongo.host + ':' + config.device_config.mongo.port + '/' + config.device_config.mongo.database);
    //mongoSubs = await mongo.collection(config.device_config.mongo.collection);

    //let mongo2 = await mongodb.connect('mongodb://' + config.device_config.mongoSchedule.host + ':' + config.device_config.mongoSchedule.port + '/' + config.device_config.mongoSchedule.database);
    //mongoSchedule = await mongo2.collection(config.device_config.mongoSchedule.collection);

    let newToken = await dhNode.refreshToken(token)
    dhNode.setTokens({accessToken:newToken['accessToken'],refreshToken:token})
    let save = await dhNode.saveDevice('TestDevice', {
      name: 'TestDevice'
    })
    let getInfo = await dhNode.getInfo()
    let timestamp = getInfo['serverTimestamp']
    poll(timestamp, 'TestDevice')

    //TESTS
    console.log('***************************************** ')
    console.log('* Integration test for Schedule Service * ')
    console.log('***************************************** \n')

    console.log("Send schedule/create command to create schedule with paramters:")
    let newSchedule = await createSchedule()
    console.log('\nRecieved: ')
    console.log(JSON.stringify(newSchedule.result,null,2))
    console.log('\n\n')

    let delay0 = await delay(5)

    console.log('Send schedule/showSubs command to see all subscriptions')
    let ShowSubs = await sendCommand('homeassist', 'schedule/showSubs', {})
    console.log('Recieved: ')
    console.log(JSON.stringify(ShowSubs.result,null,2))
    console.log('\n\n')

    let del = await delay(5)

    console.log("Send Notification with power and energy measurements. Power 1000 Energy 1000")
    let notif1 = await sendNotification('TestDevice', "device/init", {
      DeviceID: 'TestDevice',
      power: 1000.0,
      energy: 1000.0
    })
    console.log('Recieved: ')
    console.log(JSON.stringify(notif1,null,2))
    console.log('\n\n')

    let delay1 = await delay(5)

    console.log('Send schedule/showAll to see all schedules')
    let showAll = await sendCommand('homeassist', 'schedule/showAll', {})
    console.log('Recieved: ')
    console.log(JSON.stringify(showAll.result,null,2))
    console.log('\n\n')

    let delay2 = await delay(5)

    console.log("Send Notification with power and energy measurements. Power 1000 Energy 1000 \n Expecting switch OFF command")
    let notif2 = await sendNotification('TestDevice', "device/init", {
      DeviceID: 'TestDevice',
      power: 1000.0,
      energy: 1000.0
    })
    console.log(JSON.stringify(notif2,null,2))
    console.log('\n\n')

    let delay3 = await delay(5)

    console.log("Send schedule/remove command." )
    let removeSchedule = await sendCommand('homeassist', 'schedule/remove', {
      "DeviceID": "TestDevice"
    })
    console.log('Parameters sent:\n'+JSON.stringify(removeSchedule.parameters,null,2))
    console.log('Recieved: ')
    console.log(JSON.stringify(removeSchedule.result,null,2))
    console.log('\n\n')

    process.exit()

  } catch (err) {
    console.log(err)
  }
}

function sendCommand(device, cmd, params) {
  return new Promise(async function(resolve, reject) {
    try {
      let send = await dhNode.createDeviceCommand(device, {
        command: cmd,
        parameters: params
      })
      let poll = await dhNode.getDeviceCommandPoll(device, send.id.toString(), 15)
      resolve(poll)
    } catch (err) {
      reject(err)
    }
  })
}

function sendNotification(device, notif, params) {
  return new Promise(async function(resolve, reject) {
    try {
      let notif1 = await dhNode.createDeviceNotification(device, {
        notification: notif,
        parameters: params
      })
      resolve(notif1)
    } catch (err) {
      reject(err)
    }
  })
}

function delay(t) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, t * 1000)
  });
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

function createSchedule() {
  return new Promise(function(resolve, reject) {
    try {
      let time = moment();
      let begin1 = calcTime(time.hour(), time.minute(), time.second() + 5)
      let end1 = calcTime(time.hour(), time.minute() + 1, time.second() + 5)
      let schedule = {
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
      }
      console.log(schedule)
      let result = sendCommand('homeassist', "schedule/create", schedule)
      resolve(result)
    } catch (err) {
      reject(err)
    }
  })
}

async function poll(_timestamp, deviceID) {
  try {
    let timestamp = null
    let id = null
    let result = null
    let commands = await dhNode.getDevicesCommandPoll({
      timestamp: _timestamp,
      deviceIds: deviceID
    })
    //console.log(JSON.stringify(commands))
    //timestamp = commands[0]['timestamp']
    if (commands.length > 0) {
      console.log('TestDevice recieved command:')
      console.log(commands[0])
      console.log('\n\n')
      timestamp = commands[0]['timestamp']
      id = commands[0]['id']
      let update = await dhNode.updateCommand(deviceID, id.toString(), {})
    }
    poll(timestamp, deviceID)
  } catch (err) {
    console.error(err)
  }
}


start()
