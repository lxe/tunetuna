/**
 * 
 */

var ts = require('./tinysong')
  , _  = require('lodash')
  , gs = require('grooveshark')
  , client = new gs('collab_aleksey', '45b98aae57815d5fdbae7fcd38276982');

var gsCountry;

client.request('getCountry', {
  ip : '71.206.192.19',
}, function(err, status, country) {
  gsCountry = country
});

function process_youtube(q, callback) {
  client.request('getSongSearchResults', {
    country : gsCountry,
    query   : q,
    limit   : 10
  }, function(err, status, results) {

    if (!results || !results.songs || !results.songs.length) {
      return callback(err)
    }

    var songs = _.sortBy(results.songs, function(song) {
      var words = _.compact([song.SongName, song.ArtistName]
        .join(' ')
        .split(/[^\w]/))

      var weight = 0;
      _.each(words, function(word) {
        weight += new RegExp(word, 'i').test(q) ? 1 : -1
      })

      return weight;
    })

    var s = songs.pop()
    callback(null, {
      title  : s.SongName,
      artist : s.ArtistName,
      id     : s.SongID
    })    
  })
}

var songs = []
  , playing
  , seconds_played = 0
  , seconds_total = 0
  , duration_update

function play_next(socket) {
  if (!songs.length) return;
  playing = songs.shift()

  client.request('getStreamKeyStreamServer', {
    songID : playing.id,
    country : gsCountry
  }, function(err, status, result) {
    if (err) return socket.emit('error', err);
    seconds_total = result.uSecs / 1E6;
    seconds_played = 0;
    clearInterval(duration_update);
    duration_update = setInterval(function() {
      seconds_played++;

      if (seconds_played % 5 == 0) {
        socket.emit('progress', seconds_played)
        socket.broadcast.emit('progress', seconds_played)
      }

      if (seconds_played >= seconds_total) {
        clearInterval(duration_update);
        play_next(socket)
      }
    }, 1000)
    update_playing(socket, true)
    update_songs(socket, true)
  })
  
}

function update_songs(socket, broadcast) {
  socket.emit('songs', songs)
  if (broadcast) socket.broadcast.emit('songs', songs)
}

function update_playing(socket, broadcast) {
  var playing_data = {
    song           : playing,
    seconds_played : seconds_played,
    seconds_total  : seconds_total
  }
  socket.emit('playing', playing_data)
  if (broadcast) socket.broadcast.emit('playing', playing_data)
}

Array.prototype.move = function (old_index, new_index) {
  while (old_index < 0) {
    old_index += this.length;
  }
  while (new_index < 0) {
    new_index += this.length;
  }
  if (new_index >= this.length) {
    var k = new_index - this.length;
    while ((k--) + 1) {
      this.push(undefined);
    }
  }
  this.splice(new_index, 0, this.splice(old_index, 1)[0]);
  return this; // for testing purposes
};

module.exports = exports = function(io) {

  io.sockets.on('connection', function (socket) {
    if (songs.length) update_songs(socket)
    if (playing) update_playing(socket)

    socket.votes = { }

    function get_song_position(songs, id) {
      for (i = 0; i < songs.length; i++) {
        if (songs[i].id == id) return i
      }
    }

    socket.on('up', function(id) { 
      if (socket.votes[id]) return;
      socket.votes[id] = true;

      var song_position = get_song_position(songs, id)
      songs.move(song_position, Math.round(song_position / 3));

      console.log(songs)

      update_songs(socket, true)
    })

    socket.on('down', function(id) { 
      if (socket.votes[id]) return;
      socket.votes[id] = true;

      var song_position = get_song_position(songs, id)
      songs.move(song_position, Math.round((songs.length - song_position) / 3));

      console.log(songs)

      update_songs(socket, true)    
    })

    socket.on('add', function(song) { 
      function finish(song) {
        songs.push(song);
        
        if (!playing) return play_next(socket)
        else update_songs(socket, true);
      }

      if (/youtube/i.test(song.artist)) {
        console.log('Getting youtube result ' + song.title)
        return process_youtube(song.title, function(err, song) {
          if (err) return socket.emit('error', err);
          finish(song);
        })
      } else {
        finish(song)
      }
     
    })
  });

}