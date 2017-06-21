// @flow weak

var dataTimeout = 5000;

var TestDevice = function() {
  this._state = 'OFF'
  this._sendNotification = null;
}

TestDevice.prototype.state = function(state) {
  this._state = state;
}

TestDevice.prototype.startNotifications = function(notification) {
  this._sendNotification = notification;
  sendNotification(notification, this._state)
}

function sendNotification(notification, state) {
  if (typeof notification === 'function') {
    setInterval(function() {
      if (state == 'ON')
        try {
          let res = notification('TestDevice', {
            device: 'TestDevice',
            power: getRandom(1,200),
            energy: getRandom(1,40)
          })
        } catch (err) {
          console.error(err)
        }
    }, dataTimeout)
  }

}

function getRandom(min, max) {
  return Math.random() * (max - min + 1) + min;
}

module.exports = TestDevice;
