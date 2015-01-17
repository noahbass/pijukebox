var dotenv  = require('dotenv');
var lame    = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');

dotenv.load();

var uri = process.argv[2] || 'spotify:track:31qgVdvSqTQ7unwQQngycB';

// Spotify credentials from `.env`
var username = process.env.USERNAME;
var password = process.env.PASSWORD;

Spotify.login(username, password, function(err, spotify) {
  if (err) throw err;

  // first get a "Track" instance from the track URI
  spotify.get(uri, function(err, track) {
    if (err) throw err;

    console.log('Playing: %s - %s', track.artist[0].name, track.name);

    // play() returns a readable stream of MP3 audio data
    track.play()
      .pipe(new lame.Decoder())
      .pipe(new Speaker())
      .on('finish', function () {
        spotify.disconnect();
      });

  });
});
