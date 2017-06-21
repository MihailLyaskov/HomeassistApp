//@flow_weak

module.exports = function senecaBus(options) {
  var seneca = this;
  var serviceCore = options.core;

  seneca.add({
    role: 'device',
    cmd: 'sendNotification'
  }, serviceCore.sendNotification);
  seneca.add({
    role: 'client',
    cmd: 'sendCommand'
  }, serviceCore.sendCommand);
  seneca.add({
    role: 'client',
    cmd: 'subscribe'
  }, serviceCore.subscribe);
  seneca.add({
    role: 'client',
    cmd: 'unsubscribe'
  }, serviceCore.unsubscribe);
  seneca.add({
    role: 'client',
    cmd: 'showSubs'
  }, serviceCore.showSubs);
  seneca.add({
    role: 'client',
    cmd: 'getDevice'
  }, serviceCore.getDevice);


}
