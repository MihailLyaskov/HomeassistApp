//@flow weak
var moment = require('moment-timezone');
var config = require('config');
const Hive = require('devicehive');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJwYXlsb2FkIjp7InVzZXJJZCI6MzUsImFjdGlvbnMiOlsiR2V0TmV0d29yayIsIkdldERldmljZSIsIkdldERldmljZVN0YXRlIiwiR2V0RGV2aWNlTm90aWZpY2F0aW9uIiwiR2V0RGV2aWNlQ29tbWFuZCIsIkdldERldmljZUNsYXNzIiwiUmVnaXN0ZXJEZXZpY2UiLCJDcmVhdGVEZXZpY2VOb3RpZmljYXRpb24iLCJDcmVhdGVEZXZpY2VDb21tYW5kIiwiVXBkYXRlRGV2aWNlQ29tbWFuZCIsIkdldEN1cnJlbnRVc2VyIiwiVXBkYXRlQ3VycmVudFVzZXIiLCJNYW5hZ2VUb2tlbiJdLCJuZXR3b3JrSWRzIjpbIjM1Il0sImRldmljZUlkcyI6WyIqIl0sImV4cGlyYXRpb24iOjE1MTQxMTcyNjE2NjQsInRva2VuVHlwZSI6IlJFRlJFU0gifX0.5OfU_uLhTBFKEvk9d9gCFoF4rk1EyeontYTfQ3ZDyQo'
const dhNode = new Hive.rest('http://playground.devicehive.com/api/rest')
var begin = moment().tz("Europe/Sofia").format();
var end = null;
var mongoSchedule = null;
var mongoSubs = null;
//var mongodb = require("mongodb").MongoClient;


async function start() {
  try {

    //let mongo = await mongodb.connect('mongodb://' + config.device_config.mongo.host + ':' + config.device_config.mongo.port + '/' + config.device_config.mongo.database);
    //mongoSubs = await mongo.collection(config.device_config.mongo.collection);

    //let mongo2 = await mongodb.connect('mongodb://' + config.device_config.mongoSchedule.host + ':' + config.device_config.mongoSchedule.port + '/' + config.device_config.mongoSchedule.database);
    //mongoSchedule = await mongo2.collection(config.device_config.mongoSchedule.collection);

    let newToken = await dhNode.refreshToken(token)
    dhNode.token = newToken['accessToken'];
    console.log('Token refreshed');
    let save = await dhNode.saveDevice('TestDevice', {
      name: 'TestDevice'
    })

    //TESTS
    console.log('Send database/startLog')
    let startLog = await sendCommand('homeassist', 'database/startLog', {
      device: 'TestDevice',
      notification: 'energy'
    })
    console.log(startLog)
    console.log('\n\n')

    console.log('Send database/showSubs to see if subscription is made')
    let showSubs = await sendCommand('homeassist', 'database/showSubs', {})
    console.log(showSubs)
    console.log('\n\n')

    let delay1 = await delay(3)

    console.log('Send notification from TestDevice')
    let notif1 = await sendNotification('TestDevice', 'energy', {
      device: 'TestDevice',
      power: 100.0,
      energy: 100.0
    })
    console.log(notif1)
    console.log('\n\n')

    let delay2 = await delay(3)

    console.log('Send notification from TestDevice')
    let notif2 = await sendNotification('TestDevice', 'energy', {
      device: 'TestDevice',
      power: 100.0,
      energy: 100.0
    })
    console.log(notif2)
    console.log('\n\n')

    let delay3 = await delay(3)

    console.log('Send notification from TestDevice')
    let notif3 = await sendNotification('TestDevice', 'energy', {
      device: 'TestDevice',
      power: 100.0,
      energy: 100.0
    })
    console.log(notif3)
    console.log('\n\n')

    console.log('Send database/stopLog')
    let stopLog = await sendCommand('homeassist', 'database/stopLog', {
      device: 'TestDevice',
      notification: 'energy'
    })
    console.log(stopLog)
    console.log('\n\n')

    console.log('Send database/showSubs to see if subscription is removed ')
    let showSubs2 = await sendCommand('homeassist', 'database/showSubs', {})
    console.log(showSubs2)
    console.log('\n\n')

    end = moment().tz("Europe/Sofia").format();

    console.log('Send database/getData to see if data from notifications is saved in database')
    let getData = await sendCommand('homeassist', 'database/getData', {
      device: 'TestDevice',
      beginTime: begin,
      endTime: end
    })
    console.log(getData.result.values)
    console.log('\n\n')

    console.log('Send database/showDevices to see all logged devices')
    let getDevices = await sendCommand('homeassist', 'database/showDevices', {})
    console.log(getDevices.result.values)
    console.log('\n\n')

    //let clearSubs = await mongoSubs.drop()
    //let clearSchedules = await mongoSchedule.drop()

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

start()
