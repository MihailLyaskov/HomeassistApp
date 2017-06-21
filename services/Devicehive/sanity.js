//@flow weak

var wrp = require('./wrapper');
var wrapper = new wrp();

var result = wrapper.init(async function(err,res){
  if(err)
    console.log(err)
  else {
    //setTimeout(function(){
      let data = await res.device.handleCommand("database/showSubs", {})
      console.log("data baby" + data)
    //},3000)

  }
});
