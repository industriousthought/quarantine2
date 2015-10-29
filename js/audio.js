window.AudioContext = window.AudioContext||window.webkitAudioContext;
var context = new AudioContext();

/*panner.panningModel = 'HRTF';
panner.distanceModel = 'inverse';
panner.refDistance = 1;
panner.maxDistance = 10000;
panner.rolloffFactor = 1;
panner.coneInnerAngle = 360;
panner.coneOuterAngle = 0;
panner.coneOuterGain = 0;*/

var loaded = 0;

var onError = function() {
    console.log('Audio failed to load.');
};

var sounds = [
    './audio/pistol.mp3',
    './audio/shotgun.mp3',
    './audio/machinegun.mp3',
    './audio/bat.mp3',
    './audio/zombiegrowl.mp3'
];

var i;

var done = function() {
};

for (i = 0; i < sounds.length; i++) {
    (function(i) {
        var request = new XMLHttpRequest();
        request.open('GET', sounds[i], true);
        request.responseType = 'arraybuffer';

        //Decode asynchronously
        request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                sounds[i] = buffer;
                loaded++;
                if (loaded === sounds.length) done();
            }, onError);
        }
        request.send();
    })(i)
}

var localSound = function(i) {
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = sounds[i];                    // tell the source which sound to play
    source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.playbackRate.value = 0.9 + Math.random() / 5;
    source.start(Math.random() * 2);
};

distantSound = function(pos, i) {
    var panner = context.createPanner();
    panner.setPosition(pos.x / 150, 0, pos.y / 150);
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = sounds[i];                    // tell the source which sound to play
    source.connect(panner);
    panner.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.playbackRate.value = 0.9 + Math.random() / 5;
    source.start(Math.random() * 2);
};

var events = {
    human: {
        bat: function() {
            localSound(3);
        },
        shotgun: function() {
            localSound(1);
        },
        rifle: function() {
            localSound(2);
        },
        pistol: function() {
            localSound(0);
        }
    },
    zombie: {
        growl: function(pos) {
            distantSound(pos, 4);
        }
    },
    updatePov: function(pov) {
        context.listener.setPosition(pov.x / 150, 0, pov.y / 150);
        context.listener.setOrientation(Math.cos(pov.rot), 0, Math.sin(pov.rot), 0, 1, 0);
    }
};

module.exports = events;
