//@flow weak
var moment = require('moment-timezone');
var config = require('config');
const { init } = require(`../../../node_modules/devicehive/src/api.js`);
const token = config.DeviceHive.token
var dhNode = null;
var begin = moment().tz("Europe/Sofia").format();
var end = null;
var mongoSchedule = null;
var mongoSubs = null;



async function start() {
  try {
    dhNode = await init(config.DeviceHive.url)

    let newToken = await dhNode.refreshToken(token)
    dhNode.setTokens({accessToken:newToken['accessToken'],refreshToken:token})
    let save = await dhNode.saveDevice('TestDevice', {
      name: 'TestDevice'
    })

    //TESTS
    console.log('***************************************** ')
    console.log('* Integration test for Database Service * ')
    console.log('***************************************** \n')

    console.log('Send database/startLog command to subscribe for energy notifications.')
    let startLog = await sendCommand('homeassist', 'database/startLog', {
      DeviceID: 'TestDevice',
      notification: 'energy'
    })
    console.log('Parameters sent:\n' + JSON.stringify(startLog.parameters,null,2))
    console.log('Recieved: ')
    console.log(startLog.result)
    console.log('\n\n')

    console.log('Send database/showSubs to see if subscription for notifications is made')
    let showSubs = await sendCommand('homeassist', 'database/showSubs', {})
    console.log('Recieved: ')
    console.log(JSON.stringify(showSubs.result,null,2))
    console.log('\n\n')

    let delay1 = await delay(3)

    console.log('Send notification from TestDevice with parameters:\n{\n\tDeviceID: \'TestDevice\n\t\',power: 100.1\n\t,energy: 100.1\n}')
    let notif1 = await sendNotification('TestDevice', 'energy', {
      DeviceID: 'TestDevice',
      power: 100.1,
      energy: 100.1
    })
    console.log('Recieved: ')
    console.log(notif1)
    console.log('\n\n')

    let delay2 = await delay(3)

    console.log('Send notification from TestDevice with parameters:\n{\n\tDeviceID: \'TestDevice\n\t\',power: 100.1\n\t,energy: 100.1\n}')
    let notif2 = await sendNotification('TestDevice', 'energy', {
      DeviceID: 'TestDevice',
      power: 100.1,
      energy: 100.1
    })
    console.log('Recieved: ')
    console.log(notif2)
    console.log('\n\n')

    let delay3 = await delay(3)

    console.log('Send notification from TestDevice with parameters:\n{\n\tDeviceID: \'TestDevice\n\t\',power: 100.1\n\t,energy: 100.1\n}')
    let notif3 = await sendNotification('TestDevice', 'energy', {
      DeviceID: 'TestDevice',
      power: 100.1,
      energy: 100.1
    })
    console.log('Recieved: ')
    console.log(notif3)
    console.log('\n\n')

    console.log('Send database/stopLog command to unsubscribe from energy notifications.')
    let stopLog = await sendCommand('homeassist', 'database/stopLog', {
      DeviceID: 'TestDevice',
      notification: 'energy'
    })
    console.log('Recieved: ')
    console.log(stopLog.result)
    console.log('\n\n')

    console.log('Send database/showSubs command to see if subscription is removed ')
    let showSubs2 = await sendCommand('homeassist', 'database/showSubs', {})
    console.log('Recieved: ')
    console.log(JSON.stringify(showSubs2.result,null,2))
    console.log('\n\n')

    end = moment().tz("Europe/Sofia").format();

    console.log('Send database/getData to see if data from notifications is saved in database')
    let getData = await sendCommand('homeassist', 'database/getData', {
      DeviceID: 'TestDevice',
      beginTime: begin,
      endTime: end
    })
    console.log('Parameters sent:\n' + JSON.stringify(getData.parameters,null,2))
    console.log('Recieved: ')
    console.log(JSON.stringify(getData.result,null,2))
    console.log('\n\n')

    console.log('Send database/showDevices to see all logged devices')
    let getDevices = await sendCommand('homeassist', 'database/showDevices', {})
    console.log('Recieved: ')
    console.log(JSON.stringify(getDevices.result,null,2))
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

start()
