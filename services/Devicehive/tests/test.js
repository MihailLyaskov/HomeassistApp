// @flow weak

var seneca = require('seneca')({
    timeout: 2000
  })
  .listen({
    port: 10102,
    pin: 'role:database'
  })
  .client({
    port: 10101
  })
  .use(Database)
  .ready(function() {

  })

  function Database(options) {
      var seneca = this;

      seneca.add({
          role: 'database',
          cmd: 'showSubs'
      }, showSubs);


      function showSubs(args,done) {
        console.log('in show subs')
        seneca.act({
            role: 'client',
            cmd: 'showSubs'
        }, function(err, res) {
          /*if (res.status == 'Error') {
                console.log(err)
                done(null,err)
            } else {
                //console.log(res)
                done(null,res)
            }*/
            done(null,res)
        })
      }
  }
