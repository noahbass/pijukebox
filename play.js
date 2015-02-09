var dotenv  = require('dotenv');
var lame    = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');
var mToS    = require('./lib/milli-time.js');
//var ProgressBar = require('progress');

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

        // make a new progress bar for the song
        var blocks = 50;
        var bar = new ProgressBar(':bar', {
            total: blocks
        });

        // log the name, artist, and length of the song
        console.log('[Playing] %s — %s (%s)', track.artist[0].name, track.name, mToS(track.duration));

        // make an inital tick
        bar.tick();

        // make ticks to complete the bar
        var timer = setInterval(function() {
            bar.tick();

            if(bar.complete) {
                clearInterval(timer);
            }
        }, (track.duration) / blocks);

        // play() returns a readable stream of MP3 audio data
        track.play()
            .pipe(new lame.Decoder())
            .pipe(new Speaker())
            .on('finish', function() {
                spotify.disconnect();
        });

    });
});
