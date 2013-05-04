/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var users = {};

io.sockets.on('connection', function (socket) {
	var guid = generateGUID();
	socket.emit("hello", users);
	users[guid] = {};
	io.sockets.emit('newuser', { guid: guid });
});


app.post('/mobitor', function(req, res){
	console.log('Posted');
	io.sockets.emit('message', { message: req.body.message });
});

app.get('/users', user.list);


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.configure(function () {
	io.set('transports', ['xhr-polling']);
});


function generateGUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
}