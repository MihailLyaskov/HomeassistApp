//@flow weak
const config = require('config');

var Connector = require("./connector")
var ServiceCore = require("./serviceCore");
var seneca = require('seneca')({
  timeout: 7000
});

var connector = new Connector(config, seneca)
var core = new ServiceCore(config)

var wrapper = function() {

}

wrapper.prototype.init = async function(callback) {
  try {
    let devicehive = await connector.init();
    let senecaClients = await createClients();
    let senecaListen = await seneca.listen()
    let Core = await core.init(connector,seneca);
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
    callback(null)
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
