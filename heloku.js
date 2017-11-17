var WebSocketServer = require('ws').Server
	, http = require('http')
	, express = require('express')
	, app = express()
	, port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var player1 ;
var player1a = 0;
var player2 ;
var player2a = 0;
var count = 0;


var hostPC;

var wss = new WebSocketServer({server});

wss.broadcast = function (data) {
	for (var i in this.clients) {
		this.clients [i].send (data);
	};
};


console.log('websocket server created');
wss.on('connection', function(ws) {
		switch(count){
			case 0:
				player1 = ws;
				player1.send(JSON.stringify({"ID":1,"name":"my"}));
				player1a = 1;
			break;
			case 1:
				player2 = ws;
				player2.send(JSON.stringify({"ID":2,"name":"my"}));
				player2a = 1;
			break;
			};
			
			count ++;
			if (count >= 3){
				count = 0;
				player1a = 0;
				player2a = 0;
				console.log ('reset');
			};

			//誰からでもメッセージを受信した時
			ws.on ('message', function (message) {
				var now = new Date();
				console.log (now.toLocaleString() + ' Received: %s', message);
				wss.broadcast (message);
				
			});
			//player1からメッセージを受信した時
			if (player1a === 1) {
				player1.on('message', function (pl2) {
					if (player2a === 1) {
						
										
						if (~pl2.indexOf('my')) {
							//data2にmyを含む場合の処理
							pl2 = pl2.replace( /my/g , "opponent" ) ;
						}else if ( ~pl2.indexOf('opponent')) {
							pl2 = pl2.replace( /opponent/g , "my" ) ;
						};
						
						var data2 = JSON.parse(pl2);
						player2.send(JSON.stringify(data2));
					};
				});
				
				//切断時
				player1.on('close', function () {
						player1a = 0;
						count = 0;
						console.log ('player1:reset');
				});
			};
			
			//player2からメッセージを受信した時
			if (player2a === 1){	
				player2.on('message', function (pl1) {
					if (player1a === 1) {
							
						if (~pl1.indexOf('my')) {
							//data2にmyを含む場合の処理
							pl1 = pl1.replace( /my/g , "opponent" ) ;
						}else if ( ~pl1.indexOf('opponent')) {
							pl1 = pl1.replace( /opponent/g , "my" ) ;
						};	
						
						/*if ( data1.match(/my/)) {
							//data2にmyを含む場合の処理
							data1 = data1.replace( /my/g , "opponent" ) ;
						}else if ( ~data1.indexOf('opponent')) {
							data1 = data1.replace( /opponent/g , "my" ) ;
						};
						*/			
						var data1 = JSON.parse(pl1);
						player1.send(JSON.stringify(data1));
						
					};
				});
				//切断時
				player2.on('close', function () {
						player2a = 0;
						count = 1;
						console.log ('player2:reset');
				});
				
			};

});