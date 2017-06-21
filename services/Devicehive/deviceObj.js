//@flow weak
var seneca = Object
var config = Object
var handleCMD = null;
var async = require('async')
var device = function(configObj) {
  config = configObj
}

device.prototype.init = function() {
  return new Promise(function(resolve, reject) {
    console.log("Open Device Channel!")
    resolve();
  });
}

device.prototype.sendNotification = function(notificationName, data, callback) {
  callback(null, {
    notificationName,
    data
  })
}

device.prototype.setSeneca = function(Seneca) {
  return new Promise(function(resolve, reject) {
    seneca = Seneca;
    resolve()
  })
}


device.prototype.Subscribe = function(commands) {
  //console.log(commands)


}

device.prototype.handleCommand = async function(newCommand, args, callback) {
  let commands = config.device_config.sub_for_comands;
  let found = false;
  for (let i = 0; i < commands.length; i++) {
    if (commands[i].hive == newCommand) {
      found = true;
      seneca.act(commands[i].seneca_service, args, function(err, res) {
        if (err)
          callback(err);
        else {
          //console.log(res)
          callback(null, res);
        }
      });
    } else if (i == commands.length - 1 && found == false) {
      callback("Command not matching")
    }
  }
}
module.exports = device;
