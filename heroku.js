var WebSocketServer = require('ws').Server
	, http = require('http')
	, express = require('express')
	, app = express()
	, port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(port,process.env.IP);

console.log('http server listening on %d', port);
        
var connections = [];
connections[0] = null;

var hostPC;

var count = 0;
var wss = new WebSocketServer({server});

var Player = function(ID, isconnection, ws,ready){
  this.ID = ID;
  this.isconnection = isconnection;
  this.ws = ws;
	this.ready = ready;
}

/*------index.html用処理------*/
const activeuserjson = require(__dirname  +'/public/json/activeplayerdata.json');
const fs = require('fs');
console.log(activeuserjson);
/*-----------↑サーバー起動時処理------------*/

//接続している全てのクライアントにデータを送信する
wss.broadcast = function (data) {
	for (var i in this.clients) {
		this.clients [i].send (data);
	};
};

/*
試合開始の処理
*/
function readygo(ID,who){
	connections[ID].ws.send(JSON.stringify({"server":"readygo","name":"server"}));
	try{
		connections[who].ws.send(JSON.stringify({"server":"readygo","name":"server"}));
	} catch (err) {
		console.log(err.name + ': ' + err.message + "ser");
		connections[who].isconnection == false;
	}
}

/*
データをクライアントに送信する処理
*/
function Send(ID, message){
  var who;
	var date = JSON.parse(message);
  if(ID % 2 === 0){
    who = ID - 1;
  }else {
    who = ID + 1;
  }
  //クライアントからのデータに"ready"が含まれていたら。
	if (~message.indexOf('ready')) {
		try {
			connections[ID].ready = date.ready;
		} catch (err) {
			console.log(err.name + ': ' + err.message);
		}
	};

  if(connections[who] !== undefined){
    //console.log(connections[who].isconnection);
    if (connections[who].isconnection === true){
      if (~message.indexOf('my')) {
        //data2にmyを含む場合の処理
        message = message.replace( /my/g , "opponent" ) ;
      }else if ( ~message.indexOf('opponent')) {
        message = message.replace( /opponent/g , "my" ) ;
      };
      var data1 = JSON.parse(message);
			try{
				connections[who].ws.send(JSON.stringify(data1));
			} catch (err) {
				console.log(err.name + ': ' + err.message);
				connections[who].isconnection == false;
			}

			//プレイヤー1とプレイヤー2の準備が完了していたら対戦開始の処理
			if(connections[who].ready === "ready" && connections[ID].ready === "ready"){
				console.log (' Received:');
				connections[who].ready = "no";
				connections[ID].ready = "no";
				setTimeout(function(){readygo(ID,who)}, 3500);//試合開始の同期する時間
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

      //新しいユーザの登録
      connections[connelength] = new Player(connelength,true,ws,"no");
      //ユーザに部屋IDの情報を送信
      connections[connelength].ws.send(JSON.stringify({"ID":connections[connelength].ID,"name":"my"}));
      wss.broadcast ("player" +connelength);

      console.log(connections[connelength].ID);

      //htmlの処理
      let user = {
            ID: connelength,
            name: "Cave Master",
      };
      activeuserjson.push(user);
      // STEP 3: Writing to a file
      fs.writeFile(__dirname  +'/public/json/activeplayerdata.json', JSON.stringify(activeuserjson), err => {
     
      // Checking for errors
      if (err) throw err; 
      console.log("Done writing"); // Success
    });
      console.log(activeuserjson);

      /*
      メッセージを受信した場合
      */      
			ws.on ('message', function (message) {
        var date = JSON.parse(message);
				wss.broadcast (message);
        Send(date.ID, message);
			});

      /*
      接続が切断された場合
      */
      ws.on('close', function (ws) {
        var closeid = "nuloppp";
        console.log(ws);
        for(i = 1; i < connections.length; i++){
          console.log(connections[i].ws._closeCode);
          if( connections[i].ws._closeCode === ws){
            closeid = connections[i].ID.toString();
            connections[i].isconnection = false;
						connections[i].ready = "no";
            connections[i].ws._closeCode = 0;
          }
        }
        console.log ('player' + closeid +  ':reset');
      });

      ws.on('disconnect', function(ws){
        console.log("disconnect:" + ws);
      });


      /*
      エラーが発生した場合
      */
      ws.on('error', function(err){
        console.log(err);
        console.log(err.stack);
      });
});