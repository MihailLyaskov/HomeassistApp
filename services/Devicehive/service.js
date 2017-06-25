//@flow weak
const Wrapper = require('./wrapper')
var wrapper = new Wrapper()
wrapper.init(function(err){
  if(err)
    console.error(err)
})
