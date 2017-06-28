// @flow weak

var seneca  = require('seneca')({timeout:7000})
  .use('./busPlugin')
  .listen({port:10103,pin:'role:schedule'})
  .client({port:10101})
