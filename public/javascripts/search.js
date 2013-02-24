var keyTimer
  , $search   = $('#search')
  , $results  = $('#results').hide()
  , $queue    = $('#queue')

var search_providers = {

  /**
   * Youtube search provider
   */
  youtube : function(results, callback, q) {
    $.getJSON('//suggestqueries.google.com/complete/search?callback=?&' + $.param({
      client   : 'youtube',
      ds       : 'yt',
      q        : q
    }), function(data) {

      _.each(data[1], function(s) {
        results.push({ 
          title : s[0].replace(/(parody|video|cover|lyrics)$/g, ''),
          artist : 'Youtube result'
        })
      })

      callback(results)
    });
  },

  /**
   * Original tinysong search provider
   */
  tinysong : function(results, callback, q) {
    $.get('/search/' + q + (q.length > 5 ? '*' : ''),
    function(data, status, xhr) {

      _.each(JSON.parse(data).reverse(), function(s) {
        results.push({
          title  : s.SongName,
          artist : s.ArtistName,
          id     : s.SongID,
          href   : s.Url.split('/').pop()
        })
      })

      callback(results)
    })
  }
}

$search.on('tap', function() {
  // alert('lol')
  setTimeout(function(){
    // Hide the address bar!
    // $.scrollTo($search)
    window.scrollTo(0, 98)
    // alert('lol')
  }, 200);
})

$search.on('keyup', function(event) {
  if (event.which == 13) {
    $search.blur();
    return;
  }

  clearTimeout(keyTimer)
  if (!checkValue()) return;

  keyTimer = setTimeout(function() {
    var results = []

    function populate(results) {
      $results.html(templates.results(results))

      $results.show()
      $hide_element.hide()

      apply_actions()
    }

    var val = $search.val();
    search_providers['youtube'](results, populate, val)
    search_providers['tinysong'](results, populate, val)
  }, 200)
});


$('#clear-search')
.tap(clear_search)
.mousedown(clear_search)

/**
 * [checkValue description]
 * @return {[type]} [description]
 */
function checkValue() {
  if (!$search.val().length) {
    $results.hide()
    $hide_element.show()
    return false;
  }
  return true;
}

/**
 * [clear_search description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
function clear_search(event) {
  event.preventDefault();

  $results.hide()
  $hide_element.show()
  $search.val('');
  $search.focus()
}

function hideLoadingSong() {
 $('#loading').remove()
}


function showLoadingSong() {
  $queue.append($('<li style="text-align:center" id="loading">')
    .html('<i class="icon-spinner icon-spin icon-2x"></i> Looking for song...'));

  setTimeout(function() {
    if ($queue.find('li > i').length) {
      alert('The Internet is overloaded. Hit OK to refresh.')
      location.href = location.href
    }
  }, 2000);
}

function apply_actions() {
  function executeAction(event) {
    event.preventDefault();
    event.stopPropagation();

    var href   = $(this).attr('href').slice(1).split('/')
      , action = href.shift()
      , data   = JSON.parse(decodeURIComponent(href[0]))

    $results.hide()
    $hide_element.show()
    $search.val('');
      
    socket.emit(action, data);
    window.scrollTo(0, 1);
  }


  $('.action').on($.browser.mobile ? 'tap' : 'mousedown', executeAction)
  $('.action[href^="#add"]').on($.browser.mobile ? 'tap' : 'mousedown', showLoadingSong)
}