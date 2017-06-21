//@flow weak
var config;
var mongoCollection;
var mongodb = require("mongodb").MongoClient;
var client;
var device;
var seneca;

var core = function(Config) {
  config = Config;
}

core.prototype.init = function(Client, Device, Seneca) {
  client = Client;
  device = Device;
  seneca = Seneca;
  return new Promise(async function(resolve, reject) {
    try {
      let mongo = await mongodb.connect('mongodb://' + config.device_config.mongo.host + ':' + config.device_config.mongo.port + '/' + config.device_config.mongo.database);
      mongoCollection = await mongo.collection(config.device_config.mongo.collection);
      let commandsSubscription = await device.Subscribe(config.device_config.sub_for_comands);
      resolve(mongoCollection);
    } catch (err) {
      reject(err)
    }
  });
}


core.prototype.showSubs = async function(args, done) {
  try {
    console.log("hi from show subs")
    let result = await mongoCollection.find()
    let toArray = await result.toArray()
    done(null, {
      data: toArray,
      status: 'ok'
    })
  } catch (err) {
    done(null, {
      status: 'Error'
    })
  }
}

core.prototype.sendNotification = async function(args, done) {
  if (args.hasOwnProperty('notificationName') == true &&
    args.hasOwnProperty('data') == true) {
    device.sendNotification(args.notificationName, args.data, function(err, res) {
      if (err) done(null, {
        result: err,
        status: 'Error'
      });
      else done(null, {
        result: res,
        status: 'ok'
      });
    });
  } else {
    done(null, "Missing or wrong params!");
  }
}

core.prototype.sendCommand = async function(args, done) {
  if (args.hasOwnProperty('DeviceID') == true &&
    args.hasOwnProperty('command') == true && args.hasOwnProperty('params') == true) {
    client.sendCommand(args.DeviceID, args.command, args.params, function(err, res) {
      if (err) done(null, {
        result: err,
        status: 'Error'
      });
      else done(null, {
        result: res,
        status: 'ok'
      });
    });
  } else {
    done(null, "Missing or wrong params!");
  }
}


//Recieves a 3rd argument "services". This is done for the easier decoding of incoming notifications
//and the recieving service
core.prototype.subscribe = async function(args, done) {
  //console.error(args);
  if (args.params.hasOwnProperty('DeviceID') == true &&
    args.params.hasOwnProperty('notification') == true) {
    try {
      let subscribe = await client.subscribe({
        deviceIds: args.params.DeviceID,
        names: args.params.notification,
        onMessage: args.params.notification
      })
      console.log(subscribe)
      let insert = await mongoCollection.insertOne({
        Device: args.params.DeviceID,
        notification: args.params.notification,
        subID: subscribe.id,
        subService: args.params.service
      })
      let handleMessages = await subscribe.message(async function(DeviceIds, data) {
        return new Promise(function(resolve, reject) {
          let doneFlag = false
          let servicesArray = config.device_config.services_and_sub_paths;
          for (let i = 0; i < servicesArray.length; i++) {
            if (args.params.service == servicesArray[i].service) {
              doneFlag = true;
              seneca.act(servicesArray[i].sub_path, data, function(err, res) {
                if (err) reject(err);
                else {
                  resolve(res);
                }
              });
            } else if (i == servicesArray.length - 1 && doneFlag == false) {
              reject("No subscription handlerS")
            }
          }
        })
      });
      done(null, {
        status: 'ok'
      })
    } catch (err) {
      done(null, {
        status: 'Error'
      });
    }
  } else {
    done(null, "Missing or wrong params!");
  }
}

core.prototype.unsubscribe = async function(args, done) {
  //console.log(args)
  if (args.params.hasOwnProperty('DeviceID') == true &&
    args.params.hasOwnProperty('notification') == true) {
    try {
      let sub = await mongoCollection.findOne({
        Device: args.params.DeviceID,
        subService: args.params.service
      })
      let unsubRes = await unsub(sub)
      if (unsubRes.removeSub == true) {
        let remove = mongoCollection.deleteOne(sub)
        done(null, {
          status: 'ok'
        })
      } else {
        done(null, {
          err: "No subscription found",
          status: "Error"
        })
      }
    } catch (err) {
      done(null, {
        err: err,
        status: "Error"
      })
    }
  } else {
    done(null, "Missing or wrong params!")
  }
}


core.prototype.getDevice = async function(args, done) {
  client.getDevice(args.DeviceID, function(err, res) {
    if (err) {
      done(null, err);
      console.error(res);
    } else done(null, res);
  });
}

function unsub(args) {
  return new Promise(async function(resolve, reject) {
    if (args != null) {
      try {
        let result = await client.unsubscribe(args.subID)
        resolve({
          removeSub: true,
          res: result
        })
      } catch (err) {
        reject(err)
      }
    } else {
      resolve(null, {
        removeSub: false,
        res: "No subscription found!"
      })
    }
  })
}



module.exports = core;
