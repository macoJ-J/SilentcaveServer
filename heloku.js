var WebSocketServer = require('ws').Server
	, http = require('http')
	, express = require('express')
	, app = express()
	, port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(port,process.env.IP);

console.log('http server listening on %d', port);

var now = new Date();

var connections = [];
connections[0] = null;

var hostPC;

var count = 0;
var wss = new WebSocketServer({server});

var Player = function(ID, isconnection, ws){
  this.ID = ID;
  this.isconnection = isconnection;
  this.ws = ws;
}


wss.broadcast = function (data) {
	for (var i in this.clients) {
		this.clients [i].send (data);
	};
};
function cou(){
	console.log('10秒たった：',count);
}

function Send(ID, message){
  var who;
	var date = JSON.parse(message);
  if(ID % 2 === 0){
    who = ID - 1;
  }else {
    who = ID + 1;
  }
  //console.log(id);
  if(connections[who] !== undefined){
		if(date.weaponknockback !== undefined && date.weaponknockback !== ""){
			count++;
    	//console.log (' Received: %s',date.weaponknockback);
			setTimeout(cou, 10000);
		}
    //console.log(connections[who].isconnection);
    if (connections[who].isconnection === true){
      if (~message.indexOf('my')) {
        //data2にmyを含む場合の処理
        message = message.replace( /my/g , "opponent" ) ;
      }else if ( ~message.indexOf('opponent')) {
        message = message.replace( /opponent/g , "my" ) ;
      };
    //  console.log(message);
      var data1 = JSON.parse(message);
			try{
				connections[who].ws.send(JSON.stringify(data1));
			} catch (err) {
				console.log(err.name + ': ' + err.message);
				connections[who].isconnection == false;
			}
    }
  }
}

console.log('websocket server created');
wss.on('connection', function(ws) {

      var connelength =  connections.length ;
      for(i = 1; i < connelength; i++){
        if ( connections[i].isconnection === false){
          connelength = i;
          console.log(connelength);
          break;
        };
      };

      connections[connelength] = new Player(connelength,true,ws);
      //connections[connelength].ws._closeCode = 0;
      connections[connelength].ws.send(JSON.stringify({"ID":connections[connelength].ID,"name":"my"}));
      wss.broadcast ("player" +connelength);

      //console.log(connections[connelength].ws.remoteAddress);
      console.log(connections[connelength].ID);


			//誰からでもメッセージを受信した時
			ws.on ('message', function (message) {
				var now = new Date();
        var date = JSON.parse(message);
				//console.log (now.toLocaleString() + ' Received: %s', message);
				wss.broadcast (message);
        //console.log(date);
        Send(date.ID, message);
			});

      ws.on('close', function (ws) {
        var closeid = "nuloppp";
        console.log(ws);
        for(i = 1; i < connections.length; i++){
          console.log(connections[i].ws._closeCode);
          if( connections[i].ws._closeCode === ws){
            closeid = connections[i].ID.toString();
            connections[i].isconnection = false;
            connections[i].ws._closeCode = 0;
          }
        }
        console.log ('player' + closeid +  ':reset');
      });

      ws.on('disconnect', function(ws){
        console.log("disconnect:" + ws);
      });

      ws.on('error', function(err){
        console.log(err);
        console.log(err.stack);
      });

});
