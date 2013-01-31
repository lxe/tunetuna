socket.emit('player_init')

socket.on('playing', function(playing_data) {
  loadPlayer(playing_data.song.id)
});

var loadPlayer = function(songId, callback) {
  swfobject.embedSWF("http://grooveshark.com/songWidget.swf", "player", "100%", "40", "9.0.0", "", {
    songIDs : songId,
    p : 1
  }, {
    allowScriptAccess : "always"
  }, {
    id   :"player", 
    name :"player"
  }, function(e) {
    var element = e.ref;
    if (element) {
      setTimeout(function() {
        window.player = element;
      }, 1500);
    
      if (callback) callback()
    } else {   }
  });
}


