/**
 * 
 */

var Player = require('./player_session')
  , gs     = require('grooveshark')
  , client = new gs('collab_aleksey', '45b98aae57815d5fdbae7fcd38276982');

function session_name() {
  var rnd = []
  for (var i = 0; i < 3; i++) {
    rnd.push(Math.round(Math.random() * 26) + 96)
  }
  return new Buffer(rnd).toString('ascii')
}

var sessions = {}

module.exports = exports = function(io, app) {

  client.request('getCountry', {
    ip : '71.206.192.19',
  }, function(err, status, country) {
    client.gsCountry = country
  });

  app.get('/', function(req, res, next) {
    res.redirect('/player')
  })

  app.get('/player', function(req, res) {
    var session
    do {
      session = session_name()
    } while (sessions[sessions])

    res.redirect('/player/' + session)
  })

  app.get('/player/:session', function(req, res, next) {
    var session = req.param('session');

    if (!sessions[session]) {
      sessions[session] = new Player(io, app, client, session)
    } 

    res.render('player', {
      player: true,
      session: session
    })
  })

  app.get('/:session', function(req, res, next) {
    var session = req.param('session');
    res.render('client', {

      session : session
    })
  })

}