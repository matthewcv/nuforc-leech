var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path
var dataAccess = require('./data-access')
var process = require('process') 
var childArgs = [
  path.join(__dirname, 'getuforeports.js'),
  //'single',
  //'126/S126209.html'
  //'http://www.nuforc.org/webreports/ndxe201603.html',
  'http://www.nuforc.org/webreports/ndxe201602.html',
  //'http://www.nuforc.org/webreports/ndxe201601.html',
  //'http://www.nuforc.org/webreports/ndxe201512.html',
  //'http://www.nuforc.org/webreports/ndxe201511.html',
  //'http://www.nuforc.org/webreports/ndxe201510.html'
]

var opts = {
    stdio:"pipe"
}


var start = process.hrtime();
var startCount = 0;
dataAccess.ufoReportCount().then(c => {
    if(c && c.count)
    {
        startCount = c.count;
    }
})


 
var child = childProcess.spawn(binPath, childArgs, opts);

child.on('exit', () => {
 
    var dur = process.hrtime(start);
    var total;
    
    dataAccess.ufoReportCount().then(c => {
        total = c.count - startCount;
        
        console.log('Count',total,'Duration',dur)
    })

})

child.stdout.on("data", (data) =>{
   var msg = data.toString();
   
   if(msg.indexOf('uforeport') == 0){
       var report = JSON.parse(msg.substr(10))
       dataAccess.insertUfoReport(report).then(res =>{
           console.log('insert', report.id)
       }, er => {
           console.log("insert error")
           console.dir([er,report])
       });
   }else{
       console.log(msg);
   }
   
});