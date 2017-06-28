//@flow weak
var config = null;;
var mongoCollection = null;;
var mongodb = require("mongodb").MongoClient;
var devicehive = null;
var seneca = null;

var core = function(Config) {
  config = Config;
}

core.prototype.init = function(Devicehive, Seneca) {
  devicehive = Devicehive;
  seneca = Seneca;
  return new Promise(async function(resolve, reject) {
    try {
      let mongo = await mongodb.connect('mongodb://' + config.device_config.mongo.host + ':' + config.device_config.mongo.port + '/' + config.device_config.mongo.database);
      mongoCollection = await mongo.collection(config.device_config.mongo.collection);
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
    try {
      let result = await devicehive.sendNotification(args.notificationName, args.data)
      done(null, {
        result: result,
        status: 'ok'
      });
    } catch (err) {
      done(null, {
        result: err,
        status: 'Error'
      })
    }
  } else {
    done(null, "Missing or wrong params!");
  }
}

core.prototype.sendCommand = async function(args, done) {
  if (args.hasOwnProperty('DeviceID') == true &&
    args.hasOwnProperty('command') == true && args.hasOwnProperty('params') == true) {
    try {
      let result = await devicehive.sendCommand(args.DeviceID, args.command, args.params)
      done(null, {
        result: result,
        status: 'ok'
      });
    } catch (err) {
      done(null, {
        result: err,
        status: 'Error'
      });
    }
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
    console.log('start subscribe')
    console.log(args)
    try {
      let sub = await devicehive.subscribe({
        deviceIds: args.params.DeviceID,
        names: args.params.notification,
        service: args.params.service
      })
      //console.log(subscribe)
      let insert = await mongoCollection.insertOne({
        Device: args.params.DeviceID,
        notification: args.params.notification,
        subService: args.params.service
      })
      done(null, {
        status: 'ok'
      })
    } catch (err) {
      console.log(err)
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

/*
core.prototype.getDevice = async function(args, done) {
  client.getDevice(args.DeviceID, function(err, res) {
    if (err) {
      done(null, err);
      console.error(res);
    } else done(null, res);
  });
}
*/
function unsub(args) {
  return new Promise(async function(resolve, reject) {
    if (args != null) {
      try {
        let result = await devicehive.unsubscribe(args)
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
