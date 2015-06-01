var restify = require('restify');
var fs = require('fs');
var Twit = require('twit');

var T = new Twit({
    consumer_key:         'p7bFt2ODwplOvAWG4LnanLlTq'
  , consumer_secret:      '3gaeprt1mCUWBE8IObbuYykL9CnjFe3H3aWQyTe2fUnjCmH6Xj'
  , access_token:         '15255001-HGbEbjBLX6QKARRGFqF3uHbD0K69vcxNaWvqkEUPN'
  , access_token_secret:  'pgC0uOlWIlHNCLpw7ss56sL9JIw3PmEuYMFeJba0xTSUe'
})

rad2deg = function(angle) {
  return angle * 57.29577951308232; // angle / Math.PI * 180
}
deg2rad = function(angle) {
  return angle * .017453292519943295; // (angle / 180) * Math.PI;
}
function cos(arg) {
  return Math.cos(arg);
}

getTweets = function(req, res, next) {

  //  search twitter for all tweets from location
  var spec     = req.params;
  var options  = {}
  var lat      = spec.lat    ? spec.lat    : '40.7207919',
      lon      = spec.lon    ? spec.lon    : '-74.0007582',
      r        = spec.radius ? spec.radius : '1km',
      lang     = spec.lang   ? spec.lang   : false,
      query    = spec.q      ? spec.q      : '-filter:retweets',
      count    = spec.count  ? spec.count  : 100,
      cursor   = spec.cursor ? spec.cursor : false,
      max_id   = spec.max_id ? spec.max_id : false,
      since_id = spec.since_id ? spec.since_id : false;

      if (query)    options['q']   = query;
      if (lang)     options['lang'] = lang;
      if (count)    options['count'] = count;
      if (cursor)   options['cursor'] = cursor;
      if (max_id)   options['max_id'] = max_id;
      if (since_id) options['since_id'] = since_id;

      options['geocode'] = [lat, lon, r];
      options['result_type'] = 'recent'; // 'recent', 'popular', 'mixed'

  //
  // :: search all tweets
  //
  T.get('search/tweets', options, function(err, data, response) {
    res.send(data);
    console.log(options);
  });

  //
  // :: filter the twitter public stream by the word 'mango'.
  //
  // var _rad = 1;    // 1km
  // var _R   = 6371; // earth's mean radius, km
  // // first-cut bounding box (in degrees)
  // var _maxLat = lat + rad2deg(_rad/_R);
  // var _minLat = lat - rad2deg(_rad/_R);
  // // compensate for degrees longitude getting smaller with increasing latitude
  // var _maxLon = lon + rad2deg(_rad/_R/cos(deg2rad(lat)));
  // var _minLon = lon - rad2deg(_rad/_R/cos(deg2rad(lat)));
  // // var bounding = _maxLat +","+ _maxLon +","+ _minLat +","+ _minLon;
  // var bounding = lat +","+ lon;

  // var stream_options = {
  //   track: query,
  //   // locations: "-122.75,36.8,-121.75,37.8"
  //   // locations: bounding
  //   coordinates: bounding
  // };
  // var stream = T.stream('statuses/filter', stream_options)

  // console.log(lat, lon);
  // console.log(bounding);

  // stream.on('tweet', function (tweet) {
  //   console.log(stream_options)
  //   res.send(tweet);
  // })


  next();
}


var server = restify.createServer();

server.use(restify.queryParser());
server.get('/api', getTweets);
server.get(/\/?.*/, restify.serveStatic({
  directory: './public',
  default: 'index.html'
}));


var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
