//@flow weak

var seneca  = require('seneca')({timeout:7000})
  .use('./busPlugin')
  .listen({port:10102,pin:'role:database'})
  .client({port:10101})
