var http = require('http');
var fs = require('fs');
var path = require('path');
var urlLib = require("url");
var querystring = require('querystring');
var utils = require('util');

// Start Data Sync
var data = JSON.parse(fs.readFileSync("./data.json"));
var dataCache = data;
var dataWrite = function(){
  setTimeout(function(){
    //if(data != dataCache){
    if(true){
      // Note written every 5 seconds
      console.log(Date.now()+ " Changes saved.");
      console.log(Date.now()+ " Starting data write.");
      fs.writeFileSync("./data.json", JSON.stringify(data));
      console.log(Date.now()+ " Finished data write.");
    }else{
      console.log(Date.now()+ " No changes made.")
    }
    dataWrite();
  }, 5000);
}
dataWrite();
// End data sync

http.createServer(function(req,res){
  var url  = urlLib.parse(req.url, true);
  switch (url.pathname) {
    case "/home":
      res.end(fs.readFileSync("./pages/home.txt"), 'utf-8');
      break;
    case "/login":
      if (req.method == 'POST') {
        console.log("[200] " + req.method + " to " + req.url);
        var fullBody = '';

        req.on('data', function(chunk) {
          // append the current chunk of data to the fullBody variable
          fullBody += chunk.toString();
        });
        req.on('end', function() {
          // request ended -> do something with the data
          res.writeHead(200, "OK", {'Content-Type': 'text/html'});
          // parse the received body data
          var decodedBody = querystring.parse(fullBody);
          // output the decoded data to the HTTP response
          //res.write(utils.inspect(decodedBody));
          res.write("title, Login attempt page");
          console.log(utils.inspect(decodedBody))
          var uname = decodedBody.txt1;
          var pword = decodedBody.txt2;
          if(uname!=""&&data.users[uname].pass==pword){
            res.write("|label,lbl1,Welcome "+uname);
          }else{
            res.write("|label,lbl2,Failed login as "+uname);
            res.write("|button,home,Go Home");
          }
          res.end();
        });
      }else{
        res.end("ERR WRONG METHOD");
      }
      break;
      case "/signup":
        if (req.method == 'POST') {
          console.log("[200] " + req.method + " to " + req.url);
          var fullBody = '';
          req.on('data', function(chunk) {
            // append the current chunk of data to the fullBody variable
            fullBody += chunk.toString();
          });
          req.on('end', function() {
            // request ended -> do something with the data
            res.writeHead(200, "OK", {'Content-Type': 'text/html'});
            // parse the received body data
            var decodedBody = querystring.parse(fullBody);
            // output the decoded data to the HTTP response
            //res.write(utils.inspect(decodedBody));
            console.log(utils.inspect(decodedBody))
            var uname = decodedBody.txt1;
            var pword = decodedBody.txt2;
            if(uname==""&&pword==""){
              res.write("|label,lbl2,Failed signup as"+uname);
              res.write("|label,lbl3,Dont enter blank fields");
              res.write("|button,home,Go Home");
            }else if(data.users[uname]){
              res.write("|label,lbl2,Failed signup as"+uname);
              res.write("|label,lbl3,User already exists");
              res.write("|button,home,Go Home");
            }else{
              data.users[uname]={pass: pword};
              res.write("|label,lbl1,Signed up as "+uname);
            }
            res.write("|label,lblUname,"+uname);
            res.write("|label,lblPword,"+pword);
            res.end();
          });
        }else{
          res.end("ERR WRONG METHOD");
        }
        break;
    default:
      console.log(req.method + " " + url.pathname + " failed.")
      res.write("title,Error||label,lbl1,This failed ");
      res.end();
  }
}).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');
