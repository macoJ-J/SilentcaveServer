var ws   = require ('ws').Server;

var wss = new ws ({port: 8088});

wss.broadcast = function (data) {
	for (var i in this.clients) {
		this.clients [i].send (data);
	};
};

