var WebSocketServer = require('ws').Server
	, http = require('http')
	, express = require('express')
	, app = express()
	, port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var hostPC;

var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection', function(ws) {
		//定期的にデータ送っとかないと接続が切れてしまう環境があるらしいのでたぶんそのための処理
		var id = setInterval(function() {
				ws.send(JSON.stringify({'msg':'none', 'date':new Date()}), function() {  });
		}, 1000);

		console.log('websocket connection open');
		ws.on('message', function(msg) {
			//メッセージはJson形式にした
			var obj = JSON.parse(msg);
			
			if (obj.msg == 'setpc') {
				//制御用PCの設定
				hostPC = ws;
			}
			if (obj.msg == 'fromclient') {
								//スマホブラウザからのメッセージ
								//制御用PCへ送信
				if (hostPC != null) {
					hostPC.send(msg);
				}
			}
		});

		ws.on('close', function() {
				clearInterval(id);
		});
});