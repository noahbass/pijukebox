var dotenv  = require('dotenv');
var lame    = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');

dotenv.load();

// Spotify credentials from `.env`
var username = process.env.USERNAME;
var password = process.env.PASSWORD;
var playlist = process.env.PLAYLIST;

// determine the playlist URI to use, ensure it's a "playlist" URI
var uri = 'spotify:user:' + username + ':playlist:' + playlist;
var type = Spotify.uriType(uri);

if('playlist' != type) {
    throw new Error('Must pass a "playlist" URI, got ' + JSON.stringify(type));
}

// convert milliseconds to minutes:seconds
function mToS(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);

    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// login to spotify
Spotify.login(username, password, function(err, spotify) {
    if(err) throw err;

    // get the playlist and its contents
    spotify.playlist(uri, function(err, playlist) {
        if(err) throw err;

        var tracks = [];
        var items = playlist.contents.items;

        items.forEach(function(item) {
            //if(!Array.isArray(item)) return;

            tracks.push(item);
        });

        // display the tracks in the playlist
        console.log(tracks.map(function(t) { return t.uri; }));

        // play the next track
        function nextTrack() {
            // shift to the next track in the playlist
            var track = tracks.shift();

            // disconnect if there is no track
            if(!track) return spotify.disconnect();

            // get the track
            spotify.get(track.uri, function(err, track) {
                if(err) throw err;

                var duration = mToS(track.duration);

                // display current song
                console.log('Playing: %s - %s (%s)', track.artist[0].name, track.name, duration);
                console.log('-----');

                // decode and play over speaker
                track.play()
                    .on('error', function(err) {
                        console.error(err.stack || err);
                        nextTrack();
                    })
                    .pipe(new lame.Decoder())
                    .pipe(new Speaker())
                    .on('finish', nextTrack);
            });
        }

        // init nextTrack
        nextTrack();
    });
});
