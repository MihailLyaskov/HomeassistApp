// @flow weak
var chai = require('chai');
var should = chai.should();
var moment = require('moment-timezone');
var servicePlugin = require('./servicePlugin.js');
var service = new servicePlugin();


function delay(t) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, t * 1000)
  });
}

async function StartTest(){

  await delay(3)

  try{
    console.log("Creating schedule \n")
    let create = await service.create()
    if(create.status.should.equal("OK")){
      console.log(JSON.stringify(create) + '\n')
    }
  }catch(err){
    console.log('Error in create \n' + err)
  }

  await delay(30)

  try{
    console.log('Showing subs \n')
    let showSubs = await service.showSubs()
    if(showSubs.status.should.equal("OK")){
      console.log(JSON.stringify(showSubs))
      console.log('\n')
    }
  }catch(err){
    console.log('Error in showSubs \n' + err)
  }

  try{
    console.log('Show Schedules \n')
    let showAll = await service.showAll()
    if(showAll.status.should.equal("OK")){
      console.log(JSON.stringify(showAll))
      console.log('\n')
    }
  }catch(err){
    console.log('Error in showAll \n' + err)
  }

  await delay(90)

  try{
    let remove = await service.remove()
    if(remove.status.should.equal("OK")){
      console.log(JSON.stringify(remove) + '\n')
    }
  }catch(err){
    console.log('Error in remove \n' + err)
  }

  await delay(10)

  try{
    console.log("Creating schedule \n")
    let create2 = await service.create()
    if(create2.status.should.equal("OK")){
      console.log(JSON.stringify(create2) + '\n')
    }
  }catch(err){
    console.log('Error in create2 \n' + err)
  }

  await delay(10)

  try{
    console.log("Send notification which will exceed maximum energy \n")
    let evaluate = await service.evaluate({
      DeviceID: 'TestDevice',
      power: 1000.3,
      energy: 2000.4
    })
    if(evaluate.status.should.equal("OK")){
      console.log(JSON.stringify(evaluate) + '\n')
    }
  }catch(err){
    console.log('Error in evaluate \n' + err)
  }

  await delay(70)

  try{
    let remove2 = await service.remove()
    if(remove2.status.should.equal("OK")){
      console.log(JSON.stringify(remove2) + '\n')
    }
  }catch(err){
    console.log('Error in remove2 \n' + err)
  }

}


StartTest()
