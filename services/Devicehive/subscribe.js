//@flow weak

var _devicehive = null
var polling = false
var _seneca = null
var _destination = null
// subscription params:
//  deviceIds
//  names
//  service

var Subscribe = function(devicehive, seneca, senecaDestination,subscripton) {
  _devicehive = devicehive;
  _seneca = seneca;
  _destination = senecaDestination;
  this.deviceIds = subscripton.deviceIds;
  this.names = subscripton.names;
  this.service = subscripton.service;
}

Subscribe.prototype.start = async function() {
  polling = true;
  let getInfo = await _devicehive.getInfo()
  let _timestamp = getInfo['serverTimestamp']
  while (polling) {
    try {
      let result = await _devicehive.getDevicesNotificationsPoll({
        deviceIds: this.deviceIds,
        names: this.names,
        timestamp: _timestamp
      })
      if (polling == true) {
        //_timestamp = result['timestamp']
        console.log(result)
        if(result.length > 0)
          _timestamp = result[0]['timestamp']
          pushToSeneca({
            DeviceID:result[0].parameters.DeviceID,
            power:result[0].parameters.power,
            energy:result[0].parameters.energy
          })
      }
    } catch (err) {
      console.log(err)
    }
  }
}

Subscribe.prototype.stop = function() {
  polling = false;
}

var pushToSeneca = function(data){
  _seneca.act(_destination,data,function(err,res){
    if(err)
      console.log(err)
  })
}

module.exports = Subscribe;
