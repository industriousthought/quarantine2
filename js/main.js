window.log = '';
require('./animationShim.js');
window.renderer = require('./renderer.js');
var editor = require('./editor.js');

window.onload = function() {
    window.ondragstart = function() { return false; };
    var stats = document.getElementById('stats');
    var newGame = document.getElementById('newgame');
    var canvas = document.getElementById('gameView');
    var opening = document.getElementById('opening');
    var levelEdit = document.getElementById('levelEdit');
    new Array().slice.call(document.getElementsByClassName('weapon')).forEach(function(item) {
        item.width = 100;
    });
    var startGame = function(edit, e) {
        console.log(edit);
        newGame.removeEventListener('click',  startGame);
        renderer.init({canvas: 'gameView', renderer: renderer, edit: edit});
        renderer.loadLevel('one');

        canvas.style.opacity = 1;
        opening.style.opacity = 0;
        renderer.start();
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
    stats.style.top = canvas.style.top;

    window.gameOver = function() {
        renderer.clear = true;
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
    levelEdit.addEventListener('click', startGame.bind(null, true));
    newGame.addEventListener('click',  startGame.bind(null, false));
    newGame.addEventListener('mouseout',  function(e) {
        newGame.style.opacity = .5;
    });
    newGame.addEventListener('mouseover',  function(e) {
        newGame.style.opacity = .75;
    });
};



//renderer.step();
//renderer.step();



