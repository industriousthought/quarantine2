(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                                       timeToCall);
                                       lastTime = currTime + timeToCall;
                                       return id;
        };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
}());

},{}],2:[function(require,module,exports){
var Background = function(options) {

    var image = new Image();
    image.src = options.path;

    var tile = {
        type: 'tile',
        visible: true,
        img: image,
        pos: {
            x: options.pos.x,
            y: options.pos.y,
            rot: 0
        },
        step: function() {
            return true;
        },

    };

    return tile;
};

module.exports = Background;

},{}],3:[function(require,module,exports){
var lineIntersect = function(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
};

var polyIntersect = function(verts, point1, point2) {
    var j = verts.length - 1;
    return verts.reduce(function(prev, curr, index, array) {
        if (prev) return true;
        if (lineIntersect(point1.x, point1.y, point2.x, point2.y, curr.x, curr.y, array[j].x, array[j].y)) return true;
        j = index;
    }, false);

};

var perpPoint = function(v, p) {
    var k = ((v[1].y - v[0].y) * (p.x - v[0].x) - (v[1].x - v[0].x) * (p.y - v[0].y)) / (Math.pow(v[1].y - v[0].y, 2) + Math.pow(v[1].x - v[0].x, 2))
    return {x: p.x - k * (v[1].y - v[0].y), y: p.y + k * (v[1].x - v[0].x)};
};

var closestVertices = function(vertices, point) {
    var output = [];
    var i, dis, x, y, j;
    for (i = 0; i < vertices.length; i++) {
        x = point.x - vertices[i].x;
        y = point.y - vertices[i].y;
        dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        output.push({x: vertices[i].x, y: vertices[i].y, dis: dis});

    }

    return output.sort(function(a, b) {
        return a.dis - b.dis;
    }).slice(0, 2);

};

var pointInPolygon = function(vertices, point) {
    var c = false;
    var i, j;

    j = vertices.length - 1;

    for (i = 0; i < vertices.length; i++) {

        if ( ((vertices[i].y > point.y) !== (vertices[j].y > point.y)) &&
        (point.x < (vertices[j].x - vertices[i].x) * (point.y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x) ) {
            c = !c;
        }

        j = i;
    }

    return c;
};

var Block = function(options) {

    var i;
    var image = new Image();
    image.src = options.path;

    var verts = [
        {x: options.pos.x - options.width / 2, y: options.pos.y - options.height / 2}, 
        {x: options.pos.x + options.width / 2, y: options.pos.y - options.height / 2}, 
        {x: options.pos.x + options.width / 2, y: options.pos.y + options.height / 2}, 
        {x: options.pos.x - options.width / 2, y: options.pos.y + options.height / 2}, 
    ];

    var rot = options.pos.rot;
    var vx, vy, ox, oy;
    ox = options.pos.x;
    oy = options.pos.y;

    for (i = 0; i < verts.length; i++) {
        vx = verts[i].x;
        vy = verts[i].y;
        verts[i].x = Math.cos(rot) * (vx - ox) - Math.sin(rot) * (vy - oy) + ox;
        verts[i].y = Math.sin(rot) * (vx - ox) + Math.cos(rot) * (vy - oy) + oy;
    }

    var block = {
        geometry: 'block',
        type: 'block',
        visible: true,
        img: image,
        pos: options.pos,
        width: options.width,
        height: options.height,
        vertices: verts,
        testPoint: function(point) {
            var result = false;
            if (pointInPolygon(verts, point)) {
                result = perpPoint(closestVertices(verts, point), point);
            }
            return result;
        },
        collision: {},
        step: function() {
            return true;
        },
        oclude: function(point1, point2) {
            return polyIntersect(verts, point1, point2);
        }
    };

    return block;
};

module.exports = Block;


},{}],4:[function(require,module,exports){
var image = new Image();
image.src = './img/bullet.png';

var Bullet = function(options) {

    var bullet = {
        geometry: 'circle',
        type: 'bullet',
        visible: true,
        radius: 10,
        img: image,
        velocity: 30,
        pos: {
            x: options.x,
            y: options.y,
            rot: options.rot
        },
        step: function() {
            if (this.die) return false;
            this.pos.x += Math.cos(this.pos.rot) * this.velocity;
            this.pos.y += Math.sin(this.pos.rot) * this.velocity;
            return true;
        },
        collision: {
            zombie: function() {
                this.die = true;
            },
            human: function() {

            },
            bullet: function() {

            },
            block: function() {
                this.die = true;
            },
            goal: function() {}
        }
    };

    return bullet;

};

module.exports = Bullet;

},{}],5:[function(require,module,exports){
module.exports = function(options) {
    var spriteMaps = options.sprites.map(function(path) { 
        var img = new Image();
        img.src = path;
        return img;
    });
    var mode = options.mode;
    var texMap = options.texMap;
    var modes = options.modes;
    var collision = options.collision;
    var type = options.type;
    var radius = options.radius;
    var renderer = options.renderer;
    var health = options.health;
    var target = options.target;
    return function(options) {
        var aniTick = 0;
        var effects = [];
        var newEffects = [];
        var img = spriteMaps[options.img];
        var character = {
            animate: true,
            visible: true,
            geometry: 'circle',
            target: target,
            id: options.img,
            step: function() {
                if (this.animate) {
                    aniTick++;
                    if (aniTick > 16 - this.velocity) {
                        aniTick = 0;
                        if (this.pose.x < texMap.slides[this.pose.y] - 1) {
                            this.pose.x++;
                        } else {
                            this.pose.x = 0;
                        }
                    } else {
                        aniTick++;
                    }
                }
                if (!this.controller) {
                    this.pos.x += Math.cos(this.pos.rot) * this.velocity;
                    this.pos.y += Math.sin(this.pos.rot) * this.velocity;
                }
                effects = effects.filter((function(item) { return item.call(this); }).bind(this));
                effects = effects.concat(newEffects);
                newEffects = [];
                return !this.die;
            },
            pos: options.pos,
            img: img, 
            move: function(pos) {
                this.pos = pos;
            },
            texMap: texMap,
            addEffect: function(fn) {
                newEffects.push(fn);
            },
            addMode: function(mode) {
                this.mode = mode;
                modes[mode].call(character);
            },
            pose: {x: 0, y: 0},
            velocity: 0,
            mode: mode,
            type: type,
            collision: collision,
            radius: radius,
            renderer: renderer,
            health: health
        };
        character.addEffect(function() {
            this.addMode(this.mode);
            if (this.health) {
                this.addEffect(function() {
                    if (this.health <= 0) {
                        this.addMode('dead');
                        return false;
                    }
                    return true;
                });
            }
            return false;
        });
        return character;
    };
};


},{}],6:[function(require,module,exports){
var collision = function(world) {
    world.forEach(function(collider, index, array) {
        array.slice(index + 1).forEach(function(collidee) {
            var x, y, dis, radius, ang, zombie, human, ang2, block, circle, point, oclude;
            if (collider.collision && collidee.collision) {
                if (collider.geometry === 'circle' && collidee.geometry === 'circle') {
                    x = collider.pos.x - collidee.pos.x;
                    y = collider.pos.y - collidee.pos.y;
                    dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                    radius = collider.radius + collidee.radius;

                    if ((collider.type === 'zombie' && collidee.type === 'human') || (collidee.type === 'zombie' && collider.type === 'human')) {
                        if (collider.type === 'zombie') {
                            zombie = collider;
                            human = collidee;
                        } else {
                            zombie = collidee;
                            human = collider;
                        }

                        oclude = world.filter(function(curr) {
                            if (curr.type === 'block') return true;
                            return false;
                        }).reduce(function(prev, curr) { 
                            if (prev) return true;
                            return curr.oclude(collider.pos, collidee.pos);
                        }, false);

                        if (zombie.target === human && oclude && dis > 1000) {
                            zombie.addMode('searching');
                        } else {
                        
                            ang2 = Math.abs(Math.atan2(human.pos.y - zombie.pos.y, human.pos.x - zombie.pos.x));

                            ang =  zombie.pos.rot - ang2;
                            if (!oclude && (Math.abs(ang) < Math.PI * 0.45 || dis < 500)) {
                                zombie.addMode('chasing');
                                zombie.target = human;
                            }
                        }
                    }

                    if (dis < radius) {
                        collider.collision[collidee.type].call(collider, collidee);
                        collidee.collision[collider.type].call(collidee, collider);

                    }
                }

                if ((collider.geometry === 'block' && collidee.geometry === 'circle') || (collider.geometry === 'circle' && collidee.geometry === 'block')) {
                    if (collider.geometry === 'block') {
                        block = collider;
                        circle = collidee;
                    }
                    if (collidee.geometry === 'block') {
                        block = collidee;
                        circle = collider;
                    }

                    if (circle.type !== 'goal') {
                        point = block.testPoint(circle.pos);
                        if (point) {
                            if (circle.type === 'bullet') circle.die = true;
                            circle.pos.x = point.x;
                            circle.pos.y = point.y;
                        }
                    }

                }
            }
        });
    });
};

module.exports = collision;

},{}],7:[function(require,module,exports){
var Tile = require('./background.js');
var Zombie = require('./zombie.js');
var Block = require('./block.js');

var level = function(options) {
    var renderer = options.renderer;
    var world = options.world;
    var player = options.player;
    var i, j;
    for (i = 0; i < 10; i++) {
        for (j = 0; j < 10; j++) {
            world.push(Tile({pos: {x: i * 512, y: j * 512}, path: './img/background.jpg'}));
        }
    }

    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: i * 90 - 200, y: -200, rot: 0}, width: 100, height: 100}));
    }
    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: i * 90 - 200, y: 4800, rot: 0}, width: 100, height: 100}));
    }
    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: -200, y: i * 90 - 200, rot: 0}, width: 100, height: 100}));
    }

    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: 4800, y: i * 90 - 200, rot: 0}, width: 100, height: 100}));
    }

    world.push(Block({path: './img/car1.png', pos: {x: 300, y: 300, rot: 2}, width: 200, height: 300}));
    world.push(Block({path: './img/car2.png', pos: {x: 800, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car3.png', pos: {x: 1100, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car2.png', pos: {x: 1500, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car1.png', pos: {x: 1900, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car3.png', pos: {x: 300, y: 800, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car1.png', pos: {x: 300, y: 1100, rot: 0}, width: 200, height: 300}));

    world.push(Zombie({renderer: renderer, img: 2, pos: {x: 1900, y: 1700, rot: 0}}));
    world.push(Zombie({renderer: renderer, img: 0, pos: {x: 3400, y: 1700, rot: 0}}));
    world.push(Zombie({renderer: renderer, img: 2, pos: {x: 1900, y: 2400, rot: 0}}));
    world.push(Zombie({renderer: renderer, img: 1, pos: {x: 3700, y: 1700, rot: 0}}));
    world.push(Zombie({renderer: renderer, img: 2, pos: {x: 1500, y: 2300, rot: 0}}));
    world.push(Zombie({renderer: renderer, img: 0, pos: {x: 3900, y: 1200, rot: 0}}));

    world.push(player);

    var tick = 0;

    return function(world) {
        if (tick > 30) {
            tick = 0;
            world.push(Zombie({renderer: renderer, img: 2, pos: {x: 3500, y: 3500, rot: 0}}));
            tick = 0;
        }
        tick++;

    };
};


module.exports = level;

},{"./background.js":2,"./block.js":3,"./zombie.js":12}],8:[function(require,module,exports){
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




},{"./animationShim.js":1,"./level.js":7,"./player.js":9,"./renderer.js":10,"./wasd.js":11}],9:[function(require,module,exports){
var Bullet = require('./bullet.js');
var Character = require('./character.js');

module.exports = function(options) {

    

    var Player = Character({
        velocity: 0,
        renderer: options.renderer,
        radius: 50,
        type: 'human',
        sprites: ['./img/player.png'],
        texMap: {
            x: 6,
            y: 2,
            slides: [6, 5]
        },
        mode: 'loading',
        modes: {
            loading: function() {
                this.addEffect(function() {
                    this.addMode('standing');
                    return false;
                });
                return false;
            },
            standing: function() {
                this.pose.y = 0;

            },
            running: function() {

            },
            walking: function() {

            },
            shooting: function() {
                this.pose.y = 1;
                var tick = 11;
                this.addEffect(function() {
                    if (this.mode !== 'shooting') return false;
                    tick++;
                    if (tick > 5) { 
                        this.renderer.newItems.push(Bullet({x: this.pos.x, y: this.pos.y, rot: this.pos.rot}));
                        tick = 0;
                    }
                    return true;
                });
            }
        },
        collision: {
            zombie: function() {
                gameOver();
            },
            bullet: function() {

            },
            goal: function() {

            }
        }
    });

    var player = Player(options);
    options.controller.controlling = player;
    player.addEffect(options.controller.responseEffect);

    return player;
};

},{"./bullet.js":4,"./character.js":5}],10:[function(require,module,exports){
collision = require('./collision.js');

var step = function() {

    renderer.newItems = [];
    renderer.level(renderer.world);
    collision(renderer.world);

    renderer.canvas.width = renderer.canvas.width;
    renderer.world = renderer.world.filter(function(item) { 
        var width, height, sx, sy, i;
        if (item.visible) {
            if (item.pos.rot > Math.PI * 2) item.pos.rot -= Math.PI * 2;
            if (item.pos.rot < 0) item.pos.rot += Math.PI * 2;
            if (item.texMap) {
                width = item.img.width / item.texMap.x;
                height = item.img.height / item.texMap.y;
                sx = width * item.pose.x;
                sy = height * item.pose.y;
            } else {
                width = item.img.width;
                height = item.img.height;
                sx = 0;
                sy = 0;
            }
            var ctx = renderer.canvas.getContext('2d');
            var pos = {};
            pos.x = 2250 + (item.pos.x - pov.pos.x) - width / 2;
            pos.y = 1900 + (item.pos.y - pov.pos.y) - height / 2;
            ctx.save(); 

            ctx.translate(2250 , 1900 );
            ctx.rotate(- pov.pos.rot - Math.PI / 2);
            ctx.translate( - (2250 ), - (1900 ));
            ctx.translate( pos.x + width / 2, pos.y + height / 2);
            ctx.rotate( item.pos.rot );
            ctx.drawImage(item.img, sx, sy, width, height, - width / 2, - height / 2, width, height);

            ctx.restore(); 
        }
        return item.step.call(item); 
    });
    renderer.world = renderer.world.concat(renderer.newItems);

};
var playing = false;
var pov;
var renderer = {
    init: function(options) {
        renderer.level = options.level;
        renderer.world = options.world;
        renderer.canvas = document.getElementById(options.canvas);
        pov = options.pov;
    },
    start: function() {
        var animate = function() {
            step();
            if (playing) window.requestAnimationFrame(animate);
        };
        if (!playing) {
            playing = true;
            animate();
        }

    },
    stop: function() {
        playing = false;
    },
    step: function() {
        step();
    },
    newItems: []
};


module.exports = renderer;

},{"./collision.js":6}],11:[function(require,module,exports){
window.keysPressed = [];

var wasd = {
    x: 0,
    responseEffect: function() {
        if (this.running) {
            this.velocity = 12;
        } else {
            this.velocity = 8;
        }
        if (this.left || this.right) this.velocity *= 0.8;
        if (!this.left && !this.right && !this.up && !this.down) {
            this.animate = false;
        } else {
            this.animate = true;
        }

        if (this.up) { 
            this.pos.x += Math.cos(this.pos.rot) * this.velocity;
            this.pos.y += Math.sin(this.pos.rot) * this.velocity;
        } else {
            this.velocity = 0;
        }
        if (this.left) { 
            this.pos.x += Math.cos(this.pos.rot - Math.PI / 2) * 4;
            this.pos.y += Math.sin(this.pos.rot - Math.PI / 2) * 4;
        }
        if (this.down) { 
            this.pos.x += Math.cos(this.pos.rot - Math.PI) * 4;
            this.pos.y += Math.sin(this.pos.rot - Math.PI) * 4;
        }
        if (this.right) { 
            this.pos.x += Math.cos(this.pos.rot - Math.PI * 1.5) * 4;
            this.pos.y += Math.sin(this.pos.rot - Math.PI * 1.5) * 4;
        }
        return true;
    },
    rightClick: function(e) {
        e = e || window.event;
        if (e.which === 3 || e.button === 2) {
            wasd.x = e.clientX;
            window.addEventListener('mousemove', wasd.followMouse);
            window.addEventListener('mouseup', wasd.rightUp);
        }
    },
    leftClick: function(e) {
        if (e.which === 1 || e.button === 1) {
            wasd.controlling.addMode('shooting');
            window.addEventListener('mouseup', wasd.leftUp);
        }
    },
    followMouse: function(e) {
        e = e || window.event;
        wasd.controlling.pos.rot += (e.clientX - wasd.x) / 150;
        wasd.x = e.clientX;
    },
    rightUp: function(e) {
        e = e || window.event;
        if (e.which === 3 || e.button === 2) {
            window.removeEventListener('mousemove', wasd.followMouse);
            window.removeEventListener('mouseup', wasd.rightUp);
        }
    },
    leftUp: function(e) {
        if (e.which === 1 || e.button === 1) {
            window.removeEventListener('mouseup', wasd.leftUp);
            wasd.controlling.addMode('standing');
        }
    },
    keyDown: function(e) {
        if (keysPressed.indexOf(e.keyCode) === -1) {
            keysPressed.push(e.keyCode)
            switch (e.keyCode) {
                case 16:
                    wasd.controlling.running = true;
                    break;
                case 87: 
                    wasd.controlling.up = true;
                    wasd.controlling.down = false;
                    break;
                case 65: 
                    wasd.controlling.left = true;
                    wasd.controlling.right = false;
                    break;
                case 83: 
                    wasd.controlling.down = true;
                    wasd.controlling.up = false;
                    break;
                case 68: 
                    wasd.controlling.right = true;
                    wasd.controlling.left = false;
                    break;
            }
        }
    },
    keyUp: function(e) {
        keysPressed.splice(keysPressed.indexOf(e.keyCode), 1);
        switch (e.keyCode) {
            case 16:
                wasd.controlling.running = false;
                break;
            case 87: 
                wasd.controlling.up = false;
                if (keysPressed.indexOf(83) !== -1) wasd.controlling.down = true;
                break;
            case 65: 
                wasd.controlling.left = false;
                if (keysPressed.indexOf(68) !== -1) wasd.controlling.right = true;
                break;
            case 83: 
                wasd.controlling.down = false;
                if (keysPressed.indexOf(87) !== -1) wasd.controlling.up = true;
                break;
            case 68: 
                wasd.controlling.right = false;
                if (keysPressed.indexOf(65) !== -1) wasd.controlling.left = true;
                break;
        }

    },
    start: function() {
        window.addEventListener('mousedown', wasd.rightClick);
        window.addEventListener('mousedown', wasd.leftClick);

        window.addEventListener('keydown', wasd.keyDown);

        window.addEventListener('keyup', wasd.keyUp);

    },
    stop: function() {
        window.removeEventListener('mousedown', wasd.rightClick);
        window.removeEventListener('mousedown', wasd.leftClick);

        window.removeEventListener('keydown', wasd.keyDown);

        window.removeEventListener('keyup', wasd.keyUp);

    },

    controlling: null

};

window.oncontextmenu = function(e) {
    e.preventDefault();
};


module.exports = wasd;

},{}],12:[function(require,module,exports){
var Character = require('./character.js');

module.exports = function(options) {
    

    var Zombie = Character({
        target: undefined,
        renderer: options.renderer,
        health: 100,
        radius: 50,
        type: 'zombie',
        sprites: ['./img/zombie1.png', './img/zombie2.png', './img/zombie3.png'],
        texMap: {
            x: 6,
            y: 4,
            slides: [6, 5, 3, 3]
        },
        mode: 'wandering',
        modes: {
            wandering: function() {
                //console.log('wandering');
                var timeLength = 1 + parseInt(Math.random() * 3 * 1000);
                var startTime = Date.now();
                this.velocity = 1 + Math.random() * 2;
                this.pos.rot = Math.random() * Math.PI * 2;
                this.pose.y = 1;

                this.addEffect(function() {
                    var ellapsedTime = now - startTime;
                    var now = Date.now();
                    if (this.mode !== 'wandering') {
                        return false;
                    }
                    if (startTime + timeLength  < now) {
                        this.addMode('wandering');
                        return false; 
                    }
                    return true;
                });
            },
            searching: function() {
                //console.log('searching');
                var goal = {
                    target: this,
                    pos: {
                        x: this.target.pos.x,
                        y: this.target.pos.y
                    },
                    visible: false,
                    geometry: 'circle',
                    radius: 50,
                    type: 'goal',
                    collision: {
                        human: function() {},
                        bullet: function() {},
                        block: function() {},
                        goal: function() {},
                        zombie: function(zombie) {
                            console.log('goal hit');
                            if (zombie === this.target) {
                                console.log('zombie match');
                                this.die = true;
                            }
                        }
                    },
                    step: function() {
                        if (!this.die) return true;
                        return false
                    }

                }
                this.renderer.newItems.push(goal);
                this.target = undefined;
                window.g = goal;
            },
            chasing: function() {
                //console.log('chasing');
                this.pose.y = 1;
                this.velocity = 3;
                this.addEffect(function() {
                    if (this.mode !== 'chasing') return false;
                    this.pos.rot = Math.atan2( this.target.pos.y - this.pos.y, this.target.pos.x - this.pos.x);
                    return true;
                });

            },
            running: function() {
            },
            biting: function() {
            },
            staggering: function() {
            },
            dead: function() {
                var start = Date.now();
                this.pose.y = 3;
                this.velocity = 0;
                this.geometry = 'none';
                this.addEffect(function() {
                    if (this.pose.x === 2) {
                        this.animate = false;
                        return false;
                    }
                    return true;
                });
                this.addEffect(function() {
                    if (Date.now() - start > 5000) this.die = true;
                    return true;
                });
            }
        },
        collision: {
            human: function() {
            },
            zombie: function(zombie) {
                var x = this.pos.x - zombie.pos.x;
                var y = this.pos.y - zombie.pos.y;
                var start = Date.now();

                this.addEffect(function() {
                    var elapsed = Date.now() - start;
                    if (elapsed > 50) return false;
                    this.pos.x -= (100 - x) / 30;
                    this.pos.y -= (100 - y) / 30;
                    return true;
                });
            },
            bullet: function(bullet) {
                var x = Math.cos(bullet.pos.rot) * 30;
                var y = Math.sin(bullet.pos.rot) * 30;
                var start = Date.now();
                this.health -= 20;

                this.addEffect(function() {
                    var elapsed = Date.now() - start;
                    if (elapsed > 75) return false;
                    this.pos.x += x;
                    this.pos.y += y;
                    return true;
                });
            },
            goal: function(block) {
                if (block.target === this) {
                    this.target = undefined;
                    this.addMode('wandering');
                }
            }
        }
    });

    return Zombie(options);
};

},{"./character.js":5}]},{},[8])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImFuaW1hdGlvblNoaW0uanMiLCJiYWNrZ3JvdW5kLmpzIiwiYmxvY2suanMiLCJidWxsZXQuanMiLCJjaGFyYWN0ZXIuanMiLCJjb2xsaXNpb24uanMiLCJsZXZlbC5qcyIsIm1haW4uanMiLCJwbGF5ZXIuanMiLCJyZW5kZXJlci5qcyIsIndhc2QuanMiLCJ6b21iaWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHZhciB2ZW5kb3JzID0gWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXTtcbiAgICBmb3IodmFyIHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSBcbiAgICAgICAgICAgIHx8IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICB9XG5cbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVUb0NhbGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpXG4gICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICB9O1xufSgpKTtcbiIsInZhciBCYWNrZ3JvdW5kID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2Uuc3JjID0gb3B0aW9ucy5wYXRoO1xuXG4gICAgdmFyIHRpbGUgPSB7XG4gICAgICAgIHR5cGU6ICd0aWxlJyxcbiAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgaW1nOiBpbWFnZSxcbiAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICB4OiBvcHRpb25zLnBvcy54LFxuICAgICAgICAgICAgeTogb3B0aW9ucy5wb3MueSxcbiAgICAgICAgICAgIHJvdDogMFxuICAgICAgICB9LFxuICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgfTtcblxuICAgIHJldHVybiB0aWxlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrZ3JvdW5kO1xuIiwidmFyIGxpbmVJbnRlcnNlY3QgPSBmdW5jdGlvbihhLGIsYyxkLHAscSxyLHMpIHtcbiAgICB2YXIgZGV0LCBnYW1tYSwgbGFtYmRhO1xuICAgIGRldCA9IChjIC0gYSkgKiAocyAtIHEpIC0gKHIgLSBwKSAqIChkIC0gYik7XG4gICAgaWYgKGRldCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGFtYmRhID0gKChzIC0gcSkgKiAociAtIGEpICsgKHAgLSByKSAqIChzIC0gYikpIC8gZGV0O1xuICAgICAgICBnYW1tYSA9ICgoYiAtIGQpICogKHIgLSBhKSArIChjIC0gYSkgKiAocyAtIGIpKSAvIGRldDtcbiAgICAgICAgcmV0dXJuICgwIDwgbGFtYmRhICYmIGxhbWJkYSA8IDEpICYmICgwIDwgZ2FtbWEgJiYgZ2FtbWEgPCAxKTtcbiAgICB9XG59O1xuXG52YXIgcG9seUludGVyc2VjdCA9IGZ1bmN0aW9uKHZlcnRzLCBwb2ludDEsIHBvaW50Mikge1xuICAgIHZhciBqID0gdmVydHMubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gdmVydHMucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cnIsIGluZGV4LCBhcnJheSkge1xuICAgICAgICBpZiAocHJldikgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChsaW5lSW50ZXJzZWN0KHBvaW50MS54LCBwb2ludDEueSwgcG9pbnQyLngsIHBvaW50Mi55LCBjdXJyLngsIGN1cnIueSwgYXJyYXlbal0ueCwgYXJyYXlbal0ueSkpIHJldHVybiB0cnVlO1xuICAgICAgICBqID0gaW5kZXg7XG4gICAgfSwgZmFsc2UpO1xuXG59O1xuXG52YXIgcGVycFBvaW50ID0gZnVuY3Rpb24odiwgcCkge1xuICAgIHZhciBrID0gKCh2WzFdLnkgLSB2WzBdLnkpICogKHAueCAtIHZbMF0ueCkgLSAodlsxXS54IC0gdlswXS54KSAqIChwLnkgLSB2WzBdLnkpKSAvIChNYXRoLnBvdyh2WzFdLnkgLSB2WzBdLnksIDIpICsgTWF0aC5wb3codlsxXS54IC0gdlswXS54LCAyKSlcbiAgICByZXR1cm4ge3g6IHAueCAtIGsgKiAodlsxXS55IC0gdlswXS55KSwgeTogcC55ICsgayAqICh2WzFdLnggLSB2WzBdLngpfTtcbn07XG5cbnZhciBjbG9zZXN0VmVydGljZXMgPSBmdW5jdGlvbih2ZXJ0aWNlcywgcG9pbnQpIHtcbiAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgdmFyIGksIGRpcywgeCwgeSwgajtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgeCA9IHBvaW50LnggLSB2ZXJ0aWNlc1tpXS54O1xuICAgICAgICB5ID0gcG9pbnQueSAtIHZlcnRpY2VzW2ldLnk7XG4gICAgICAgIGRpcyA9IE1hdGguc3FydChNYXRoLnBvdyh4LCAyKSArIE1hdGgucG93KHksIDIpKTtcbiAgICAgICAgb3V0cHV0LnB1c2goe3g6IHZlcnRpY2VzW2ldLngsIHk6IHZlcnRpY2VzW2ldLnksIGRpczogZGlzfSk7XG5cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0cHV0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYS5kaXMgLSBiLmRpcztcbiAgICB9KS5zbGljZSgwLCAyKTtcblxufTtcblxudmFyIHBvaW50SW5Qb2x5Z29uID0gZnVuY3Rpb24odmVydGljZXMsIHBvaW50KSB7XG4gICAgdmFyIGMgPSBmYWxzZTtcbiAgICB2YXIgaSwgajtcblxuICAgIGogPSB2ZXJ0aWNlcy5sZW5ndGggLSAxO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgaWYgKCAoKHZlcnRpY2VzW2ldLnkgPiBwb2ludC55KSAhPT0gKHZlcnRpY2VzW2pdLnkgPiBwb2ludC55KSkgJiZcbiAgICAgICAgKHBvaW50LnggPCAodmVydGljZXNbal0ueCAtIHZlcnRpY2VzW2ldLngpICogKHBvaW50LnkgLSB2ZXJ0aWNlc1tpXS55KSAvICh2ZXJ0aWNlc1tqXS55IC0gdmVydGljZXNbaV0ueSkgKyB2ZXJ0aWNlc1tpXS54KSApIHtcbiAgICAgICAgICAgIGMgPSAhYztcbiAgICAgICAgfVxuXG4gICAgICAgIGogPSBpO1xuICAgIH1cblxuICAgIHJldHVybiBjO1xufTtcblxudmFyIEJsb2NrID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIGk7XG4gICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2Uuc3JjID0gb3B0aW9ucy5wYXRoO1xuXG4gICAgdmFyIHZlcnRzID0gW1xuICAgICAgICB7eDogb3B0aW9ucy5wb3MueCAtIG9wdGlvbnMud2lkdGggLyAyLCB5OiBvcHRpb25zLnBvcy55IC0gb3B0aW9ucy5oZWlnaHQgLyAyfSwgXG4gICAgICAgIHt4OiBvcHRpb25zLnBvcy54ICsgb3B0aW9ucy53aWR0aCAvIDIsIHk6IG9wdGlvbnMucG9zLnkgLSBvcHRpb25zLmhlaWdodCAvIDJ9LCBcbiAgICAgICAge3g6IG9wdGlvbnMucG9zLnggKyBvcHRpb25zLndpZHRoIC8gMiwgeTogb3B0aW9ucy5wb3MueSArIG9wdGlvbnMuaGVpZ2h0IC8gMn0sIFxuICAgICAgICB7eDogb3B0aW9ucy5wb3MueCAtIG9wdGlvbnMud2lkdGggLyAyLCB5OiBvcHRpb25zLnBvcy55ICsgb3B0aW9ucy5oZWlnaHQgLyAyfSwgXG4gICAgXTtcblxuICAgIHZhciByb3QgPSBvcHRpb25zLnBvcy5yb3Q7XG4gICAgdmFyIHZ4LCB2eSwgb3gsIG95O1xuICAgIG94ID0gb3B0aW9ucy5wb3MueDtcbiAgICBveSA9IG9wdGlvbnMucG9zLnk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdmVydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdnggPSB2ZXJ0c1tpXS54O1xuICAgICAgICB2eSA9IHZlcnRzW2ldLnk7XG4gICAgICAgIHZlcnRzW2ldLnggPSBNYXRoLmNvcyhyb3QpICogKHZ4IC0gb3gpIC0gTWF0aC5zaW4ocm90KSAqICh2eSAtIG95KSArIG94O1xuICAgICAgICB2ZXJ0c1tpXS55ID0gTWF0aC5zaW4ocm90KSAqICh2eCAtIG94KSArIE1hdGguY29zKHJvdCkgKiAodnkgLSBveSkgKyBveTtcbiAgICB9XG5cbiAgICB2YXIgYmxvY2sgPSB7XG4gICAgICAgIGdlb21ldHJ5OiAnYmxvY2snLFxuICAgICAgICB0eXBlOiAnYmxvY2snLFxuICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICBpbWc6IGltYWdlLFxuICAgICAgICBwb3M6IG9wdGlvbnMucG9zLFxuICAgICAgICB3aWR0aDogb3B0aW9ucy53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBvcHRpb25zLmhlaWdodCxcbiAgICAgICAgdmVydGljZXM6IHZlcnRzLFxuICAgICAgICB0ZXN0UG9pbnQ6IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAocG9pbnRJblBvbHlnb24odmVydHMsIHBvaW50KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHBlcnBQb2ludChjbG9zZXN0VmVydGljZXModmVydHMsIHBvaW50KSwgcG9pbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgY29sbGlzaW9uOiB7fSxcbiAgICAgICAgc3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgb2NsdWRlOiBmdW5jdGlvbihwb2ludDEsIHBvaW50Mikge1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlJbnRlcnNlY3QodmVydHMsIHBvaW50MSwgcG9pbnQyKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gYmxvY2s7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJsb2NrO1xuXG4iLCJ2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbmltYWdlLnNyYyA9ICcuL2ltZy9idWxsZXQucG5nJztcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciBidWxsZXQgPSB7XG4gICAgICAgIGdlb21ldHJ5OiAnY2lyY2xlJyxcbiAgICAgICAgdHlwZTogJ2J1bGxldCcsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIHJhZGl1czogMTAsXG4gICAgICAgIGltZzogaW1hZ2UsXG4gICAgICAgIHZlbG9jaXR5OiAzMCxcbiAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICB4OiBvcHRpb25zLngsXG4gICAgICAgICAgICB5OiBvcHRpb25zLnksXG4gICAgICAgICAgICByb3Q6IG9wdGlvbnMucm90XG4gICAgICAgIH0sXG4gICAgICAgIHN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGllKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnBvcy54ICs9IE1hdGguY29zKHRoaXMucG9zLnJvdCkgKiB0aGlzLnZlbG9jaXR5O1xuICAgICAgICAgICAgdGhpcy5wb3MueSArPSBNYXRoLnNpbih0aGlzLnBvcy5yb3QpICogdGhpcy52ZWxvY2l0eTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBjb2xsaXNpb246IHtcbiAgICAgICAgICAgIHpvbWJpZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWUgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGh1bWFuOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJ1bGxldDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBibG9jazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWUgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdvYWw6IGZ1bmN0aW9uKCkge31cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gYnVsbGV0O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBzcHJpdGVNYXBzID0gb3B0aW9ucy5zcHJpdGVzLm1hcChmdW5jdGlvbihwYXRoKSB7IFxuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5zcmMgPSBwYXRoO1xuICAgICAgICByZXR1cm4gaW1nO1xuICAgIH0pO1xuICAgIHZhciBtb2RlID0gb3B0aW9ucy5tb2RlO1xuICAgIHZhciB0ZXhNYXAgPSBvcHRpb25zLnRleE1hcDtcbiAgICB2YXIgbW9kZXMgPSBvcHRpb25zLm1vZGVzO1xuICAgIHZhciBjb2xsaXNpb24gPSBvcHRpb25zLmNvbGxpc2lvbjtcbiAgICB2YXIgdHlwZSA9IG9wdGlvbnMudHlwZTtcbiAgICB2YXIgcmFkaXVzID0gb3B0aW9ucy5yYWRpdXM7XG4gICAgdmFyIHJlbmRlcmVyID0gb3B0aW9ucy5yZW5kZXJlcjtcbiAgICB2YXIgaGVhbHRoID0gb3B0aW9ucy5oZWFsdGg7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0O1xuICAgIHJldHVybiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciBhbmlUaWNrID0gMDtcbiAgICAgICAgdmFyIGVmZmVjdHMgPSBbXTtcbiAgICAgICAgdmFyIG5ld0VmZmVjdHMgPSBbXTtcbiAgICAgICAgdmFyIGltZyA9IHNwcml0ZU1hcHNbb3B0aW9ucy5pbWddO1xuICAgICAgICB2YXIgY2hhcmFjdGVyID0ge1xuICAgICAgICAgICAgYW5pbWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICBnZW9tZXRyeTogJ2NpcmNsZScsXG4gICAgICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgIGlkOiBvcHRpb25zLmltZyxcbiAgICAgICAgICAgIHN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pVGljaysrO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYW5pVGljayA+IDE2IC0gdGhpcy52ZWxvY2l0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pVGljayA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wb3NlLnggPCB0ZXhNYXAuc2xpZGVzW3RoaXMucG9zZS55XSAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2UueCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc2UueCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmlUaWNrKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueCArPSBNYXRoLmNvcyh0aGlzLnBvcy5yb3QpICogdGhpcy52ZWxvY2l0eTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueSArPSBNYXRoLnNpbih0aGlzLnBvcy5yb3QpICogdGhpcy52ZWxvY2l0eTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWZmZWN0cyA9IGVmZmVjdHMuZmlsdGVyKChmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpdGVtLmNhbGwodGhpcyk7IH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIGVmZmVjdHMgPSBlZmZlY3RzLmNvbmNhdChuZXdFZmZlY3RzKTtcbiAgICAgICAgICAgICAgICBuZXdFZmZlY3RzID0gW107XG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aGlzLmRpZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwb3M6IG9wdGlvbnMucG9zLFxuICAgICAgICAgICAgaW1nOiBpbWcsIFxuICAgICAgICAgICAgbW92ZTogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGV4TWFwOiB0ZXhNYXAsXG4gICAgICAgICAgICBhZGRFZmZlY3Q6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgICAgICAgICAgbmV3RWZmZWN0cy5wdXNoKGZuKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZGRNb2RlOiBmdW5jdGlvbihtb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlID0gbW9kZTtcbiAgICAgICAgICAgICAgICBtb2Rlc1ttb2RlXS5jYWxsKGNoYXJhY3Rlcik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9zZToge3g6IDAsIHk6IDB9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IDAsXG4gICAgICAgICAgICBtb2RlOiBtb2RlLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGNvbGxpc2lvbjogY29sbGlzaW9uLFxuICAgICAgICAgICAgcmFkaXVzOiByYWRpdXMsXG4gICAgICAgICAgICByZW5kZXJlcjogcmVuZGVyZXIsXG4gICAgICAgICAgICBoZWFsdGg6IGhlYWx0aFxuICAgICAgICB9O1xuICAgICAgICBjaGFyYWN0ZXIuYWRkRWZmZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5hZGRNb2RlKHRoaXMubW9kZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5oZWFsdGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kZSgnZGVhZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNoYXJhY3RlcjtcbiAgICB9O1xufTtcblxuIiwidmFyIGNvbGxpc2lvbiA9IGZ1bmN0aW9uKHdvcmxkKSB7XG4gICAgd29ybGQuZm9yRWFjaChmdW5jdGlvbihjb2xsaWRlciwgaW5kZXgsIGFycmF5KSB7XG4gICAgICAgIGFycmF5LnNsaWNlKGluZGV4ICsgMSkuZm9yRWFjaChmdW5jdGlvbihjb2xsaWRlZSkge1xuICAgICAgICAgICAgdmFyIHgsIHksIGRpcywgcmFkaXVzLCBhbmcsIHpvbWJpZSwgaHVtYW4sIGFuZzIsIGJsb2NrLCBjaXJjbGUsIHBvaW50LCBvY2x1ZGU7XG4gICAgICAgICAgICBpZiAoY29sbGlkZXIuY29sbGlzaW9uICYmIGNvbGxpZGVlLmNvbGxpc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChjb2xsaWRlci5nZW9tZXRyeSA9PT0gJ2NpcmNsZScgJiYgY29sbGlkZWUuZ2VvbWV0cnkgPT09ICdjaXJjbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBjb2xsaWRlci5wb3MueCAtIGNvbGxpZGVlLnBvcy54O1xuICAgICAgICAgICAgICAgICAgICB5ID0gY29sbGlkZXIucG9zLnkgLSBjb2xsaWRlZS5wb3MueTtcbiAgICAgICAgICAgICAgICAgICAgZGlzID0gTWF0aC5zcXJ0KE1hdGgucG93KHgsIDIpICsgTWF0aC5wb3coeSwgMikpO1xuICAgICAgICAgICAgICAgICAgICByYWRpdXMgPSBjb2xsaWRlci5yYWRpdXMgKyBjb2xsaWRlZS5yYWRpdXM7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKChjb2xsaWRlci50eXBlID09PSAnem9tYmllJyAmJiBjb2xsaWRlZS50eXBlID09PSAnaHVtYW4nKSB8fCAoY29sbGlkZWUudHlwZSA9PT0gJ3pvbWJpZScgJiYgY29sbGlkZXIudHlwZSA9PT0gJ2h1bWFuJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2xsaWRlci50eXBlID09PSAnem9tYmllJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvbWJpZSA9IGNvbGxpZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh1bWFuID0gY29sbGlkZWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvbWJpZSA9IGNvbGxpZGVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh1bWFuID0gY29sbGlkZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9jbHVkZSA9IHdvcmxkLmZpbHRlcihmdW5jdGlvbihjdXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnIudHlwZSA9PT0gJ2Jsb2NrJykgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cnIpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyLm9jbHVkZShjb2xsaWRlci5wb3MsIGNvbGxpZGVlLnBvcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh6b21iaWUudGFyZ2V0ID09PSBodW1hbiAmJiBvY2x1ZGUgJiYgZGlzID4gMTAwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvbWJpZS5hZGRNb2RlKCdzZWFyY2hpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmcyID0gTWF0aC5hYnMoTWF0aC5hdGFuMihodW1hbi5wb3MueSAtIHpvbWJpZS5wb3MueSwgaHVtYW4ucG9zLnggLSB6b21iaWUucG9zLngpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZyA9ICB6b21iaWUucG9zLnJvdCAtIGFuZzI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvY2x1ZGUgJiYgKE1hdGguYWJzKGFuZykgPCBNYXRoLlBJICogMC40NSB8fCBkaXMgPCA1MDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvbWJpZS5hZGRNb2RlKCdjaGFzaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvbWJpZS50YXJnZXQgPSBodW1hbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlzIDwgcmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsaWRlci5jb2xsaXNpb25bY29sbGlkZWUudHlwZV0uY2FsbChjb2xsaWRlciwgY29sbGlkZWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlkZWUuY29sbGlzaW9uW2NvbGxpZGVyLnR5cGVdLmNhbGwoY29sbGlkZWUsIGNvbGxpZGVyKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKChjb2xsaWRlci5nZW9tZXRyeSA9PT0gJ2Jsb2NrJyAmJiBjb2xsaWRlZS5nZW9tZXRyeSA9PT0gJ2NpcmNsZScpIHx8IChjb2xsaWRlci5nZW9tZXRyeSA9PT0gJ2NpcmNsZScgJiYgY29sbGlkZWUuZ2VvbWV0cnkgPT09ICdibG9jaycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2xsaWRlci5nZW9tZXRyeSA9PT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2sgPSBjb2xsaWRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZSA9IGNvbGxpZGVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2xsaWRlZS5nZW9tZXRyeSA9PT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2sgPSBjb2xsaWRlZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZSA9IGNvbGxpZGVyO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNpcmNsZS50eXBlICE9PSAnZ29hbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50ID0gYmxvY2sudGVzdFBvaW50KGNpcmNsZS5wb3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNpcmNsZS50eXBlID09PSAnYnVsbGV0JykgY2lyY2xlLmRpZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlLnBvcy54ID0gcG9pbnQueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGUucG9zLnkgPSBwb2ludC55O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb2xsaXNpb247XG4iLCJ2YXIgVGlsZSA9IHJlcXVpcmUoJy4vYmFja2dyb3VuZC5qcycpO1xudmFyIFpvbWJpZSA9IHJlcXVpcmUoJy4vem9tYmllLmpzJyk7XG52YXIgQmxvY2sgPSByZXF1aXJlKCcuL2Jsb2NrLmpzJyk7XG5cbnZhciBsZXZlbCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgcmVuZGVyZXIgPSBvcHRpb25zLnJlbmRlcmVyO1xuICAgIHZhciB3b3JsZCA9IG9wdGlvbnMud29ybGQ7XG4gICAgdmFyIHBsYXllciA9IG9wdGlvbnMucGxheWVyO1xuICAgIHZhciBpLCBqO1xuICAgIGZvciAoaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCAxMDsgaisrKSB7XG4gICAgICAgICAgICB3b3JsZC5wdXNoKFRpbGUoe3Bvczoge3g6IGkgKiA1MTIsIHk6IGogKiA1MTJ9LCBwYXRoOiAnLi9pbWcvYmFja2dyb3VuZC5qcGcnfSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IDU3OyBpKyspIHtcbiAgICAgICAgd29ybGQucHVzaChCbG9jayh7cGF0aDogJy4vaW1nL3dhbGwucG5nJywgcG9zOiB7eDogaSAqIDkwIC0gMjAwLCB5OiAtMjAwLCByb3Q6IDB9LCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMH0pKTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IDU3OyBpKyspIHtcbiAgICAgICAgd29ybGQucHVzaChCbG9jayh7cGF0aDogJy4vaW1nL3dhbGwucG5nJywgcG9zOiB7eDogaSAqIDkwIC0gMjAwLCB5OiA0ODAwLCByb3Q6IDB9LCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMH0pKTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IDU3OyBpKyspIHtcbiAgICAgICAgd29ybGQucHVzaChCbG9jayh7cGF0aDogJy4vaW1nL3dhbGwucG5nJywgcG9zOiB7eDogLTIwMCwgeTogaSAqIDkwIC0gMjAwLCByb3Q6IDB9LCB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMH0pKTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgNTc7IGkrKykge1xuICAgICAgICB3b3JsZC5wdXNoKEJsb2NrKHtwYXRoOiAnLi9pbWcvd2FsbC5wbmcnLCBwb3M6IHt4OiA0ODAwLCB5OiBpICogOTAgLSAyMDAsIHJvdDogMH0sIHdpZHRoOiAxMDAsIGhlaWdodDogMTAwfSkpO1xuICAgIH1cblxuICAgIHdvcmxkLnB1c2goQmxvY2soe3BhdGg6ICcuL2ltZy9jYXIxLnBuZycsIHBvczoge3g6IDMwMCwgeTogMzAwLCByb3Q6IDJ9LCB3aWR0aDogMjAwLCBoZWlnaHQ6IDMwMH0pKTtcbiAgICB3b3JsZC5wdXNoKEJsb2NrKHtwYXRoOiAnLi9pbWcvY2FyMi5wbmcnLCBwb3M6IHt4OiA4MDAsIHk6IDMwMCwgcm90OiAwfSwgd2lkdGg6IDIwMCwgaGVpZ2h0OiAzMDB9KSk7XG4gICAgd29ybGQucHVzaChCbG9jayh7cGF0aDogJy4vaW1nL2NhcjMucG5nJywgcG9zOiB7eDogMTEwMCwgeTogMzAwLCByb3Q6IDB9LCB3aWR0aDogMjAwLCBoZWlnaHQ6IDMwMH0pKTtcbiAgICB3b3JsZC5wdXNoKEJsb2NrKHtwYXRoOiAnLi9pbWcvY2FyMi5wbmcnLCBwb3M6IHt4OiAxNTAwLCB5OiAzMDAsIHJvdDogMH0sIHdpZHRoOiAyMDAsIGhlaWdodDogMzAwfSkpO1xuICAgIHdvcmxkLnB1c2goQmxvY2soe3BhdGg6ICcuL2ltZy9jYXIxLnBuZycsIHBvczoge3g6IDE5MDAsIHk6IDMwMCwgcm90OiAwfSwgd2lkdGg6IDIwMCwgaGVpZ2h0OiAzMDB9KSk7XG4gICAgd29ybGQucHVzaChCbG9jayh7cGF0aDogJy4vaW1nL2NhcjMucG5nJywgcG9zOiB7eDogMzAwLCB5OiA4MDAsIHJvdDogMH0sIHdpZHRoOiAyMDAsIGhlaWdodDogMzAwfSkpO1xuICAgIHdvcmxkLnB1c2goQmxvY2soe3BhdGg6ICcuL2ltZy9jYXIxLnBuZycsIHBvczoge3g6IDMwMCwgeTogMTEwMCwgcm90OiAwfSwgd2lkdGg6IDIwMCwgaGVpZ2h0OiAzMDB9KSk7XG5cbiAgICB3b3JsZC5wdXNoKFpvbWJpZSh7cmVuZGVyZXI6IHJlbmRlcmVyLCBpbWc6IDIsIHBvczoge3g6IDE5MDAsIHk6IDE3MDAsIHJvdDogMH19KSk7XG4gICAgd29ybGQucHVzaChab21iaWUoe3JlbmRlcmVyOiByZW5kZXJlciwgaW1nOiAwLCBwb3M6IHt4OiAzNDAwLCB5OiAxNzAwLCByb3Q6IDB9fSkpO1xuICAgIHdvcmxkLnB1c2goWm9tYmllKHtyZW5kZXJlcjogcmVuZGVyZXIsIGltZzogMiwgcG9zOiB7eDogMTkwMCwgeTogMjQwMCwgcm90OiAwfX0pKTtcbiAgICB3b3JsZC5wdXNoKFpvbWJpZSh7cmVuZGVyZXI6IHJlbmRlcmVyLCBpbWc6IDEsIHBvczoge3g6IDM3MDAsIHk6IDE3MDAsIHJvdDogMH19KSk7XG4gICAgd29ybGQucHVzaChab21iaWUoe3JlbmRlcmVyOiByZW5kZXJlciwgaW1nOiAyLCBwb3M6IHt4OiAxNTAwLCB5OiAyMzAwLCByb3Q6IDB9fSkpO1xuICAgIHdvcmxkLnB1c2goWm9tYmllKHtyZW5kZXJlcjogcmVuZGVyZXIsIGltZzogMCwgcG9zOiB7eDogMzkwMCwgeTogMTIwMCwgcm90OiAwfX0pKTtcblxuICAgIHdvcmxkLnB1c2gocGxheWVyKTtcblxuICAgIHZhciB0aWNrID0gMDtcblxuICAgIHJldHVybiBmdW5jdGlvbih3b3JsZCkge1xuICAgICAgICBpZiAodGljayA+IDMwKSB7XG4gICAgICAgICAgICB0aWNrID0gMDtcbiAgICAgICAgICAgIHdvcmxkLnB1c2goWm9tYmllKHtyZW5kZXJlcjogcmVuZGVyZXIsIGltZzogMiwgcG9zOiB7eDogMzUwMCwgeTogMzUwMCwgcm90OiAwfX0pKTtcbiAgICAgICAgICAgIHRpY2sgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRpY2srKztcblxuICAgIH07XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gbGV2ZWw7XG4iLCJyZXF1aXJlKCcuL2FuaW1hdGlvblNoaW0uanMnKTtcbnZhciByZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIuanMnKTtcbnZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllci5qcycpO1xudmFyIHdhc2QgPSByZXF1aXJlKCcuL3dhc2QuanMnKTtcbnZhciBsZXZlbCA9IHJlcXVpcmUoJy4vbGV2ZWwuanMnKTtcblxudmFyIHdvcmxkID0gW107XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cub25kcmFnc3RhcnQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9O1xuICAgIHZhciBuZXdHYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld2dhbWUnKTtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVWaWV3Jyk7XG4gICAgdmFyIG9wZW5pbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3BlbmluZycpO1xuICAgIHZhciBzdGFydEdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbmV3R2FtZS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsICBzdGFydEdhbWUpO1xuICAgICAgICB3b3JsZCA9IFtdO1xuICAgICAgICB2YXIgcGxheWVyID0gUGxheWVyKHtjb250cm9sbGVyOiB3YXNkLCByZW5kZXJlcjogcmVuZGVyZXIsIGltZzogMCwgcG9zOiB7eDogMCwgeTogMCwgcm90OiAwfX0pO1xuICAgICAgICByZW5kZXJlci5pbml0KHtsZXZlbDogbGV2ZWwoe3BsYXllcjogcGxheWVyLCB3b3JsZDogd29ybGQsIHJlbmRlcmVyOiByZW5kZXJlcn0pLCBjYW52YXM6ICdnYW1lVmlldycsIHdvcmxkOiB3b3JsZCwgcG92OiBwbGF5ZXJ9KTtcblxuICAgICAgICBjYW52YXMuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIG9wZW5pbmcuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICAgIHJlbmRlcmVyLnN0YXJ0KCk7XG4gICAgICAgIHdhc2Quc3RhcnQoKTtcbiAgICB9O1xuXG4gICAgc3BsYXNoLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgc3BsYXNoLnN0eWxlLnRvcCA9ICgod2luZG93LmlubmVySGVpZ2h0IC0gc3BsYXNoLmhlaWdodCkgLyAyKSArICdweCc7XG4gICAgbmV3R2FtZS5zdHlsZS50b3AgPSAoKHdpbmRvdy5pbm5lckhlaWdodCAvIDIpICkgKyAncHgnO1xuICAgIG5ld0dhbWUuc3R5bGUubGVmdCA9ICgod2luZG93LmlubmVyV2lkdGggLyAyKSAtICBuZXdHYW1lLndpZHRoIC8gMiApICsgJ3B4JztcbiAgICBzcGxhc2guc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgbmV3R2FtZS5zdHlsZS5vcGFjaXR5ID0gMC41O1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgNDUwMCk7Ly9zcGxhc2gud2lkdGgpO1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIDIxMDApOy8vc3BsYXNoLmhlaWdodCk7XG4gICAgY2FudmFzLnN0eWxlLndpZHRoID0gc3BsYXNoLndpZHRoICsgJ3B4JztcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gc3BsYXNoLmhlaWdodCArICdweCc7XG4gICAgY2FudmFzLnN0eWxlLnRvcCA9ICgod2luZG93LmlubmVySGVpZ2h0IC0gc3BsYXNoLmhlaWdodCkgLyAyKSArICdweCc7XG5cbiAgICB3aW5kb3cuZ2FtZU92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgd2FzZC5zdG9wKCk7XG4gICAgICAgIHZhciB0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG9wZW5pbmcuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgICAgICBuZXdHYW1lLnN0eWxlLm9wYWNpdHkgPSAwLjU7XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICAgICAgICBuZXdHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgIHN0YXJ0R2FtZSk7XG4gICAgICAgICAgICB2YXIgdCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyZXIuc3RvcCgpO1xuICAgICAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICB9LCA1MDApO1xuXG4gICAgfVxuICAgIG5ld0dhbWUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAgc3RhcnRHYW1lKTtcbiAgICBuZXdHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgbmV3R2FtZS5zdHlsZS5vcGFjaXR5ID0gLjU7XG4gICAgfSk7XG4gICAgbmV3R2FtZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCAgZnVuY3Rpb24oZSkge1xuICAgICAgICBuZXdHYW1lLnN0eWxlLm9wYWNpdHkgPSAuNzU7XG4gICAgfSk7XG59O1xuXG5cblxuLy9yZW5kZXJlci5zdGVwKCk7XG4vL3JlbmRlcmVyLnN0ZXAoKTtcblxuXG5cbiIsInZhciBCdWxsZXQgPSByZXF1aXJlKCcuL2J1bGxldC5qcycpO1xudmFyIENoYXJhY3RlciA9IHJlcXVpcmUoJy4vY2hhcmFjdGVyLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgXG5cbiAgICB2YXIgUGxheWVyID0gQ2hhcmFjdGVyKHtcbiAgICAgICAgdmVsb2NpdHk6IDAsXG4gICAgICAgIHJlbmRlcmVyOiBvcHRpb25zLnJlbmRlcmVyLFxuICAgICAgICByYWRpdXM6IDUwLFxuICAgICAgICB0eXBlOiAnaHVtYW4nLFxuICAgICAgICBzcHJpdGVzOiBbJy4vaW1nL3BsYXllci5wbmcnXSxcbiAgICAgICAgdGV4TWFwOiB7XG4gICAgICAgICAgICB4OiA2LFxuICAgICAgICAgICAgeTogMixcbiAgICAgICAgICAgIHNsaWRlczogWzYsIDVdXG4gICAgICAgIH0sXG4gICAgICAgIG1vZGU6ICdsb2FkaW5nJyxcbiAgICAgICAgbW9kZXM6IHtcbiAgICAgICAgICAgIGxvYWRpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRWZmZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZE1vZGUoJ3N0YW5kaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhbmRpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zZS55ID0gMDtcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5pbmc6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2Fsa2luZzogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaG9vdGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NlLnkgPSAxO1xuICAgICAgICAgICAgICAgIHZhciB0aWNrID0gMTE7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGUgIT09ICdzaG9vdGluZycpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGljaysrO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGljayA+IDUpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goQnVsbGV0KHt4OiB0aGlzLnBvcy54LCB5OiB0aGlzLnBvcy55LCByb3Q6IHRoaXMucG9zLnJvdH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2sgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb2xsaXNpb246IHtcbiAgICAgICAgICAgIHpvbWJpZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBidWxsZXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ29hbDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHBsYXllciA9IFBsYXllcihvcHRpb25zKTtcbiAgICBvcHRpb25zLmNvbnRyb2xsZXIuY29udHJvbGxpbmcgPSBwbGF5ZXI7XG4gICAgcGxheWVyLmFkZEVmZmVjdChvcHRpb25zLmNvbnRyb2xsZXIucmVzcG9uc2VFZmZlY3QpO1xuXG4gICAgcmV0dXJuIHBsYXllcjtcbn07XG4iLCJjb2xsaXNpb24gPSByZXF1aXJlKCcuL2NvbGxpc2lvbi5qcycpO1xuXG52YXIgc3RlcCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmVuZGVyZXIubmV3SXRlbXMgPSBbXTtcbiAgICByZW5kZXJlci5sZXZlbChyZW5kZXJlci53b3JsZCk7XG4gICAgY29sbGlzaW9uKHJlbmRlcmVyLndvcmxkKTtcblxuICAgIHJlbmRlcmVyLmNhbnZhcy53aWR0aCA9IHJlbmRlcmVyLmNhbnZhcy53aWR0aDtcbiAgICByZW5kZXJlci53b3JsZCA9IHJlbmRlcmVyLndvcmxkLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7IFxuICAgICAgICB2YXIgd2lkdGgsIGhlaWdodCwgc3gsIHN5LCBpO1xuICAgICAgICBpZiAoaXRlbS52aXNpYmxlKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5wb3Mucm90ID4gTWF0aC5QSSAqIDIpIGl0ZW0ucG9zLnJvdCAtPSBNYXRoLlBJICogMjtcbiAgICAgICAgICAgIGlmIChpdGVtLnBvcy5yb3QgPCAwKSBpdGVtLnBvcy5yb3QgKz0gTWF0aC5QSSAqIDI7XG4gICAgICAgICAgICBpZiAoaXRlbS50ZXhNYXApIHtcbiAgICAgICAgICAgICAgICB3aWR0aCA9IGl0ZW0uaW1nLndpZHRoIC8gaXRlbS50ZXhNYXAueDtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBpdGVtLmltZy5oZWlnaHQgLyBpdGVtLnRleE1hcC55O1xuICAgICAgICAgICAgICAgIHN4ID0gd2lkdGggKiBpdGVtLnBvc2UueDtcbiAgICAgICAgICAgICAgICBzeSA9IGhlaWdodCAqIGl0ZW0ucG9zZS55O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aWR0aCA9IGl0ZW0uaW1nLndpZHRoO1xuICAgICAgICAgICAgICAgIGhlaWdodCA9IGl0ZW0uaW1nLmhlaWdodDtcbiAgICAgICAgICAgICAgICBzeCA9IDA7XG4gICAgICAgICAgICAgICAgc3kgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGN0eCA9IHJlbmRlcmVyLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgdmFyIHBvcyA9IHt9O1xuICAgICAgICAgICAgcG9zLnggPSAyMjUwICsgKGl0ZW0ucG9zLnggLSBwb3YucG9zLngpIC0gd2lkdGggLyAyO1xuICAgICAgICAgICAgcG9zLnkgPSAxOTAwICsgKGl0ZW0ucG9zLnkgLSBwb3YucG9zLnkpIC0gaGVpZ2h0IC8gMjtcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7IFxuXG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKDIyNTAgLCAxOTAwICk7XG4gICAgICAgICAgICBjdHgucm90YXRlKC0gcG92LnBvcy5yb3QgLSBNYXRoLlBJIC8gMik7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKCAtICgyMjUwICksIC0gKDE5MDAgKSk7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKCBwb3MueCArIHdpZHRoIC8gMiwgcG9zLnkgKyBoZWlnaHQgLyAyKTtcbiAgICAgICAgICAgIGN0eC5yb3RhdGUoIGl0ZW0ucG9zLnJvdCApO1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpdGVtLmltZywgc3gsIHN5LCB3aWR0aCwgaGVpZ2h0LCAtIHdpZHRoIC8gMiwgLSBoZWlnaHQgLyAyLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW0uc3RlcC5jYWxsKGl0ZW0pOyBcbiAgICB9KTtcbiAgICByZW5kZXJlci53b3JsZCA9IHJlbmRlcmVyLndvcmxkLmNvbmNhdChyZW5kZXJlci5uZXdJdGVtcyk7XG5cbn07XG52YXIgcGxheWluZyA9IGZhbHNlO1xudmFyIHBvdjtcbnZhciByZW5kZXJlciA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHJlbmRlcmVyLmxldmVsID0gb3B0aW9ucy5sZXZlbDtcbiAgICAgICAgcmVuZGVyZXIud29ybGQgPSBvcHRpb25zLndvcmxkO1xuICAgICAgICByZW5kZXJlci5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChvcHRpb25zLmNhbnZhcyk7XG4gICAgICAgIHBvdiA9IG9wdGlvbnMucG92O1xuICAgIH0sXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYW5pbWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc3RlcCgpO1xuICAgICAgICAgICAgaWYgKHBsYXlpbmcpIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICghcGxheWluZykge1xuICAgICAgICAgICAgcGxheWluZyA9IHRydWU7XG4gICAgICAgICAgICBhbmltYXRlKCk7XG4gICAgICAgIH1cblxuICAgIH0sXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHBsYXlpbmcgPSBmYWxzZTtcbiAgICB9LFxuICAgIHN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdGVwKCk7XG4gICAgfSxcbiAgICBuZXdJdGVtczogW11cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSByZW5kZXJlcjtcbiIsIndpbmRvdy5rZXlzUHJlc3NlZCA9IFtdO1xuXG52YXIgd2FzZCA9IHtcbiAgICB4OiAwLFxuICAgIHJlc3BvbnNlRWZmZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IDEyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGVmdCB8fCB0aGlzLnJpZ2h0KSB0aGlzLnZlbG9jaXR5ICo9IDAuODtcbiAgICAgICAgaWYgKCF0aGlzLmxlZnQgJiYgIXRoaXMucmlnaHQgJiYgIXRoaXMudXAgJiYgIXRoaXMuZG93bikge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudXApIHsgXG4gICAgICAgICAgICB0aGlzLnBvcy54ICs9IE1hdGguY29zKHRoaXMucG9zLnJvdCkgKiB0aGlzLnZlbG9jaXR5O1xuICAgICAgICAgICAgdGhpcy5wb3MueSArPSBNYXRoLnNpbih0aGlzLnBvcy5yb3QpICogdGhpcy52ZWxvY2l0eTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxlZnQpIHsgXG4gICAgICAgICAgICB0aGlzLnBvcy54ICs9IE1hdGguY29zKHRoaXMucG9zLnJvdCAtIE1hdGguUEkgLyAyKSAqIDQ7XG4gICAgICAgICAgICB0aGlzLnBvcy55ICs9IE1hdGguc2luKHRoaXMucG9zLnJvdCAtIE1hdGguUEkgLyAyKSAqIDQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZG93bikgeyBcbiAgICAgICAgICAgIHRoaXMucG9zLnggKz0gTWF0aC5jb3ModGhpcy5wb3Mucm90IC0gTWF0aC5QSSkgKiA0O1xuICAgICAgICAgICAgdGhpcy5wb3MueSArPSBNYXRoLnNpbih0aGlzLnBvcy5yb3QgLSBNYXRoLlBJKSAqIDQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHQpIHsgXG4gICAgICAgICAgICB0aGlzLnBvcy54ICs9IE1hdGguY29zKHRoaXMucG9zLnJvdCAtIE1hdGguUEkgKiAxLjUpICogNDtcbiAgICAgICAgICAgIHRoaXMucG9zLnkgKz0gTWF0aC5zaW4odGhpcy5wb3Mucm90IC0gTWF0aC5QSSAqIDEuNSkgKiA0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgcmlnaHRDbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAzIHx8IGUuYnV0dG9uID09PSAyKSB7XG4gICAgICAgICAgICB3YXNkLnggPSBlLmNsaWVudFg7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgd2FzZC5mb2xsb3dNb3VzZSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHdhc2QucmlnaHRVcCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGxlZnRDbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS53aGljaCA9PT0gMSB8fCBlLmJ1dHRvbiA9PT0gMSkge1xuICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5hZGRNb2RlKCdzaG9vdGluZycpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB3YXNkLmxlZnRVcCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGZvbGxvd01vdXNlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICAgICAgd2FzZC5jb250cm9sbGluZy5wb3Mucm90ICs9IChlLmNsaWVudFggLSB3YXNkLngpIC8gMTUwO1xuICAgICAgICB3YXNkLnggPSBlLmNsaWVudFg7XG4gICAgfSxcbiAgICByaWdodFVwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDMgfHwgZS5idXR0b24gPT09IDIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB3YXNkLmZvbGxvd01vdXNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgd2FzZC5yaWdodFVwKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgbGVmdFVwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAxIHx8IGUuYnV0dG9uID09PSAxKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHdhc2QubGVmdFVwKTtcbiAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcuYWRkTW9kZSgnc3RhbmRpbmcnKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAga2V5RG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoa2V5c1ByZXNzZWQuaW5kZXhPZihlLmtleUNvZGUpID09PSAtMSkge1xuICAgICAgICAgICAga2V5c1ByZXNzZWQucHVzaChlLmtleUNvZGUpXG4gICAgICAgICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcucnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgODc6IFxuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNjU6IFxuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLmxlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgODM6IFxuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLmRvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnVwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNjg6IFxuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5sZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBrZXlVcDogZnVuY3Rpb24oZSkge1xuICAgICAgICBrZXlzUHJlc3NlZC5zcGxpY2Uoa2V5c1ByZXNzZWQuaW5kZXhPZihlLmtleUNvZGUpLCAxKTtcbiAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg3OiBcbiAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnVwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoODMpICE9PSAtMSkgd2FzZC5jb250cm9sbGluZy5kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IFxuICAgICAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcubGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChrZXlzUHJlc3NlZC5pbmRleE9mKDY4KSAhPT0gLTEpIHdhc2QuY29udHJvbGxpbmcucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogXG4gICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoODcpICE9PSAtMSkgd2FzZC5jb250cm9sbGluZy51cCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY4OiBcbiAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoNjUpICE9PSAtMSkgd2FzZC5jb250cm9sbGluZy5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgfSxcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB3YXNkLnJpZ2h0Q2xpY2spO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgd2FzZC5sZWZ0Q2xpY2spO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgd2FzZC5rZXlEb3duKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB3YXNkLmtleVVwKTtcblxuICAgIH0sXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB3YXNkLnJpZ2h0Q2xpY2spO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgd2FzZC5sZWZ0Q2xpY2spO1xuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgd2FzZC5rZXlEb3duKTtcblxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB3YXNkLmtleVVwKTtcblxuICAgIH0sXG5cbiAgICBjb250cm9sbGluZzogbnVsbFxuXG59O1xuXG53aW5kb3cub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gd2FzZDtcbiIsInZhciBDaGFyYWN0ZXIgPSByZXF1aXJlKCcuL2NoYXJhY3Rlci5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBcblxuICAgIHZhciBab21iaWUgPSBDaGFyYWN0ZXIoe1xuICAgICAgICB0YXJnZXQ6IHVuZGVmaW5lZCxcbiAgICAgICAgcmVuZGVyZXI6IG9wdGlvbnMucmVuZGVyZXIsXG4gICAgICAgIGhlYWx0aDogMTAwLFxuICAgICAgICByYWRpdXM6IDUwLFxuICAgICAgICB0eXBlOiAnem9tYmllJyxcbiAgICAgICAgc3ByaXRlczogWycuL2ltZy96b21iaWUxLnBuZycsICcuL2ltZy96b21iaWUyLnBuZycsICcuL2ltZy96b21iaWUzLnBuZyddLFxuICAgICAgICB0ZXhNYXA6IHtcbiAgICAgICAgICAgIHg6IDYsXG4gICAgICAgICAgICB5OiA0LFxuICAgICAgICAgICAgc2xpZGVzOiBbNiwgNSwgMywgM11cbiAgICAgICAgfSxcbiAgICAgICAgbW9kZTogJ3dhbmRlcmluZycsXG4gICAgICAgIG1vZGVzOiB7XG4gICAgICAgICAgICB3YW5kZXJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3dhbmRlcmluZycpO1xuICAgICAgICAgICAgICAgIHZhciB0aW1lTGVuZ3RoID0gMSArIHBhcnNlSW50KE1hdGgucmFuZG9tKCkgKiAzICogMTAwMCk7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IDEgKyBNYXRoLnJhbmRvbSgpICogMjtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy5yb3QgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDI7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NlLnkgPSAxO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGxhcHNlZFRpbWUgPSBub3cgLSBzdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2RlICE9PSAnd2FuZGVyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGFydFRpbWUgKyB0aW1lTGVuZ3RoICA8IG5vdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRNb2RlKCd3YW5kZXJpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VhcmNoaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzZWFyY2hpbmcnKTtcbiAgICAgICAgICAgICAgICB2YXIgZ29hbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRoaXMudGFyZ2V0LnBvcy54LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogdGhpcy50YXJnZXQucG9zLnlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5OiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiA1MCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2dvYWwnLFxuICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh1bWFuOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVsbGV0OiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2s6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBnb2FsOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgem9tYmllOiBmdW5jdGlvbih6b21iaWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZ29hbCBoaXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoem9tYmllID09PSB0aGlzLnRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnem9tYmllIG1hdGNoJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGllID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmRpZSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIubmV3SXRlbXMucHVzaChnb2FsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB3aW5kb3cuZyA9IGdvYWw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2hhc2luZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnY2hhc2luZycpO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zZS55ID0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0gMztcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubW9kZSAhPT0gJ2NoYXNpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zLnJvdCA9IE1hdGguYXRhbjIoIHRoaXMudGFyZ2V0LnBvcy55IC0gdGhpcy5wb3MueSwgdGhpcy50YXJnZXQucG9zLnggLSB0aGlzLnBvcy54KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5uaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiaXRpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YWdnZXJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NlLnkgPSAzO1xuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2VvbWV0cnkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBvc2UueCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gc3RhcnQgPiA1MDAwKSB0aGlzLmRpZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb2xsaXNpb246IHtcbiAgICAgICAgICAgIGh1bWFuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB6b21iaWU6IGZ1bmN0aW9uKHpvbWJpZSkge1xuICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy5wb3MueCAtIHpvbWJpZS5wb3MueDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IHRoaXMucG9zLnkgLSB6b21iaWUucG9zLnk7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYWRkRWZmZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWxhcHNlZCA9IERhdGUubm93KCkgLSBzdGFydDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsYXBzZWQgPiA1MCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcy54IC09ICgxMDAgLSB4KSAvIDMwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcy55IC09ICgxMDAgLSB5KSAvIDMwO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBidWxsZXQ6IGZ1bmN0aW9uKGJ1bGxldCkge1xuICAgICAgICAgICAgICAgIHZhciB4ID0gTWF0aC5jb3MoYnVsbGV0LnBvcy5yb3QpICogMzA7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSBNYXRoLnNpbihidWxsZXQucG9zLnJvdCkgKiAzMDtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVhbHRoIC09IDIwO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxhcHNlZCA+IDc1KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zLnggKz0geDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueSArPSB5O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnb2FsOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgICAgICAgIGlmIChibG9jay50YXJnZXQgPT09IHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kZSgnd2FuZGVyaW5nJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gWm9tYmllKG9wdGlvbnMpO1xufTtcbiJdfQ==
