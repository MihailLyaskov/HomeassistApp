//@flow weak
var id = getRandom(1, 10000)
var newData = null
var client = function() {

}

client.prototype.init = function(){
  return new Promise(function(resolve,reject){
    console.log("Open Client Channel!")
    resolve();
  });
}

client.prototype.subscribe = async function(args) {
  //console.log(args)
  console.log(id)
  return new Promise(function(resolve, reject) {
    resolve({
      message: function(callback) {
        return new Promise(function(resolve, reject) {
          newData = callback
          resolve();
        });
      },
      id: getRandom(1, 10000)
    })
  });
}

client.prototype.sendSubData = async function(deviceIds, data, callback) {
    try {
      let result = await newData(deviceIds, data);
      callback(null,result)
    } catch (err) {
      callback(err)
    }
}

client.prototype.unsubscribe = function(args) {
  console.log(args)
  return new Promise(function(resolve,reject){
    if (id == args) console.log("IDs for add and remove subscription match!")
    resolve(args)
  })
}

client.prototype.sendCommand = function(deviceID, command, parameters, callback) {
  console.log([deviceID, command, parameters])
  callback(null, {
    status: 'ok'
  })
}

function getRandom(min, max) {
  return Math.random() * (max - min + 1) + min;
}

module.exports = client;
