//@flow weak
var chai = require('chai');
var should = chai.should();
var servicePlugin = require('./servicePlugin.js');
var moment = require('moment-timezone');
var service = new servicePlugin();

var pass = 0;
var fail = 0;

var beginTime = moment().tz("Europe/Sofia").format();
var endTime = '';

function delay(t) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, t * 1000)
  });
}

async function StartTest(){
  await delay(3)

  // TEST startLog function
  try{
      let startLog = await service.startLog({
        DeviceID: 'TestDevice',
        notification: 'notif'
      })
      if(startLog.status.should.equal("OK")){
        console.log(JSON.stringify(startLog) + '\n')
        pass++
      }
  }catch(err){
    console.log('Error in startLog \n' + err)
    fail++
  }

  await delay(3)

  // TEST showSubs function
  try{
      let showSubs = await service.showSubs({})
      console.log('Test , showSubs:')
      if(showSubs.status.should.equal("OK")){
        //filter only needed data
        console.log(JSON.stringify(showSubs.result[0].params) + '\n')
        pass++;
      }
  }catch(err){
    console.log('Error in showSubs \n' + err)
    fail++
  }

  await delay(3)

  try{
    console.log('Test , logData1:')
    let logData1 = await service.logData({
        DeviceID: 'TestDevice',
        power: 123.8,
        energy: 123.9
    })
    if(logData1.status.should.equal("OK")){
      console.log(JSON.stringify(logData1) + '\n')
      pass++;
    }
  }catch(err){
    console.log('Error in logData1 \n' + err)
    fail++
  }

  await delay(3)

  try{
    console.log('Test , logData2:')
    let logData2 = await service.logData({
        DeviceID: 'TestDevice',
        power: 123.8,
        energy: 123.9
    })
    if(logData2.status.should.equal("OK")){
      console.log(JSON.stringify(logData2) + '\n')
      pass++;
    }
  }catch(err){
    console.log('Error in logData2 \n' + err)
    fail++
  }

  await delay(3)

  // TEST getData funciton
  try{
    console.log('Test , getData:')
    endTime = moment().tz("Europe/Sofia").format();
    let getData = await service.getData({DeviceID:'TestDevice',beginTime: beginTime, endTime: endTime})
    if(getData.status.should.equal("OK")){
      pass++;
      console.log(getData.result)
      console.log('\n')
    }
  }catch(err){
    console.log('Error in getData \n' + err)
    fail++
  }

  await delay(3)

  // TEST showDevices function
  try{
    console.log('Test , showDevices:')
    let showDevices = await service.showDevices({})
    if(showDevices.status.should.equal("OK")){
      console.log(showDevices.result)
      console.log('\n')
      pass++;
    }
  }catch(err){
    console.log('Error in showDevices \n' + err)
    fail++
  }

  await delay(3)

  // TEST stopLog function
  try{
    console.log('Test , stopLog:')
    let stopLog = await service.stopLog({
        DeviceID: 'TestDevice',
        notification: 'notif'
    })
    if(stopLog.status.should.equal("OK")){
      console.log(stopLog)
      console.log('\n')
      pass++;
    }
  }catch(err){
    console.log('Error in stopLog \n' + err)
    fail++
  }

  console.log(`Test finished with ${pass} passing and ${fail} failing functions.`)

}



StartTest()
