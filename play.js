var dotenv  = require('dotenv');
var lame    = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');
var mToS    = require('./lib/milli-time.js');

dotenv.load();

var uri = 'spotify:track:40pPI2TbaYSZlKfV44HRjn';

// Spotify credentials from `.env`
var username = process.env.USERNAME;
var password = process.env.PASSWORD;

Spotify.login(username, password, function(err, spotify) {
    if(err) throw err;

    // first get a "Track" instance from the track URI
    spotify.get(uri, function(err, track) {
        if(err) throw err;

        console.log('[Playing] %s — %s (%s)', track.artist[0].name, track.name, mToS(track.duration));

        // play() returns a readable stream of MP3 audio data
        track.play()
            .pipe(new lame.Decoder())
            .pipe(new Speaker())
            .on('finish', function() {
                spotify.disconnect();
        });

    });
});
