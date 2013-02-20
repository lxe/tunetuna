/**
 * 
 */

var request = require('request')
  , gs      = require('grooveshark')
  , ts      = require('./tinysong')
  , Player  = require('./player')

var gs_client  = new gs('collab_aleksey', '45b98aae57815d5fdbae7fcd38276982');

// Generate the session name
function session_name() {
  var id = ''
   ,  possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for(var i = 0; i < 3; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
}

var sessions = { }

module.exports = exports = function(io, app) {

  app.get('/search/:q', function(req, res) {
    var q = req.param('q');
    if (!q || !q.length) return res.send(400)
    ts(q, function(err, results) {
      if (err || !results || !results.length) return res.send(400)
      res.send(results)
    })
  })

  app.get(['/', '/player'],  function(req, res, next) {
    var session
    do {
      session = session_name();
    } while (sessions[sessions])
    res.redirect('/player/' + session)
  })

  app.get('/player/:session', function(req, res, next) {
    var session = req.param('session');

    if (!sessions[session]) {
      gs_client.request('getCountry', {
        ip : req.headers['X-Forwarded-For'] || req.connection.remoteAddress
      }, function(err, status, country) {
        if (err) return res.send(500, err.message);
        sessions[session] = new Player(io, app, gs_client, country, session)
      });
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