var keyTimer
  , $search   = $('#search')
  , $loading  = $('#loading')
  , $results  = $('#results')
  , $underlay = $('#underlay')
  , overlays = [ $loading, $results ]

toggle_overlay(false)

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
        results.unshift({
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
      toggle_overlay(true, $results)
      apply_actions()
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
    toggle_overlay(false)
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
  toggle_overlay(false);
  $search.val('');
  $search.focus()
}

/**
 * [toggle_overlay description]
 * @param  {[type]} show    [description]
 * @param  {[type]} overlay [description]
 * @return {[type]}         [description]
 */
function toggle_overlay(show, overlay) {
  _.each(overlays, function(o) { 
    if (!overlay) return  o[show ? 'show' : 'hide']();
    if (o == overlay) o[show ? 'show' : 'hide']();
    else o[!show ? 'show' : 'hide']();
  });

  $underlay[show ? 'show' : 'hide']();
}
