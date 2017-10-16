//@flow weak

const influx_client = require('./influx_client')
const config = require('config')

module.exports = function Database(options) {
  var database = new influx_client();
  var seneca = this;

  seneca.add({
    role: 'database',
    cmd: 'logData'
  }, logData);
  seneca.add({
    role: 'database',
    cmd: 'getData'
  }, getData);
  seneca.add({
    role: 'database',
    cmd: 'showDevices'
  }, showDevices);
  seneca.add({
    role: 'database',
    cmd: 'startLog'
  }, startLog);
  seneca.add({
    role: 'database',
    cmd: 'stopLog'
  }, stopLog);
  seneca.add({
    role: 'database',
    cmd: 'showSubs'
  }, showSubs);

  /**
   * @api {get} database/logData Internal path for directing incoming subscription notifications to database service.
   * @apiVersion 1.0.0
   * @apiName logData
   * @apiGroup Database
   *
   * @apiParam {String} DeviceID Unique device name.
   * @apiParam {String} power Power data in whatts.
   * @apiParam {String} energy Energy data in whatts per hour.
   *
   * @apiSuccessExample Success-Response:
   *   {
   *      "result": "Data written!",
   *      "status": "OK"
   *   }
   *
   *
   * @apiError result Data can't be logged for some stupid reason.
   *
   * @apiErrorExample Error-Response:
   *     {
   *       "result": <Some Kind of Error>,
   *       "status": "ERROR"
   *     }
   */
  function logData(args, done) {
    if (args.hasOwnProperty('DeviceID') == true &&
      args.hasOwnProperty('power') == true &&
      args.hasOwnProperty('energy') == true) {
      if(config.Debug == true){
          console.log('\n Database service , input , logData function \n')
          console.log(args)
          console.log('\n')
      }
      database.logData(args, function(err, res) {
        if (err) {
          if(config.Debug == true){
              console.log('\nERROR Database service , output , logData function \n')
              console.log(err)
              console.log('\n')
          }
          done(null, {
            result: err,
            status: "ERROR"
          })
        } else {
          if(config.Debug == true){
              console.log('\n Database service , output , logData function \n')
              console.log(res)
              console.log('\n')
          }
          done(null, {
            result: res,
            status: 'OK'
          })
        }
      })
    } else {
      done(null, {
        result: 'Missing arguments! DeviceID , power or energy',
        status: 'ERROR'
      })
    }
  }

  /**
   * @api {get} database/getData Query data for a specific device in a specific time period.
   * @apiVersion 1.0.0
   * @apiName getData
   * @apiGroup Database
   *
   * @apiParam {String} DeviceID Unique device name.
   * @apiParam {String} beginTime 2017-05-04 00:00:00 .
   * @apiParam {String} endTime 2017-05-04 00:10:00.
   *
   * @apiSuccess result Array with time , power and energy
   *
   * @apiSuccessExample Success-Response:
   *   {
   *      "result": [{"time": ,"power": ,"energy": }..],
   *      "status": "OK"
   *   }
   *
   * @apiErrorExample Error-Response:
   *     {
   *       "result": <Some Kind of Error>,
   *       "status": "ERROR"
   *     }
   */
  function getData(args, done) {
    if (args.hasOwnProperty('DeviceID') == true &&
      args.hasOwnProperty('beginTime') == true &&
      args.hasOwnProperty('endTime') == true) {
      if(config.Debug == true){
          console.log('\nDatabase service , input , getData function \n')
          console.log(args)
          console.log('\n')
      }
      database.getData(args, function(err, res) {
        if (err) {
          if(config.Debug == true){
              console.log('\nERROR Database service , output , getData function \n')
              console.log(err)
              console.log('\n')
          }
          done(null, {
            result: err,
            status: "ERROR"
          })
        } else {
          if(config.Debug == true){
              console.log('\nDatabase service , output , getData function \n')
              console.log(res)
              console.log('\n')
          }
          done(null, {
            result: res,
            status: 'OK'
          })
        }
      })
    } else {
      done(null, {
        result: 'Missing arguments! DeviceID , beginTime or endTime',
        status: 'ERROR'
      })
    }
  }

  /**
   * @api {get} database/showDevices Show all logged devices.
   * @apiVersion 1.0.0
   * @apiName showDevices
   * @apiGroup Database
   *
   * @apiSuccess result Array with logged devices.s
   *
   * @apiSuccessExample Success-Response:
   *   {
   *      "result": [{"device": }..],
   *      "status": "OK"
   *   }
   *
   */
  function showDevices(args, done) {
    if(config.Debug == true){
        console.log('\nDatabase service , input , showDevices function \n')
        console.log(args)
        console.log('\n')
    }
    database.showDevices(function(err, res) {
      if (err) {
        if(config.Debug == true){
            console.log('\nERROR Database service , output , showDevices function \n')
            console.log(err)
            console.log('\n')
        }
        done(null, {
          result: err,
          status: "ERROR"
        })
      } else {
        if(config.Debug == true){
            console.log('\nDatabase service , output , showDevices function \n')
            console.log(res)
            console.log('\n')
        }
        done(null, {
          result: res,
          status: 'OK'
        })
      }
    })
  }

  /**
   * @api {get} database/startLog Start subscription for a specific device.
   * @apiVersion 1.0.0
   * @apiName startLog
   * @apiGroup Database
   *
   * @apiParam {String} device Unique device name.
   * @apiParam {String} notification Notification name.
   */
  function startLog(args, done) {
    if (args.hasOwnProperty('DeviceID') == true &&
      args.hasOwnProperty('notification') == true) {
      if(config.Debug == true){
        console.log('\nDatabase service , input , startLog function \n')
        console.log(args)
        console.log('\n')
      }
      seneca.act({
        role: 'client',
        cmd: 'subscribe'
      }, {
        params: {
          DeviceID: args.DeviceID,
          notification: args.notification,
          service: 'database'
        }
      }, function(err, res) {
        if (res.status == 'Error') {
          if(config.Debug == true){
            console.log('\nERROR Database service , output , startLog function \n')
            console.log(err)
            console.log('\n')
          }
          done(null, {
            result: err,
            status: 'Error'
          })
        } else {
          if(config.Debug == true){
            console.log('\nDatabase service , output , startLog function \n')
            console.log(args)
            console.log('\n')
          }
          done(null, {
            result: `Started logging data for ${args.DeviceID}!`,
            status: 'OK'
          })
        }

      })
    } else {
      done(null, {
        result: 'Missing argumets! DeviceID or notification.',
        status: "ERROR"
      })
    }
  }

  /**
   * @api {get} database/stopLog Stop subscription for a specific device.
   * @apiVersion 1.0.0
   * @apiName stopLog
   * @apiGroup Database
   *
   * @apiParam {String} DeviceID Unique device name.
   * @apiParam {String} notification Notification name.
   */
  function stopLog(args, done) {
    if (args.hasOwnProperty('DeviceID') == true &&
      args.hasOwnProperty('notification') == true) {
      if(config.Debug == true){
          console.log('\nDatabase service , input , stopLog function \n')
          console.log(args)
          console.log('\n')
      }
      seneca.act({
        role: 'client',
        cmd: 'unsubscribe'
      }, {
        params: {
          DeviceID: args.DeviceID,
          notification: args.notification,
          service: 'database'
        }
      }, function(err, res) {
        if (res.status == 'Error') {
          if(config.Debug == true){
              console.log('\nERROR Database service , output , stopLog function \n')
              console.log(err)
              console.log('\n')
          }
          done(null, {
            result: err,
            status: 'Error'
          })
        } else {
          if(config.Debug == true){
              console.log('\nDatabase service , output , stopLog function \n')
              console.log(res)
              console.log('\n')
          }
          done(null, {
            result: `Stoped log for ${args.DeviceID}!`,
            status: 'OK'
          })
        }
      })
    } else {
      done(null, {
        result: 'Missing argumets! DeviceID or notification.',
        status: "ERROR"
      })
    }
  }

  /**
   * @api {get} database/showSubs Show currently active subscriptions.
   * @apiVersion 1.0.0
   * @apiName showSubs
   * @apiGroup Database
   *
   */
  function showSubs(args, done) {
    if(config.Debug == true){
      console.log('\nDatabase service , input , showSubs function \n')
      console.log(args)
      console.log('\n')
    }
    seneca.act({
      role: 'client',
      cmd: 'showSubs'
    }, {
      params: {
        service: 'database'
      }
    }, function(err, res) {
      if (res.status == 'Error') {
        if(config.Debug == true){
          console.log('\nERROR Database service , output , showSubs function \n')
          console.log(err)
          console.log('\n')
        }
        done(null, {
          result: err,
          status: 'Error'
        })
      } else {
        if(config.Debug == true){
          console.log('\nDatabase service , output , showSubs function \n')
          console.log(res)
          console.log('\n')
        }
        done(null, {
          result: res.data,
          status: 'OK'
        })
      }
    })
  }
}
