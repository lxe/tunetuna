var $queue      = $('#queue'),
  $song_playing = $('#now-playing'),
  $progress     = $("#progress"),
  progress_timer,
  seconds_played,
  seconds_total

function update_progress() {
  $progress.css({ 
    width : ((seconds_played / seconds_total) * 100) + '%' 
  })
}

function start_progress(playing_data) {
  clearInterval(progress_timer);
  seconds_played = playing_data.seconds_played
  seconds_total = playing_data.seconds_total

  update_progress(seconds_played, seconds_total)

  progress_timer = setInterval(function() {
    seconds_played += 0.1;
    update_progress(seconds_played, seconds_total)
  }, 100)
}

socket.on('progress', function(played) {
  seconds_played = played
  update_progress()
})

socket.on('playing', function(playing_data) {
  var song = playing_data.song;
  $song_playing.html(song 
    ? templates.playing(song)
    : '<h2><i class="icon-pause"></i> No music playing</h2>');
  start_progress(playing_data)
});

socket.on('songs', function (songs) {
  console.log(songs)
  console.log(templates.songs(songs))
  console.log($queue)
  $queue.html(templates.songs(songs));
  apply_actions();
});

socket.on('error', function(err) {
  if (/array/i.test(Object.prototype.toString.call(err))) err = err.pop();
  alert(err.message)
});