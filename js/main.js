require('./animationShim.js');
var renderer = require('./renderer.js');
var Player = require('./player.js');
var wasd = require('./wasd.js');
var level = require('./level.js');

var world = [];

window.onload = function() {
    window.ondragstart = function() { return false; };
    var newGame = document.getElementById('newgame');
    var canvas = document.getElementById('gameView');
    var opening = document.getElementById('opening');
    var startGame = function() {
        newGame.removeEventListener('click',  startGame);
        world = [];
        var player = Player({controller: wasd, renderer: renderer, img: 0, pos: {x: 0, y: 0, rot: 0}});
        renderer.init({level: level({player: player, world: world, renderer: renderer}), canvas: 'gameView', world: world, pov: player});

        canvas.style.opacity = 1;
        opening.style.opacity = 0;
        renderer.start();
        wasd.start();
    };

    splash.width = window.innerWidth;
    splash.style.top = ((window.innerHeight - splash.height) / 2) + 'px';
    newGame.style.top = ((window.innerHeight / 2) ) + 'px';
    newGame.style.left = ((window.innerWidth / 2) -  newGame.width / 2 ) + 'px';
    splash.style.opacity = 1;
    newGame.style.opacity = 0.5;
    canvas.setAttribute('width', 4500);//splash.width);
    canvas.setAttribute('height', 2100);//splash.height);
    canvas.style.width = splash.width + 'px';
    canvas.style.height = splash.height + 'px';
    canvas.style.top = ((window.innerHeight - splash.height) / 2) + 'px';

    window.gameOver = function() {
        wasd.stop();
        var t = setTimeout(function() {
            opening.style.opacity = 1;
            newGame.style.opacity = 0.5;
            canvas.style.opacity = 0;
            newGame.addEventListener('click',  startGame);
            var t = setTimeout(function() {
                renderer.stop();
            }, 500);

        }, 500);

    }
    newGame.addEventListener('click',  startGame);
    newGame.addEventListener('mouseout',  function(e) {
        newGame.style.opacity = .5;
    });
    newGame.addEventListener('mouseover',  function(e) {
        newGame.style.opacity = .75;
    });
};



//renderer.step();
//renderer.step();



