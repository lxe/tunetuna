/**
 * 
 */

var Player = require('./player_session')
  , gs     = require('grooveshark')
  , client = new gs('collab_aleksey', '45b98aae57815d5fdbae7fcd38276982');

function session_name() {
  var adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
  "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
  "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
  "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
  "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
  "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
  "wandering", "withered", "wild", "black", "young", "holy", "solitary",
  "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
  "polished", "ancient", "purple", "lively", "nameless"]

  , nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
  "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
  "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
  "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
  "firefly", "feather", "grass", "haze", "mountain", "night", "pond",
  "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
  "thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
  "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
  "frog", "smoke", "star"];

  return adjs[Math.floor(Math.random() * (adjs.length - 1))] 
    + nouns[Math.floor(Math.random() * (nouns.length - 1))];
}

var sessions = {}

module.exports = exports = function(io, app) {

  client.request('getCountry', {
    ip : '71.206.192.19',
  }, function(err, status, country) {
    client.gsCountry = country
  });

  app.get('/', function(req, res, next) {
    res.send(404)
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
    console.log(session)

    res.render('client', {
      session : session
    })
  })



}