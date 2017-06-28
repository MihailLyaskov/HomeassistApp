var config = require('config');

var mongoSchedule = null;
var mongoSubs = null;
var mongodb = require("mongodb").MongoClient;

async function start(){
  try{
    let mongo = await mongodb.connect('mongodb://' + config.device_config.mongo.host + ':' + config.device_config.mongo.port + '/' + config.device_config.mongo.database);
    mongoSubs = await mongo.collection(config.device_config.mongo.collection);

    let mongo2 = await mongodb.connect('mongodb://' + config.device_config.mongoSchedule.host + ':' + config.device_config.mongoSchedule.port + '/' + config.device_config.mongoSchedule.database);
    mongoSchedule = await mongo2.collection(config.device_config.mongoSchedule.collection);

    let clearSubs = await mongoSubs.drop()
    let clearSchedules = await mongoSchedule.drop()

  //  process.exit(0)
  }catch(err){
    console.error(err)
  }
}

start()
