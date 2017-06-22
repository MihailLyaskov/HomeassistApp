// @flow weak

var Scheduler = require('./scheduleCore.js')


module.exports = function Schedule(options) {
  var seneca = this;
  var schedule = new Scheduler(seneca);
  schedule.init(function(err,res){
    if(err)
      console.error(err)
    else{
      console.log('Mongo for schedule started!')
    }
  });

  seneca.add({
    role: 'schedule',
    cmd: 'create'
  }, schedule.create);

  seneca.add({
    role: 'schedule',
    cmd: 'remove'
  }, schedule.remove);

  seneca.add({
    role: 'schedule',
    cmd: 'showAll'
  }, schedule.showAll);

  seneca.add({
    role: 'schedule',
    cmd: 'showSubs'
  }, schedule.showSubs);

  seneca.add({
    role: 'schedule',
    cmd: 'evaluate'
  }, schedule.evaluate);


}
