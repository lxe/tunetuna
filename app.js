
/**
 * Module dependencies.
 */

var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , request = require('request')
  , port    = process.env.PORT || 3000

var app    = express();
var server = app.listen(port);
var io     = require('socket.io').listen(server, { log : false });

io.configure(function() {
  io.enable('browser client etag');
  io.set('transports', ['websocket', 'xhr-polling']);
});

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(function(req, res, next) {
    res.locals.websocket_port = process.env.WEBSOCKET_PORT || 3000
    res.locals.mobile = /mobile/i.test(req.header('user-agent'))
    next()
  })
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(express.logger('dev'));
});

app.configure('production', function(){

});

require('./routes')(app)
require('./player')(io, app)

console.log("Express server listening on port " + app.get('port'));
