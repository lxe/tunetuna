var keyTimer
  , $search   = $('#search')
  , $results  = $('#results').hide()

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
          title : s[0].replace(/(parody|video|cover)$/g, ''),
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

$search.on('keyup', function(event) {
  clearTimeout(keyTimer)
  if (!checkValue()) return;

  keyTimer = setTimeout(function() {
    var results = []

    function populate(results) {
      $results.html(templates.results(results))

      $results.show()
      $hide_element.hide()

      apply_actions()
      $results.find('a')
        .tap(clear_search)
        .click(clear_search)
    }

    var val = $search.val();
    search_providers['youtube'](results, populate, val)
    search_providers['tinysong'](results, populate, val)
  }, 200)
});


$('#clear-search')
.tap(clear_search)
.click(clear_search)

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
  event.stopPropagation();
  $results.hide()
  $hide_element.show()
  $search.val('');
  $search.focus()
}

function apply_actions() {
  $('.action').click(function(event) {
    event.preventDefault();
    event.stopPropagation();

    var href   = $(this).attr('href').slice(1).split('/')
      , action = href.shift()
      , data   = JSON.parse(decodeURIComponent(href[0]))
      
    socket.emit(action, data)
  })
}