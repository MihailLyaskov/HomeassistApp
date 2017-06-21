//@flow weak
const config = require('config');
var Device = require("./deviceObj");
var Client = require("./clientObj");
var ServiceCore = require("./serviceCore");
var seneca = require('seneca')({
  timeout: 2000
});
var device = new Device(config);
var client = new Client();
var core = new ServiceCore(config)

var wrapper = function() {

}

wrapper.prototype.init = async function(callback) {
  try {
    let Client = await client.init();
    let Device = await device.init();
    let senecaClients = await createClients();
    let senecaListen = await seneca.listen()
    let Core = await core.init(client, device, seneca);
    let giveSeneca = await device.setSeneca(seneca);
    let initPlugin = await seneca.use('./busPlugin', {
      core: core
    })
    let Ready = await seneca.ready(function(err,res){
      if(err){
        console.log("ERRORR IN WRAPPER READY")
        console.log(err)
      }else{
        //console.log(res)
      }
    });
    callback(null, {
      client: client,
      device: device
    })
  } catch (err) {
    console.log("Wrapper init error")
    callback(err)
  }
}

function createClients() {
  let clients = config.device_config.seneca_clients;
  return new Promise(async function(resolve, reject) {
    for (let i = 0; i < clients.length; i++) {
      let res = await seneca.client(clients[i]);
    }
    resolve();
  })
}



module.exports = wrapper;
