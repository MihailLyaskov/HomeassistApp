//@flow weak
/*
{
          "measurement": "cpu_load_short",
          "tags": {
              "host": "server01",
              "region": "us-west"
          },
          "time": "2009-11-10T23:00:00Z",
          "fields": {
              "Float_value": 0.64,
              "Int_value": 3,
              "String_value": "Text",
              "Bool_value": True
          }
      }
*/
const config = require('config')
const m = require('moment-timezone');
const exec = require('child_process').exec;
var measurement = config.device_config.influx_datastorage.measurement
var database = config.device_config.influx_datastorage.database
var host = config.device_config.influx_datastorage.host
var writePoint = {
  "measurement": measurement,
  "tags": {
    "device": null
  },
  "time": null,
  "fields": {
    "power": null,
    "energy": null
  }
}

var influxdb_client = function() {

}

influxdb_client.prototype.createDB = function(callback) {
  exec(`./services/database/influxDriver.py --createDB '${database}'`, (error, stdout, stderr) => {
    if (error) {
      //console.error(`exec error: ${error}`);
      //console.error(error)
      callback(err)
    } else
      callback(null)
  })
}

influxdb_client.prototype.logData = function(args, callback) {
  console.log(`logging data power: ${args.power} , energy: ${args.energy}`)
  var time = fix_time()
  writePoint.tags.device = args.DeviceID
  writePoint.time = time
  writePoint.fields.power = parseFloat(args.power)
  writePoint.fields.energy = parseFloat(args.energy)
  exec(`./services/database/influxDriver.py --write '${JSON.stringify(writePoint)}' --db '${database}'`, (error, stdout, stderr) => {
    var result = {}
    try {
      result = JSON.parse(stdout)
    } catch (err) {
      console.log(result)
      console.log(stdout)
      console.log(stderr)
      console.error(err)
    }
    if (result.status != "True") {
      console.error(`Error saving data to InfluxDB!`)
      callback('Error saving data to InfluxDB!')
    } else {
      callback(null, 'Data written!')
    }
  });
}

influxdb_client.prototype.getData = function(args, callback) {
  let begin = fix_time2(args.beginTime)
  let end = fix_time2(args.endTime)
  var query = `select "time" , "power" , "energy" from ${measurement} where device = '${args.DeviceID}' and time >= '${begin}' and time <= '${end}'`
  exec(`./services/database/influxDriver.py --query "${query}" --db '${database}'`, (error, stdout, stderr) => {
    if (stdout == "{}") {
      callback(null, `There is no data for ${args.DeviceID} in the period of ${args.beginTime} to ${args.endTime}.`)
    } else {
      stdout = stdout.replace('\n', '')
      var out = JSON.parse(stdout)
      if (out.series)
        callback(null, out.series[0])
      else {
        console.log(out)
        callback(null, "Try again")
      }
    }
  });
}

influxdb_client.prototype.showDevices = function(callback) {
  exec(`./services/database/influxDriver.py --query 'show tag values from ${measurement} with key = device' --db '${database}'`, (error, stdout, stderr) => {
    if (stdout == "{}") {
      callback(null, `There are no logged devices.`)
    } else {
      stdout = stdout.replace('\n', '')
      var out = JSON.parse(stdout)
      callback(null, out.series[0])
    }
  })
}

function fix_time() {
  var time = m().tz("Europe/Sofia").format()
  var time1 = time.substring(0, 10)
  var time2 = time.substring(11, 19)
  var time3 = time1 + ' ' + time2
  return time3
}

function fix_time2(time) {
  var time1 = time.substring(0, 10)
  var time2 = time.substring(11, 19)
  var time3 = time1 + ' ' + time2
  return time3
}


module.exports = influxdb_client;
