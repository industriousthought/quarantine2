(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Meelee = require('./meelee.js');

var Activation = function(options) {

    var activation = Meelee(options);

    activation.step = function() {
        return false;
    };

    activation.visible = false;

    activation.type = 'activation';

    return activation;
};


module.exports = Activation;



},{"./meelee.js":20}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var image = new Image();
image.src = './img/bullet.png';

var Bullet = function(options) {

    /*
    image.onload = function() { 
        bullet.width = image.width;
        bullet.height = image.height;
        console.log('bullet image loaded');
    };
    */

    var range = options.range;
    var velocity = options.velocity;

    var distance = 0;

    var bullet = {
        onTop: true,
        power: options.power,
        geometry: 'circle',
        type: 'bullet',
        visible: true,
        radius: 10,
        width: 50,
        height: 50,
        img: image,
        pos: {
            x: options.x,
            y: options.y,
            rot: options.rot
        },
        step: function() {
            if (this.die || distance > range) return false;
            distance++;
            this.pos.x += Math.cos(this.pos.rot) * velocity;
            this.pos.y += Math.sin(this.pos.rot) * velocity;
            return true;
        },
        collision: {
            zombie: function() {
                this.die = true;
            },
            meelee: function() {

            },
            human: function() {

            },
            bullet: function() {

            },
            block: function() {
                this.die = true;
            },
            goal: function() {},
            weapon: function() {},
            activation: function() {}

        }
    };


    return bullet;

};

module.exports = Bullet;

},{}],5:[function(require,module,exports){
var DomMenu = document.getElementsByTagName('body')[0].appendChild(document.createElement('ul'));
DomMenu.setAttribute('id', 'clickMenu');
var menuObjMouseOver = function(obj, e) {
    obj.highlight = true;
    console.log(obj + ', ' + e);
};
var menuObjMouseOut = function(obj, e) {
    console.log('mouseOut');
    obj.highlight = false;
};
var editObj = function(obj, e) {
    obj.editing = true;
    clickMenu.editing = obj;
};

var clickMenu = function(options) {

    while (DomMenu.firstChild) { DomMenu.removeChild(DomMenu.firstChild); }
    DomMenu.style.display = 'inherit';
    DomMenu.style.top = parseInt(options.mousePos.x) + 'px';
    DomMenu.style.left = parseInt(options.mousePos.y) + 'px';

    var objs = [];
    
    return clickMenu = {
        editing: false,
        visible: true,
        highlight: true,
        geometry: 'circle',
        onTop: true,
        radius: 50,
        kill: function() {
            DomMenu.style.display = 'none';
        },
        type: 'clickMenu',
        step: function() {
            return false;
        },
        pos: options.pos,
        addObj: function(obj) {
            var li = document.createElement('li');
            li.addEventListener('mouseover', menuObjMouseOver.bind(li, obj));
            li.addEventListener('click', editObj.bind(li, obj));
            li.addEventListener('mouseout', menuObjMouseOut.bind(li, obj));
            li.innerText = obj.type;
            DomMenu.appendChild(li);

            objs.push(obj);
        },
        collision: {
            zombie: function (zombie) {
                clickMenu.addObj(zombie);
            }
        }

    };


};


module.exports = clickMenu;



},{}],6:[function(require,module,exports){
var clickObj = function(options) {

    
    
    return clickObj = {
        visible: true,
        highlight: true,
        geometry: 'circle',
        obj: options.obj,
        effect: options.effect,
        onTop: true,
        match: options.match,
        radius: 50,
        kill: function() {
        },
        type: 'clickObj',
        step: function() {
            return false;
        },
        pos: options.pos,
        addObj: function(obj) {
            if (obj === clickObj.obj) {
                console.log('object match');
                clickObj.match();
            }
        },
        collision: {
        }

    };


};


module.exports = clickObj;



},{}],7:[function(require,module,exports){
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

                    if ((collider.type === 'clickMenu' && collidee.type === 'zombie') || (collidee.type === 'clickMenu' && collider.type === 'zombie')) {
                        console.log(dis);
                    }
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
                        if (collider.collision[collidee.type]) collider.collision[collidee.type].call(collider, collidee);
                        if (collidee.collision[collider.type]) collidee.collision[collider.type].call(collidee, collider);

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
                            if (circle.type === 'clickObj') circle.addObj(block);
                            if (circle.type === 'clickMenu') circle.addObj(block);
                            if (circle.type === 'bullet' && block.type === 'block') circle.die = true;
                            if (block.type === 'sensor' && circle.type === 'activation') block.collision.activation();
                            if (block.solid) {
                                circle.pos.x = point.x;
                                circle.pos.y = point.y;
                            }
                        }
                    }

                }
            }
        });
    });
};

module.exports = collision;

},{}],8:[function(require,module,exports){
var clickMenu = require('./clickMenu.js');
var clickObj = require('./clickObj.js');
var Zombie = require('./entities/Zombie.js');
var lastPos = {x: 0, y: 0};
var rightClickPoint;
var openMenu;
var editingObj;
var escapeKey;
var dragObj;
var pov;
var followObj;

var translateCoords = function(pos) {
    return {
        y: (pos.x * (parseInt(document.getElementById('gameView').getAttribute('width')) / parseInt(document.getElementById('gameView').style.width))) - 2250 + pov.pos.y,
            x: 3200 - (pos.y * (parseInt(document.getElementById('gameView').getAttribute('height')) / parseInt(document.getElementById('gameView').style.height))) + pov.pos.x
    };
};

var editControl = {
    responseEffect: function() {
        pov = this;
        var pos;

        if (openMenu) editingObj = openMenu.editing;

        if (dragObj) {
            this.renderer.newItems.push(dragObj);
            dragObj = false;
        }
        if (escapeKey) {
            escapeKey = false;
            if (openMenu) {
                openMenu.kill();
                openMenu = false;
            }
            if (editingObj) {
                editingObj.editing = false;
                editingObj = false;
            }
        }
        povOffset = {x: 0, y: 0};
        if (rightClickPoint) {
            pos = translateCoords(rightClickPoint);
            openMenu = clickMenu({pos: {x: pos.x, y: pos.y, rot: 0}, mousePos: {x: rightClickPoint.y, y: rightClickPoint.x}});
            this.renderer.newItems.push(openMenu);
            rightClickPoint = null;
        }
        return true;
    },
    rightClick: function(e) {
        e = e || window.event;
        if (e.which === 3 || e.button === 2) {
            rightClickPoint = {x: e.clientX, y: e.clientY};
            window.addEventListener('mouseup', editControl.rightUp);
        }
    },
    leftClick: function(e) {
        var follow = function(follow) {
            window.addEventListener('mousemove', editControl.followMouse);
            window.addEventListener('mouseup', editControl.leftUp);
        };
        var pos;
        if (e.which === 1 || e.button === 1) {
            lastPos.x = e.clientX;
            lastPos.y = e.clientY;
            if (editingObj) {
                followObj = editingObj;
                pos = translateCoords({x: e.clientX, y: e.clientY});
                dragObj = clickObj({match: follow, obj: editingObj, pos: {x: pos.x, y: pos.y, rot: 0}, mousePos: {x: e.clientX, y: e.clientY}});
            } else {
                followObj = pov;
                follow();
            }
        }
    },
    followMouse: function(e) {
        e = e || window.event;
        if (followObj.camera) {
            followObj.pos.y -= e.clientX - lastPos.x;
            followObj.pos.x += e.clientY - lastPos.y;
        } else {
            followObj.pos.y += e.clientX - lastPos.x;
            followObj.pos.x -= e.clientY - lastPos.y;
        }
        lastPos.x = e.clientX;
        lastPos.y = e.clientY;
    },
    rightUp: function(e) {
        e = e || window.event;
        if (e.which === 3 || e.button === 2) {
            window.removeEventListener('mouseup', editControl.rightUp);
        }
    },
    leftUp: function(e) {
        if (e.which === 1 || e.button === 1) {
            lastPos = {x: 0, y: 0};
            window.removeEventListener('mouseup', editControl.leftUp);
            window.removeEventListener('mousemove', editControl.followMouse);

        }
    },
    keyPress: function(e) {
        console.log(e.keyCode);
        if (e.keyCode === 27) {
            e.preventDefault();
            escapeKey = true;

        }

    },
/*
    keyDown: function(e) {
        if (keysPressed.indexOf(e.keyCode) === -1) {
            keysPressed.push(e.keyCode)
            switch (e.keyCode) {
                case 16:
                    editControl.controlling.running = true;
                    break;
                case 87: 
                    editControl.controlling.up = true;
                    editControl.controlling.down = false;
                    break;
                case 65: 
                    editControl.controlling.left = true;
                    editControl.controlling.right = false;
                    break;
                case 83: 
                    editControl.controlling.down = true;
                    editControl.controlling.up = false;
                    break;
                case 68: 
                    editControl.controlling.right = true;
                    editControl.controlling.left = false;
                    break;
            }
        }
    },
    keyUp: function(e) {
        keysPressed.splice(keysPressed.indexOf(e.keyCode), 1);
        switch (e.keyCode) {
            case 16:
                editControl.controlling.running = false;
                break;
            case 87: 
                editControl.controlling.up = false;
                if (keysPressed.indexOf(83) !== -1) editControl.controlling.down = true;
                break;
            case 65: 
                editControl.controlling.left = false;
                if (keysPressed.indexOf(68) !== -1) editControl.controlling.right = true;
                break;
            case 83: 
                editControl.controlling.down = false;
                if (keysPressed.indexOf(87) !== -1) editControl.controlling.up = true;
                break;
            case 68: 
                editControl.controlling.right = false;
                if (keysPressed.indexOf(65) !== -1) editControl.controlling.left = true;
                break;
        }

    },
    */
    start: function() {
        window.addEventListener('mousedown', editControl.rightClick);
        window.addEventListener('mousedown', editControl.leftClick);

        window.addEventListener('keydown', editControl.keyDown);
        window.addEventListener('keydown', editControl.keyPress);

        window.addEventListener('keyup', editControl.keyUp);

    },
    stop: function() {
        window.removeEventListener('mousedown', editControl.rightClick);
        window.removeEventListener('mousedown', editControl.leftClick);

        window.removeEventListener('keydown', editControl.keyDown);
        window.removeEventListener('keydown', editControl.keyPress);

        window.removeEventListener('keyup', editControl.keyUp);

    },

    controlling: null

};

window.oncontextmenu = function(e) {
    e.preventDefault();
};


module.exports = editControl;

},{"./clickMenu.js":5,"./clickObj.js":6,"./entities/Zombie.js":15}],9:[function(require,module,exports){
var editController = require('./editController.js');

var editor = {
    pos: {x: 0, y: 0, rot: 0}, 
    camera: true,
    step: function() {
        editController.responseEffect.call(editor);
        return true;
    },
    controller: editController,
    addMode: function() {}
    
};

editController.controlling = editor;

module.exports = editor;

},{"./editController.js":8}],10:[function(require,module,exports){
var effects = [];
var newEffects = [];
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

var perpPoint = function(verts, p) {
    var output = verts.map(function(v0, index, array) {
        var v1 = array[index + 1];
        if (index + 1 === array.length) v1 = array[0];
        var k = ((v1.y - v0.y) * (p.x - v0.x) - (v1.x - v0.x) * (p.y - v0.y)) / (Math.pow(v1.y - v0.y, 2) + Math.pow(v1.x - v0.x, 2));
        var perpPoint = {x: p.x - k * (v1.y - v0.y), y: p.y + k * (v1.x - v0.x)};
        var dis = Math.sqrt(Math.pow(p.x - perpPoint.x, 2) + Math.pow(p.y - perpPoint.y, 2));
        return {dis: dis, perpPoint: perpPoint};
    });
    return output.reduce(function(past, current) { 
        if (!past.dis) return current;
        if (current.dis < past.dis) return current;
        return past;
    }).perpPoint;
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

var setVerts = function(pos, width, height) {

    var verts = [
        {x: pos.x - width / 2, y: pos.y - height / 2}, 
        {x: pos.x + width / 2, y: pos.y - height / 2}, 
        {x: pos.x + width / 2, y: pos.y + height / 2}, 
        {x: pos.x - width / 2, y: pos.y + height / 2}, 
    ];

    var rot = pos.rot;
    var ox = pos.x;
    var oy = pos.y;

    return verts.map(function(item) {
        var vx = item.x;
        var vy = item.y;
        item.x = Math.cos(rot) * (vx - ox) - Math.sin(rot) * (vy - oy) + ox;
        item.y = Math.sin(rot) * (vx - ox) + Math.cos(rot) * (vy - oy) + oy;
        return item;
    });

};

var Block = function(options) {

    var i;
    var image = {};
    if (typeof Image !== 'undefined') image = new Image();
    image.src = options.path;

    var verts = setVerts(options.pos, options.width, options.height);

    var block = {
        vertices: verts,
        geometry: 'block',
        pattern: true,
        type: 'block',
        visible: true,
        solid: true,
        img: image,
        pos: options.pos,
        width: options.width,
        height: options.height,
        resetVerts: function() { verts = setVerts(this.pos, this.width, this.height); },
        testPoint: function(point) {
            var result = false;
            if (pointInPolygon(verts, point)) {
                result = perpPoint(verts, point);
            }
            return result;
        },
        collision: {},
        addEffect: function(fn) {
            newEffects.push(fn);
        },
        step: function() {
            effects = effects.filter((function(item) { return item.call(this); }).bind(this));
            effects = effects.concat(newEffects);
            newEffects = [];
            return !this.dis;
        },
        die: false,
        oclude: function(point1, point2) {
            return polyIntersect(verts, point1, point2);
        }
    };

    return block;
};

module.exports = Block;


},{}],11:[function(require,module,exports){
var Block = require('./Block.js');

module.exports = function(options) {


    var door = Block({path: options.path, pos: {x: options.pos.x, y: options.pos.y, rot: options.pos.rot}, width: options.width, height: options.height});
    var oldStep = door.step;

    door.open = false;
    door.onTop = true;
    door.pattern = false;

    door.type = 'door';

    door.step = function () {
        if (door.open && (door.pos.x !== door.openPos.x || door.pos.y !== door.openPos.y)) {
            door.pos.x -= (door.pos.x - door.openPos.x) / 15;
            door.pos.y -= (door.pos.y - door.openPos.y) / 15;
            door.resetVerts.call(door);
        }
        if (!door.open && (door.pos.x !== door.closedPos.x || door.pos.y !== door.closedPos.y)) {
            door.pos.x -= (door.pos.x - door.closedPos.x) / 15;
            door.pos.y -= (door.pos.y - door.closedPos.y) / 15;
            door.resetVerts.call(door);
        }
        return oldStep();
    };


    door.closedPos = {x: options.pos.x, y: options.pos.y, rot: options.pos.rot};
    door.openPos = {x: options.openPos.x, y: options.openPos.y, rot: options.openPos.rot};

    return door;
};



},{"./Block.js":10}],12:[function(require,module,exports){
var Activation = require('../activation.js');
var Character = require('./character.js');
var Weapons = require('../weapons.js');
//var Renderer = require('../renderer.js');
var wasd = require('../wasd.js');



module.exports = function(options) {

    var player = Character({
        outerOptions: options,
        player: true,
        opacity: 1,
        currentWeapon: 'pistol',
        controller: wasd,
        velocity: 0,
        pov: true,
        renderer: {},
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
                    wasd.start();
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
                var tick = Weapons[this.currentWeapon].reload - 1;
                this.addEffect(function() {
                    if (this.mode !== 'shooting') return false;
                    tick++;
                    if (tick > Weapons[this.currentWeapon].reload) { 
                        Weapons[this.currentWeapon].fire.call(this);
                        Weapons.update(this);
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
            meelee: function() {},
            bullet: function() {

            },
            goal: function() {

            },
            weapon: function(weapon) {
                Weapons[weapon.name].ammo += Weapons[weapon.name].pickupAmmo;
                Weapons.update(this);
            },
            activation: function() {}
        }
        
    });

    wasd.controlling = player;
    wasd.start();

    player.addEffect(wasd.responseEffect);
    player.activate = function() {
        this.renderer.newItems.push(Activation({parent: this, x: this.pos.x, y: this.pos.y, rot: this.pos.rot}));
    };
    player.nextWeapon = function() {
        player.currentWeapon = Weapons[player.currentWeapon].next;
        if (!Weapons[player.currentWeapon].ammo) player.nextWeapon();
        Weapons.update(player);
    };
    Weapons.update(player);

    return player;
};

},{"../activation.js":1,"../wasd.js":22,"../weapons.js":23,"./character.js":16}],13:[function(require,module,exports){
var Block = require('./Block.js');

module.exports = function(options) {


    var sensor = Block({path: '', pos: {x: options.pos.x, y: options.pos.y, rot: options.pos.rot}, width: options.width, height: options.height});


    sensor.type = 'sensor';
    sensor.visible = false;
    sensor.solid = false;


    var activation = function() {
        options.door.open = !options.door.open;
    };

    sensor.collision.activation = activation;
    sensor.collision.bullet = activation;
    sensor.collision.meelee = activation;

    return sensor;
    
};



},{"./Block.js":10}],14:[function(require,module,exports){
var Block = require('./Block.js');

var effects = [];
var newEffects = [];
var Background = function(options) {

    var image = new Image();
    image.src = options.path;

    var tile = Block({
        path: '../img/background.jpg',
        width: options.width,
        height: options.height,
        pos: {
            x: options.pos.x,
            y: options.pos.y,
            rot: 0
        },
    });

    tile.type = 'tile';
    tile.solid = false;

    return tile;
};

module.exports = Background;

},{"./Block.js":10}],15:[function(require,module,exports){
var Character = require('./character.js');
var Weapons = require('../weapons.js');

module.exports = function(options) {

    var zombie = Character({
        outerOptions: options,
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
                if (Math.random() < 0.05) this.audio = 'growl';
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
                        meelee: function() {},
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
                var drop = Math.floor(Math.random() * 10);
                if (drop <= 2) this.renderer.newItems.push(Weapons.pistol.drop(this, 'pistol'));
                if (drop === 3) this.renderer.newItems.push(Weapons.shotgun.drop(this, 'shotgun'));
                if (drop === 4) this.renderer.newItems.push(Weapons.rifle.drop(this, 'rifle'));
                var start = Date.now();
                this.pose.y = 3;
                this.velocity = 0;
                this.geometry = 'none';
                this.onTop = false;
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
                this.health -= bullet.power;

                this.addEffect(function() {
                    var elapsed = Date.now() - start;
                    if (elapsed > 75) return false;
                    this.pos.x += x;
                    this.pos.y += y;
                    return true;
                });
            },
            meelee: function(meelee) {
                var x = Math.cos(meelee.pos.rot) * 30;
                var y = Math.sin(meelee.pos.rot) * 30;
                var start = Date.now();
                this.health -= meelee.power;

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
            },
            weapon: function() {}
        }
    });

    return zombie;
};

},{"../weapons.js":23,"./character.js":16}],16:[function(require,module,exports){
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
    var controller = options.controller;
    var health = options.health;
    var player = options.player;
    var target = options.target;
    var arsenal = options.arsenal;
    var currentWeapon = options.currentWeapon;
    var aniTick = 0;
    var effects = [];
    var newEffects = [];
    var img = spriteMaps[options.outerOptions.img];
    var character = {
        onTop: true,
        arsenal: arsenal,
        currentWeapon: currentWeapon,
        animate: true,
        pov: options.pov,
        player: player,
        controller: controller,
        visible: true,
        geometry: 'circle',
        target: target,
        id: options.outerOptions.img,
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
            if (!this.controller && !this.edit) {
                this.pos.x += Math.cos(this.pos.rot) * this.velocity;
                this.pos.y += Math.sin(this.pos.rot) * this.velocity;
            }
            effects = effects.filter((function(item) { return item.call(this); }).bind(this));
            effects = effects.concat(newEffects);
            newEffects = [];
            return !this.die;
        },
        pos: options.outerOptions.pos,
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


},{}],17:[function(require,module,exports){
var Player = require('./entities/Player.js');
var Levels = {};

Levels['one'] = require('./levels/one.js');

var Entities = {};

Entities['Player'] = require('./entities/Player.js');
Entities['Tile'] = require('./entities/Tile.js');
Entities['Zombie'] = require('./entities/Zombie.js');
Entities['Block'] = require('./entities/Block.js');
Entities['Door'] = require('./entities/Door.js');
Entities['Sensor'] = require('./entities/Sensor.js');

module.exports = function(levelId) {
    
    return Levels[levelId].map(function(item) {
        var entity = Entities[item.entity](item);
        var startTime = Date.now();
        entity.level = levelId;
        entity.addEffect(function() {
            var elapsed = Date.now() - startTime;
            if (elapsed > 250) {
                this.opacity = 1;
                return false;
            }
            this.opacity = (elapsed / 250);
            return true;
        });
        return entity;
    });
    
};

},{"./entities/Block.js":10,"./entities/Door.js":11,"./entities/Player.js":12,"./entities/Sensor.js":13,"./entities/Tile.js":14,"./entities/Zombie.js":15,"./levels/one.js":18}],18:[function(require,module,exports){
module.exports = [

    {entity: 'Player', pos: {x: 100, y: 100, rot: 0}, img: 0},
    {entity: 'Tile', pos: {x: 2500, y: 2500}, width: 5000, height: 5000, path: './img/background.jpg'},
    {entity: 'Block', path: './img/wall.png', pos: {x: 0, y: 3900, rot: 0}, width: 100, height: 2600},
    {entity: 'Block', path: './img/wall.png', pos: {x: 0, y: 1100, rot: 0}, width: 100, height: 2200},
    {entity: 'Block', path: './img/wall.png', pos: {x: 2500, y: 0, rot: 0}, width: 5000, height: 100},
    {entity: 'Block', path: './img/wall.png', pos: {x: 2500, y: 5000, rot: 0}, width: 5000, height: 100},
    {entity: 'Block', path: './img/wall.png', pos: {x: 5000, y: 2500, rot: 0}, width: 100, height: 5000},
    {entity: 'Block', path: './img/car1.png', pos: {x: 300, y: 300, rot: 2}, width: 200, height: 300},
    {entity: 'Zombie', img: 2, pos: {x: 1900, y: 1700, rot: 0}}

];



},{}],19:[function(require,module,exports){
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




},{"./animationShim.js":2,"./editor.js":9,"./renderer.js":21}],20:[function(require,module,exports){
var image = new Image();
//image.src = './img/batswing.png';
image.src = './img/baseballbat.png';

var Meelee = function(options) {

    var start = Date.now();

    var meelee = {
        power: options.power,
        onTop: true,
        geometry: 'circle',
        type: 'meelee',
        visible: true,
        radius: 100,
        img: image,
        pos: {
            x: options.parent.pos.x + Math.cos(options.rot) * 50,
            y: options.parent.pos.y + Math.sin(options.rot) * 50,
            rot: options.rot
        },
        step: function() {
            if (this.die || Date.now() - 250 > start) return false;

            this.pos.x = options.parent.pos.x + Math.cos(this.pos.rot) * 50;
            this.pos.y = options.parent.pos.y + Math.sin(this.pos.rot) * 50;
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
            meelee: function() {

            },
            goal: function() {},
            weapon: function() {},
            activation: function() {}

        }
    };

    return meelee;

};

module.exports = Meelee;

},{}],21:[function(require,module,exports){
var collision = require('./collision.js');
var audio = require('./audio.js');
var levelReader = require('./levelReader');
var editor = require('./editor');
var currentLevel;
var pov;
var player;

var step = function() {

    collision(renderer.world);
    if (pov) audio.updatePov(pov.pos);
    renderer.world.sort(function(a, b) {
        return a.onTop;
    });

    if (edit) editor.step();
    renderer.canvas.width = renderer.canvas.width;
    renderer.world = renderer.world.filter(function(item) { 
        var width, height, sx, sy, i, imgWidth, imgHeight, pattern;
        item.edit = edit;
        if (item.player) {
            player = item;
            item.renderer = renderer;
        }
        
        if (item.audio) {
            audio[item.type][item.audio](item.pos);
            item.audio = null;
        }
        if (item.visible && pov) {
            if (item.pos.rot > Math.PI * 2) item.pos.rot -= Math.PI * 2;
            if (item.pos.rot < 0) item.pos.rot += Math.PI * 2;
            if (item.texMap) {
                imgWidth = width = item.img.width / item.texMap.x;
                imgHeight = height = item.img.height / item.texMap.y;
                sx = width * item.pose.x;
                sy = height * item.pose.y;
            } else {
                if (item.img) {
                    width = item.width;
                    height = item.height;
                    imgWidth = item.img.width;
                    imgHeight = item.img.height;
                    sx = 0;
                    sy = 0;
                }
            }
            var ctx = renderer.canvas.getContext('2d');
            var pos = {};
            pos.x = 2250 + (item.pos.x - pov.pos.x) - width / 2;
            pos.y = 1900 + (item.pos.y - pov.pos.y) - height / 2;
            ctx.save(); 

            ctx.globalAlpha = item.opacity || 1;
            ctx.translate(2250 , 1900 );
            ctx.rotate(- pov.pos.rot - Math.PI / 2);
            ctx.translate( - (2250 ), - (1900 ));
            ctx.translate( pos.x + width / 2, pos.y + height / 2);
            ctx.rotate( item.pos.rot );
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 20;
            if (item.pattern) {
                pattern = ctx.createPattern(item.img, 'repeat');
                if (item.highlight || item.editing) ctx.strokeRect(-width / 2, - height / 2, width, height);
                if (item.editing) {
                    ctx.beginPath()
                    ctx.arc(-width / 2, -height / 2, 50, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath()
                    ctx.arc(-width / 2, height / 2, 50, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath()
                    ctx.arc(width / 2, -height / 2, 50, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath()
                    ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.fillStyle = pattern;
                ctx.fillRect(-width / 2, - height / 2, width, height);
            } else {
                if (item.img) ctx.drawImage(item.img, sx, sy, imgWidth, imgHeight, - width / 2, - height / 2, width, height);
                if (item.highlight || item.editing) {
                    ctx.beginPath()
                    ctx.arc(0, 0, 50, 0, Math.PI * 2);
                    ctx.stroke();
                }

            }

            ctx.restore(); 
        }
        return item.step.call(item); 
    });
    renderer.world = renderer.world.concat(renderer.newItems);
    renderer.newItems = [];
    if (renderer.clear) {
        renderer.world = [];
        renderer.clear = false;
    }

    if (edit) {
        pov = editor;
    } else {
        pov = player;
    }


};
var playing = false;
var edit = false;
var renderer = {
    init: function(options) {
        renderer.level = options.level;
        renderer.world = [];
        renderer.canvas = document.getElementById(options.canvas);
        if (options.edit) window.setTimeout(function() { renderer.edit(true); }, 500);
    },
    edit: function(state) {
        if (!edit && state) {
            player.controller.stop();
            editor.controller.start();
        }
        if (edit && !state) {
            player.controller.start();
            editor.controller.stop();
        }
        edit = state;

    },
    start: function() {
        if (pov) pov.controller.start();
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
    loadLevel: function(id) {
        
        if (currentLevel) {
            renderer.world.forEach(function(item) {
                var startTime = Date.now();
                if (item.level && item.level === currentLevel) {
                    item.addEffect(function() {
                        var elapsed = Date.now() - startTime;
                        if (elapsed > 250) return false;
                        this.opacity = 1 - (elapsed / 250);
                        return true;
                    });
                }
            });
        }
        var items = levelReader(id);
        items.forEach(function(item) { 
            item.renderer = renderer;
        });
        renderer.newItems = renderer.newItems.concat(items);
        currentLevel = id;
    },
    newItems: []
};

editor.renderer = renderer;

module.exports = renderer;

},{"./audio.js":3,"./collision.js":7,"./editor":9,"./levelReader":17}],22:[function(require,module,exports){
var keysPressed = [];
var switchWeapon, activate;


var wasd = {
    started: false,
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
        if (switchWeapon) {
            switchWeapon = false;
            this.nextWeapon();
        }
        if (activate) {
            activate = false;
            this.activate.call(this);
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
    keyPress: function(e) {
        if (e.keyCode === 9) {
            e.preventDefault();
            switchWeapon = true;
        }
        if (e.keyCode === 32) {
            e.preventDefault();
            activate = true;
        }

    },

    keyDown: function(e) {

        if (this.indexOf(e.keyCode) === -1) {
            this.push(e.keyCode);
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
    }.bind(keysPressed),
    keyUp: function(e) {
        this.splice(this.indexOf(e.keyCode), 1);
        switch (e.keyCode) {
            case 16:
                wasd.controlling.running = false;
                break;
            case 87: 
                wasd.controlling.up = false;
                if (this.indexOf(83) !== -1) wasd.controlling.down = true;
                break;
            case 65: 
                wasd.controlling.left = false;
                if (this.indexOf(68) !== -1) wasd.controlling.right = true;
                break;
            case 83: 
                wasd.controlling.down = false;
                if (this.indexOf(87) !== -1) wasd.controlling.up = true;
                break;
            case 68: 
                wasd.controlling.right = false;
                if (this.indexOf(65) !== -1) wasd.controlling.left = true;
                break;
        }

    }.bind(keysPressed),
    start: function() {
        if (!wasd.started) {
            window.addEventListener('mousedown', wasd.rightClick);
            window.addEventListener('mousedown', wasd.leftClick);

            window.addEventListener('keydown', wasd.keyDown);
            window.addEventListener('keydown', wasd.keyPress);

            window.addEventListener('keyup', wasd.keyUp);
        }
        wasd.started = true;
    },
    stop: function() {
        window.removeEventListener('mousedown', wasd.rightClick);
        window.removeEventListener('mousedown', wasd.leftClick);

        window.removeEventListener('keydown', wasd.keyDown);
        window.removeEventListener('keydown', wasd.keyPress);

        window.removeEventListener('keyup', wasd.keyUp);

    },

    controlling: null

};

window.oncontextmenu = function(e) {
    e.preventDefault();
};


module.exports = wasd;

},{}],23:[function(require,module,exports){
var Bullet = require('./bullet.js');
var Meelee = require('./meelee.js');
var pistolImg = new Image();
pistolImg.src = './img/pistol.png';
var machineImg = new Image();
machineImg.src = './img/machinegun.png';
var shotgunImg = new Image();
shotgunImg.src = './img/shotgun.png';
var baseballImg = new Image();
baseballImg.src = './img/baseballbat.png';

var weaponStats = {
    ammo: document.getElementById('ammo'),
    baseballBat: document.getElementById('baseballbat'),
    pistol: document.getElementById('pistol'),
    shotgun: document.getElementById('shotgun'),
    rifle: document.getElementById('rifle')
}


var drop = function(dropper, weapon) {
    var start = Date.now();
    return {
        onTop: true,
        name: weapons[weapon].name,
        img: weapons[weapon].img,
        pos: {
            x: dropper.pos.x,
            y: dropper.pos.y,
            rot: 0
        },
        visible: true,
        geometry: 'circle',
        radius: 50,
        type: 'weapon',
        collision: {
            human: function() {
                this.die = true;
            },
            bullet: function() {},
            block: function() {},
            goal: function() {},
            meelee: function() {},
            zombie: function(zombie) {},
            weapon: function() {}
        },
        step: function() {
            if (Date.now() - start > 20000) return false;
            this.pos.rot += .05;
            if (!this.die) return true;
            return false;
        }
    }
};


var weapons = {
    baseballBat: {
        ammo: 1,
        reload: 10,
        type: 'meelee',
        name: 'baseballBat',
        fire: function() {
            this.renderer.newItems.push(Meelee({name: 'bat', parent: this, x: this.pos.x, y: this.pos.y, rot: this.pos.rot, power: 10}));
            this.audio = 'bat';
        },
        next: 'pistol'
    },
    pistol: {
        fire: function() {
            this.renderer.newItems.push(Bullet({name: 'pistol', x: this.pos.x, y: this.pos.y, rot: this.pos.rot, velocity: 30, range: 50, power: 20}));
            this.audio = 'pistol';
            weapons[this.currentWeapon].ammo--;
        },
        img: pistolImg,
        ammo: 20,
        pickupAmmo: 20,
        power: 20,
        range: 4000,
        reload: 10,
        type: 'projectile',
        name: 'pistol',
        fail: 'baseballBat',
        drop: drop,
        next: 'shotgun'
    },
    shotgun: {
        img: shotgunImg,
        fire: function() {
            var deviation, i;
            for (i = 0; i < 5; i++) {
                deviation = (Math.random() - 0.5) / 3;
                this.renderer.newItems.push(Bullet({name: 'shotgun', x: this.pos.x, y: this.pos.y, rot: this.pos.rot + deviation, velocity: 20, range: 30, power: 7}));
            }
            weapons[this.currentWeapon].ammo--;
            this.audio = 'shotgun';
        },
        ammo: 10,
        pickupAmmo: 20,
        power: 5,
        range: 1500,
        reload: 40,
        type: 'projectile',
        name: 'shotgun',
        fail: 'pistol',
        drop: drop,
        next: 'rifle'

    },
    rifle: {
        img: machineImg,
        fire: function() {
            this.renderer.newItems.push(Bullet({name: 'rifle', x: this.pos.x, y: this.pos.y, rot: this.pos.rot, velocity: 50, range: 80, power: 30}));
            weapons[this.currentWeapon].ammo--;
            this.audio = 'rifle';
        },
        ammo: 20,
        pickupAmmo: 20,
        power: 25,
        range: 4000,
        reload: 5,
        type: 'projectile',
        fail: 'shotgun',
        name: 'rifle',
        drop: drop,
        next: 'baseballBat'

    },
    update: function(player) {
        var weapon = weapons[player.currentWeapon];
        var i;
        for (i in weapons) {
            if (weapons[i].ammo) {
                weaponStats[i].style.border = '';
                weaponStats[i].style.display = 'inherit';
            } else {
                if (weaponStats[i]) weaponStats[i].style.display = '';
            }

        }

        weaponStats[player.currentWeapon].style.border = '1px solid white';

        if (weapon.name !== 'baseballBat') {
            weaponStats.ammo.innerText = weapon.ammo;
        } else {
            weaponStats.ammo.innerText = '';
        }
        if (!weapon.ammo) {
            player.currentWeapon = weapon.fail;
            weapons.update(player);
        }

    }
};

module.exports = weapons;

},{"./bullet.js":4,"./meelee.js":20}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2FjdGl2YXRpb24uanMiLCJqcy9hbmltYXRpb25TaGltLmpzIiwianMvYXVkaW8uanMiLCJqcy9idWxsZXQuanMiLCJqcy9jbGlja01lbnUuanMiLCJqcy9jbGlja09iai5qcyIsImpzL2NvbGxpc2lvbi5qcyIsImpzL2VkaXRDb250cm9sbGVyLmpzIiwianMvZWRpdG9yLmpzIiwianMvZW50aXRpZXMvQmxvY2suanMiLCJqcy9lbnRpdGllcy9Eb29yLmpzIiwianMvZW50aXRpZXMvUGxheWVyLmpzIiwianMvZW50aXRpZXMvU2Vuc29yLmpzIiwianMvZW50aXRpZXMvVGlsZS5qcyIsImpzL2VudGl0aWVzL1pvbWJpZS5qcyIsImpzL2VudGl0aWVzL2NoYXJhY3Rlci5qcyIsImpzL2xldmVsUmVhZGVyLmpzIiwianMvbGV2ZWxzL29uZS5qcyIsImpzL21haW4uanMiLCJqcy9tZWVsZWUuanMiLCJqcy9yZW5kZXJlci5qcyIsImpzL3dhc2QuanMiLCJqcy93ZWFwb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTWVlbGVlID0gcmVxdWlyZSgnLi9tZWVsZWUuanMnKTtcblxudmFyIEFjdGl2YXRpb24gPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgYWN0aXZhdGlvbiA9IE1lZWxlZShvcHRpb25zKTtcblxuICAgIGFjdGl2YXRpb24uc3RlcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIGFjdGl2YXRpb24udmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgYWN0aXZhdGlvbi50eXBlID0gJ2FjdGl2YXRpb24nO1xuXG4gICAgcmV0dXJuIGFjdGl2YXRpb247XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhdGlvbjtcblxuXG4iLCIoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB2YXIgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ107XG4gICAgZm9yKHZhciB4ID0gMDsgeCA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gXG4gICAgICAgICAgICB8fCB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgfVxuXG4gICAgaWYgKCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKVxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgdmFyIHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyVGltZSAtIGxhc3RUaW1lKSk7XG4gICAgICAgICAgICB2YXIgaWQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2soY3VyclRpbWUgKyB0aW1lVG9DYWxsKTsgfSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lVG9DYWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKVxuICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgfTtcbn0oKSk7XG4iLCJ3aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbnZhciBjb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG4vKnBhbm5lci5wYW5uaW5nTW9kZWwgPSAnSFJURic7XG5wYW5uZXIuZGlzdGFuY2VNb2RlbCA9ICdpbnZlcnNlJztcbnBhbm5lci5yZWZEaXN0YW5jZSA9IDE7XG5wYW5uZXIubWF4RGlzdGFuY2UgPSAxMDAwMDtcbnBhbm5lci5yb2xsb2ZmRmFjdG9yID0gMTtcbnBhbm5lci5jb25lSW5uZXJBbmdsZSA9IDM2MDtcbnBhbm5lci5jb25lT3V0ZXJBbmdsZSA9IDA7XG5wYW5uZXIuY29uZU91dGVyR2FpbiA9IDA7Ki9cblxudmFyIGxvYWRlZCA9IDA7XG5cbnZhciBvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0F1ZGlvIGZhaWxlZCB0byBsb2FkLicpO1xufTtcblxudmFyIHNvdW5kcyA9IFtcbiAgICAnLi9hdWRpby9waXN0b2wubXAzJyxcbiAgICAnLi9hdWRpby9zaG90Z3VuLm1wMycsXG4gICAgJy4vYXVkaW8vbWFjaGluZWd1bi5tcDMnLFxuICAgICcuL2F1ZGlvL2JhdC5tcDMnLFxuICAgICcuL2F1ZGlvL3pvbWJpZWdyb3dsLm1wMydcbl07XG5cbnZhciBpO1xuXG52YXIgZG9uZSA9IGZ1bmN0aW9uKCkge1xufTtcblxuZm9yIChpID0gMDsgaSA8IHNvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgIChmdW5jdGlvbihpKSB7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgc291bmRzW2ldLCB0cnVlKTtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgICAgIC8vRGVjb2RlIGFzeW5jaHJvbm91c2x5XG4gICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShyZXF1ZXN0LnJlc3BvbnNlLCBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgICAgICAgICAgICBzb3VuZHNbaV0gPSBidWZmZXI7XG4gICAgICAgICAgICAgICAgbG9hZGVkKys7XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRlZCA9PT0gc291bmRzLmxlbmd0aCkgZG9uZSgpO1xuICAgICAgICAgICAgfSwgb25FcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfSkoaSlcbn1cblxudmFyIGxvY2FsU291bmQgPSBmdW5jdGlvbihpKSB7XG4gICAgdmFyIHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7IC8vIGNyZWF0ZXMgYSBzb3VuZCBzb3VyY2VcbiAgICBzb3VyY2UuYnVmZmVyID0gc291bmRzW2ldOyAgICAgICAgICAgICAgICAgICAgLy8gdGVsbCB0aGUgc291cmNlIHdoaWNoIHNvdW5kIHRvIHBsYXlcbiAgICBzb3VyY2UuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTsgICAgICAgLy8gY29ubmVjdCB0aGUgc291cmNlIHRvIHRoZSBjb250ZXh0J3MgZGVzdGluYXRpb24gKHRoZSBzcGVha2VycylcbiAgICBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gMC45ICsgTWF0aC5yYW5kb20oKSAvIDU7XG4gICAgc291cmNlLnN0YXJ0KE1hdGgucmFuZG9tKCkgKiAyKTtcbn07XG5cbmRpc3RhbnRTb3VuZCA9IGZ1bmN0aW9uKHBvcywgaSkge1xuICAgIHZhciBwYW5uZXIgPSBjb250ZXh0LmNyZWF0ZVBhbm5lcigpO1xuICAgIHBhbm5lci5zZXRQb3NpdGlvbihwb3MueCAvIDE1MCwgMCwgcG9zLnkgLyAxNTApO1xuICAgIHZhciBzb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpOyAvLyBjcmVhdGVzIGEgc291bmQgc291cmNlXG4gICAgc291cmNlLmJ1ZmZlciA9IHNvdW5kc1tpXTsgICAgICAgICAgICAgICAgICAgIC8vIHRlbGwgdGhlIHNvdXJjZSB3aGljaCBzb3VuZCB0byBwbGF5XG4gICAgc291cmNlLmNvbm5lY3QocGFubmVyKTtcbiAgICBwYW5uZXIuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTsgICAgICAgLy8gY29ubmVjdCB0aGUgc291cmNlIHRvIHRoZSBjb250ZXh0J3MgZGVzdGluYXRpb24gKHRoZSBzcGVha2VycylcbiAgICBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gMC45ICsgTWF0aC5yYW5kb20oKSAvIDU7XG4gICAgc291cmNlLnN0YXJ0KE1hdGgucmFuZG9tKCkgKiAyKTtcbn07XG5cbnZhciBldmVudHMgPSB7XG4gICAgaHVtYW46IHtcbiAgICAgICAgYmF0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxvY2FsU291bmQoMyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNob3RndW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9jYWxTb3VuZCgxKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmlmbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9jYWxTb3VuZCgyKTtcbiAgICAgICAgfSxcbiAgICAgICAgcGlzdG9sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxvY2FsU291bmQoMCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHpvbWJpZToge1xuICAgICAgICBncm93bDogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgICAgICBkaXN0YW50U291bmQocG9zLCA0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdXBkYXRlUG92OiBmdW5jdGlvbihwb3YpIHtcbiAgICAgICAgY29udGV4dC5saXN0ZW5lci5zZXRQb3NpdGlvbihwb3YueCAvIDE1MCwgMCwgcG92LnkgLyAxNTApO1xuICAgICAgICBjb250ZXh0Lmxpc3RlbmVyLnNldE9yaWVudGF0aW9uKE1hdGguY29zKHBvdi5yb3QpLCAwLCBNYXRoLnNpbihwb3Yucm90KSwgMCwgMSwgMCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBldmVudHM7XG4iLCJ2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbmltYWdlLnNyYyA9ICcuL2ltZy9idWxsZXQucG5nJztcblxudmFyIEJ1bGxldCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIC8qXG4gICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7IFxuICAgICAgICBidWxsZXQud2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IGltYWdlLmhlaWdodDtcbiAgICAgICAgY29uc29sZS5sb2coJ2J1bGxldCBpbWFnZSBsb2FkZWQnKTtcbiAgICB9O1xuICAgICovXG5cbiAgICB2YXIgcmFuZ2UgPSBvcHRpb25zLnJhbmdlO1xuICAgIHZhciB2ZWxvY2l0eSA9IG9wdGlvbnMudmVsb2NpdHk7XG5cbiAgICB2YXIgZGlzdGFuY2UgPSAwO1xuXG4gICAgdmFyIGJ1bGxldCA9IHtcbiAgICAgICAgb25Ub3A6IHRydWUsXG4gICAgICAgIHBvd2VyOiBvcHRpb25zLnBvd2VyLFxuICAgICAgICBnZW9tZXRyeTogJ2NpcmNsZScsXG4gICAgICAgIHR5cGU6ICdidWxsZXQnLFxuICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICByYWRpdXM6IDEwLFxuICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgIGhlaWdodDogNTAsXG4gICAgICAgIGltZzogaW1hZ2UsXG4gICAgICAgIHBvczoge1xuICAgICAgICAgICAgeDogb3B0aW9ucy54LFxuICAgICAgICAgICAgeTogb3B0aW9ucy55LFxuICAgICAgICAgICAgcm90OiBvcHRpb25zLnJvdFxuICAgICAgICB9LFxuICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRpZSB8fCBkaXN0YW5jZSA+IHJhbmdlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBkaXN0YW5jZSsrO1xuICAgICAgICAgICAgdGhpcy5wb3MueCArPSBNYXRoLmNvcyh0aGlzLnBvcy5yb3QpICogdmVsb2NpdHk7XG4gICAgICAgICAgICB0aGlzLnBvcy55ICs9IE1hdGguc2luKHRoaXMucG9zLnJvdCkgKiB2ZWxvY2l0eTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBjb2xsaXNpb246IHtcbiAgICAgICAgICAgIHpvbWJpZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWUgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lZWxlZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBodW1hbjogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBidWxsZXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGllID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnb2FsOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgd2VhcG9uOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgYWN0aXZhdGlvbjogZnVuY3Rpb24oKSB7fVxuXG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICByZXR1cm4gYnVsbGV0O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcbiIsInZhciBEb21NZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpKTtcbkRvbU1lbnUuc2V0QXR0cmlidXRlKCdpZCcsICdjbGlja01lbnUnKTtcbnZhciBtZW51T2JqTW91c2VPdmVyID0gZnVuY3Rpb24ob2JqLCBlKSB7XG4gICAgb2JqLmhpZ2hsaWdodCA9IHRydWU7XG4gICAgY29uc29sZS5sb2cob2JqICsgJywgJyArIGUpO1xufTtcbnZhciBtZW51T2JqTW91c2VPdXQgPSBmdW5jdGlvbihvYmosIGUpIHtcbiAgICBjb25zb2xlLmxvZygnbW91c2VPdXQnKTtcbiAgICBvYmouaGlnaGxpZ2h0ID0gZmFsc2U7XG59O1xudmFyIGVkaXRPYmogPSBmdW5jdGlvbihvYmosIGUpIHtcbiAgICBvYmouZWRpdGluZyA9IHRydWU7XG4gICAgY2xpY2tNZW51LmVkaXRpbmcgPSBvYmo7XG59O1xuXG52YXIgY2xpY2tNZW51ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgd2hpbGUgKERvbU1lbnUuZmlyc3RDaGlsZCkgeyBEb21NZW51LnJlbW92ZUNoaWxkKERvbU1lbnUuZmlyc3RDaGlsZCk7IH1cbiAgICBEb21NZW51LnN0eWxlLmRpc3BsYXkgPSAnaW5oZXJpdCc7XG4gICAgRG9tTWVudS5zdHlsZS50b3AgPSBwYXJzZUludChvcHRpb25zLm1vdXNlUG9zLngpICsgJ3B4JztcbiAgICBEb21NZW51LnN0eWxlLmxlZnQgPSBwYXJzZUludChvcHRpb25zLm1vdXNlUG9zLnkpICsgJ3B4JztcblxuICAgIHZhciBvYmpzID0gW107XG4gICAgXG4gICAgcmV0dXJuIGNsaWNrTWVudSA9IHtcbiAgICAgICAgZWRpdGluZzogZmFsc2UsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgZ2VvbWV0cnk6ICdjaXJjbGUnLFxuICAgICAgICBvblRvcDogdHJ1ZSxcbiAgICAgICAgcmFkaXVzOiA1MCxcbiAgICAgICAga2lsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEb21NZW51LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH0sXG4gICAgICAgIHR5cGU6ICdjbGlja01lbnUnLFxuICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zOiBvcHRpb25zLnBvcyxcbiAgICAgICAgYWRkT2JqOiBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBtZW51T2JqTW91c2VPdmVyLmJpbmQobGksIG9iaikpO1xuICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlZGl0T2JqLmJpbmQobGksIG9iaikpO1xuICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBtZW51T2JqTW91c2VPdXQuYmluZChsaSwgb2JqKSk7XG4gICAgICAgICAgICBsaS5pbm5lclRleHQgPSBvYmoudHlwZTtcbiAgICAgICAgICAgIERvbU1lbnUuYXBwZW5kQ2hpbGQobGkpO1xuXG4gICAgICAgICAgICBvYmpzLnB1c2gob2JqKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29sbGlzaW9uOiB7XG4gICAgICAgICAgICB6b21iaWU6IGZ1bmN0aW9uICh6b21iaWUpIHtcbiAgICAgICAgICAgICAgICBjbGlja01lbnUuYWRkT2JqKHpvbWJpZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH07XG5cblxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsaWNrTWVudTtcblxuXG4iLCJ2YXIgY2xpY2tPYmogPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICBcbiAgICBcbiAgICByZXR1cm4gY2xpY2tPYmogPSB7XG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIGhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgZ2VvbWV0cnk6ICdjaXJjbGUnLFxuICAgICAgICBvYmo6IG9wdGlvbnMub2JqLFxuICAgICAgICBlZmZlY3Q6IG9wdGlvbnMuZWZmZWN0LFxuICAgICAgICBvblRvcDogdHJ1ZSxcbiAgICAgICAgbWF0Y2g6IG9wdGlvbnMubWF0Y2gsXG4gICAgICAgIHJhZGl1czogNTAsXG4gICAgICAgIGtpbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB9LFxuICAgICAgICB0eXBlOiAnY2xpY2tPYmonLFxuICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zOiBvcHRpb25zLnBvcyxcbiAgICAgICAgYWRkT2JqOiBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmogPT09IGNsaWNrT2JqLm9iaikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvYmplY3QgbWF0Y2gnKTtcbiAgICAgICAgICAgICAgICBjbGlja09iai5tYXRjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb2xsaXNpb246IHtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gY2xpY2tPYmo7XG5cblxuIiwidmFyIGNvbGxpc2lvbiA9IGZ1bmN0aW9uKHdvcmxkKSB7XG4gICAgd29ybGQuZm9yRWFjaChmdW5jdGlvbihjb2xsaWRlciwgaW5kZXgsIGFycmF5KSB7XG4gICAgICAgIGFycmF5LnNsaWNlKGluZGV4ICsgMSkuZm9yRWFjaChmdW5jdGlvbihjb2xsaWRlZSkge1xuICAgICAgICAgICAgdmFyIHgsIHksIGRpcywgcmFkaXVzLCBhbmcsIHpvbWJpZSwgaHVtYW4sIGFuZzIsIGJsb2NrLCBjaXJjbGUsIHBvaW50LCBvY2x1ZGU7XG4gICAgICAgICAgICBpZiAoY29sbGlkZXIuY29sbGlzaW9uICYmIGNvbGxpZGVlLmNvbGxpc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChjb2xsaWRlci5nZW9tZXRyeSA9PT0gJ2NpcmNsZScgJiYgY29sbGlkZWUuZ2VvbWV0cnkgPT09ICdjaXJjbGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBjb2xsaWRlci5wb3MueCAtIGNvbGxpZGVlLnBvcy54O1xuICAgICAgICAgICAgICAgICAgICB5ID0gY29sbGlkZXIucG9zLnkgLSBjb2xsaWRlZS5wb3MueTtcbiAgICAgICAgICAgICAgICAgICAgZGlzID0gTWF0aC5zcXJ0KE1hdGgucG93KHgsIDIpICsgTWF0aC5wb3coeSwgMikpO1xuICAgICAgICAgICAgICAgICAgICByYWRpdXMgPSBjb2xsaWRlci5yYWRpdXMgKyBjb2xsaWRlZS5yYWRpdXM7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKChjb2xsaWRlci50eXBlID09PSAnY2xpY2tNZW51JyAmJiBjb2xsaWRlZS50eXBlID09PSAnem9tYmllJykgfHwgKGNvbGxpZGVlLnR5cGUgPT09ICdjbGlja01lbnUnICYmIGNvbGxpZGVyLnR5cGUgPT09ICd6b21iaWUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoKGNvbGxpZGVyLnR5cGUgPT09ICd6b21iaWUnICYmIGNvbGxpZGVlLnR5cGUgPT09ICdodW1hbicpIHx8IChjb2xsaWRlZS50eXBlID09PSAnem9tYmllJyAmJiBjb2xsaWRlci50eXBlID09PSAnaHVtYW4nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxpZGVyLnR5cGUgPT09ICd6b21iaWUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgem9tYmllID0gY29sbGlkZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHVtYW4gPSBjb2xsaWRlZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgem9tYmllID0gY29sbGlkZWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHVtYW4gPSBjb2xsaWRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgb2NsdWRlID0gd29ybGQuZmlsdGVyKGZ1bmN0aW9uKGN1cnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyci50eXBlID09PSAnYmxvY2snKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VycikgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldikgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnIub2NsdWRlKGNvbGxpZGVyLnBvcywgY29sbGlkZWUucG9zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHpvbWJpZS50YXJnZXQgPT09IGh1bWFuICYmIG9jbHVkZSAmJiBkaXMgPiAxMDAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgem9tYmllLmFkZE1vZGUoJ3NlYXJjaGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZzIgPSBNYXRoLmFicyhNYXRoLmF0YW4yKGh1bWFuLnBvcy55IC0gem9tYmllLnBvcy55LCBodW1hbi5wb3MueCAtIHpvbWJpZS5wb3MueCkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5nID0gIHpvbWJpZS5wb3Mucm90IC0gYW5nMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW9jbHVkZSAmJiAoTWF0aC5hYnMoYW5nKSA8IE1hdGguUEkgKiAwLjQ1IHx8IGRpcyA8IDUwMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgem9tYmllLmFkZE1vZGUoJ2NoYXNpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgem9tYmllLnRhcmdldCA9IGh1bWFuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXMgPCByYWRpdXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2xsaWRlci5jb2xsaXNpb25bY29sbGlkZWUudHlwZV0pIGNvbGxpZGVyLmNvbGxpc2lvbltjb2xsaWRlZS50eXBlXS5jYWxsKGNvbGxpZGVyLCBjb2xsaWRlZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGlkZWUuY29sbGlzaW9uW2NvbGxpZGVyLnR5cGVdKSBjb2xsaWRlZS5jb2xsaXNpb25bY29sbGlkZXIudHlwZV0uY2FsbChjb2xsaWRlZSwgY29sbGlkZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoKGNvbGxpZGVyLmdlb21ldHJ5ID09PSAnYmxvY2snICYmIGNvbGxpZGVlLmdlb21ldHJ5ID09PSAnY2lyY2xlJykgfHwgKGNvbGxpZGVyLmdlb21ldHJ5ID09PSAnY2lyY2xlJyAmJiBjb2xsaWRlZS5nZW9tZXRyeSA9PT0gJ2Jsb2NrJykpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxpZGVyLmdlb21ldHJ5ID09PSAnYmxvY2snKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jayA9IGNvbGxpZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlID0gY29sbGlkZWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxpZGVlLmdlb21ldHJ5ID09PSAnYmxvY2snKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jayA9IGNvbGxpZGVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlID0gY29sbGlkZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlLnR5cGUgIT09ICdnb2FsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQgPSBibG9jay50ZXN0UG9pbnQoY2lyY2xlLnBvcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlLnR5cGUgPT09ICdjbGlja09iaicpIGNpcmNsZS5hZGRPYmooYmxvY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGUudHlwZSA9PT0gJ2NsaWNrTWVudScpIGNpcmNsZS5hZGRPYmooYmxvY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGUudHlwZSA9PT0gJ2J1bGxldCcgJiYgYmxvY2sudHlwZSA9PT0gJ2Jsb2NrJykgY2lyY2xlLmRpZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJsb2NrLnR5cGUgPT09ICdzZW5zb3InICYmIGNpcmNsZS50eXBlID09PSAnYWN0aXZhdGlvbicpIGJsb2NrLmNvbGxpc2lvbi5hY3RpdmF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJsb2NrLnNvbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZS5wb3MueCA9IHBvaW50Lng7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZS5wb3MueSA9IHBvaW50Lnk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb2xsaXNpb247XG4iLCJ2YXIgY2xpY2tNZW51ID0gcmVxdWlyZSgnLi9jbGlja01lbnUuanMnKTtcbnZhciBjbGlja09iaiA9IHJlcXVpcmUoJy4vY2xpY2tPYmouanMnKTtcbnZhciBab21iaWUgPSByZXF1aXJlKCcuL2VudGl0aWVzL1pvbWJpZS5qcycpO1xudmFyIGxhc3RQb3MgPSB7eDogMCwgeTogMH07XG52YXIgcmlnaHRDbGlja1BvaW50O1xudmFyIG9wZW5NZW51O1xudmFyIGVkaXRpbmdPYmo7XG52YXIgZXNjYXBlS2V5O1xudmFyIGRyYWdPYmo7XG52YXIgcG92O1xudmFyIGZvbGxvd09iajtcblxudmFyIHRyYW5zbGF0ZUNvb3JkcyA9IGZ1bmN0aW9uKHBvcykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHk6IChwb3MueCAqIChwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZVZpZXcnKS5nZXRBdHRyaWJ1dGUoJ3dpZHRoJykpIC8gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVWaWV3Jykuc3R5bGUud2lkdGgpKSkgLSAyMjUwICsgcG92LnBvcy55LFxuICAgICAgICAgICAgeDogMzIwMCAtIChwb3MueSAqIChwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZVZpZXcnKS5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpKSAvIHBhcnNlSW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lVmlldycpLnN0eWxlLmhlaWdodCkpKSArIHBvdi5wb3MueFxuICAgIH07XG59O1xuXG52YXIgZWRpdENvbnRyb2wgPSB7XG4gICAgcmVzcG9uc2VFZmZlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBwb3YgPSB0aGlzO1xuICAgICAgICB2YXIgcG9zO1xuXG4gICAgICAgIGlmIChvcGVuTWVudSkgZWRpdGluZ09iaiA9IG9wZW5NZW51LmVkaXRpbmc7XG5cbiAgICAgICAgaWYgKGRyYWdPYmopIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIubmV3SXRlbXMucHVzaChkcmFnT2JqKTtcbiAgICAgICAgICAgIGRyYWdPYmogPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXNjYXBlS2V5KSB7XG4gICAgICAgICAgICBlc2NhcGVLZXkgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChvcGVuTWVudSkge1xuICAgICAgICAgICAgICAgIG9wZW5NZW51LmtpbGwoKTtcbiAgICAgICAgICAgICAgICBvcGVuTWVudSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVkaXRpbmdPYmopIHtcbiAgICAgICAgICAgICAgICBlZGl0aW5nT2JqLmVkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBlZGl0aW5nT2JqID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcG92T2Zmc2V0ID0ge3g6IDAsIHk6IDB9O1xuICAgICAgICBpZiAocmlnaHRDbGlja1BvaW50KSB7XG4gICAgICAgICAgICBwb3MgPSB0cmFuc2xhdGVDb29yZHMocmlnaHRDbGlja1BvaW50KTtcbiAgICAgICAgICAgIG9wZW5NZW51ID0gY2xpY2tNZW51KHtwb3M6IHt4OiBwb3MueCwgeTogcG9zLnksIHJvdDogMH0sIG1vdXNlUG9zOiB7eDogcmlnaHRDbGlja1BvaW50LnksIHk6IHJpZ2h0Q2xpY2tQb2ludC54fX0pO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5uZXdJdGVtcy5wdXNoKG9wZW5NZW51KTtcbiAgICAgICAgICAgIHJpZ2h0Q2xpY2tQb2ludCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICByaWdodENsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDMgfHwgZS5idXR0b24gPT09IDIpIHtcbiAgICAgICAgICAgIHJpZ2h0Q2xpY2tQb2ludCA9IHt4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WX07XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGVkaXRDb250cm9sLnJpZ2h0VXApO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBsZWZ0Q2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGZvbGxvdyA9IGZ1bmN0aW9uKGZvbGxvdykge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGVkaXRDb250cm9sLmZvbGxvd01vdXNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZWRpdENvbnRyb2wubGVmdFVwKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHBvcztcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDEgfHwgZS5idXR0b24gPT09IDEpIHtcbiAgICAgICAgICAgIGxhc3RQb3MueCA9IGUuY2xpZW50WDtcbiAgICAgICAgICAgIGxhc3RQb3MueSA9IGUuY2xpZW50WTtcbiAgICAgICAgICAgIGlmIChlZGl0aW5nT2JqKSB7XG4gICAgICAgICAgICAgICAgZm9sbG93T2JqID0gZWRpdGluZ09iajtcbiAgICAgICAgICAgICAgICBwb3MgPSB0cmFuc2xhdGVDb29yZHMoe3g6IGUuY2xpZW50WCwgeTogZS5jbGllbnRZfSk7XG4gICAgICAgICAgICAgICAgZHJhZ09iaiA9IGNsaWNrT2JqKHttYXRjaDogZm9sbG93LCBvYmo6IGVkaXRpbmdPYmosIHBvczoge3g6IHBvcy54LCB5OiBwb3MueSwgcm90OiAwfSwgbW91c2VQb3M6IHt4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WX19KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9sbG93T2JqID0gcG92O1xuICAgICAgICAgICAgICAgIGZvbGxvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBmb2xsb3dNb3VzZTogZnVuY3Rpb24oZSkge1xuICAgICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgICAgIGlmIChmb2xsb3dPYmouY2FtZXJhKSB7XG4gICAgICAgICAgICBmb2xsb3dPYmoucG9zLnkgLT0gZS5jbGllbnRYIC0gbGFzdFBvcy54O1xuICAgICAgICAgICAgZm9sbG93T2JqLnBvcy54ICs9IGUuY2xpZW50WSAtIGxhc3RQb3MueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvbGxvd09iai5wb3MueSArPSBlLmNsaWVudFggLSBsYXN0UG9zLng7XG4gICAgICAgICAgICBmb2xsb3dPYmoucG9zLnggLT0gZS5jbGllbnRZIC0gbGFzdFBvcy55O1xuICAgICAgICB9XG4gICAgICAgIGxhc3RQb3MueCA9IGUuY2xpZW50WDtcbiAgICAgICAgbGFzdFBvcy55ID0gZS5jbGllbnRZO1xuICAgIH0sXG4gICAgcmlnaHRVcDogZnVuY3Rpb24oZSkge1xuICAgICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAzIHx8IGUuYnV0dG9uID09PSAyKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGVkaXRDb250cm9sLnJpZ2h0VXApO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBsZWZ0VXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDEgfHwgZS5idXR0b24gPT09IDEpIHtcbiAgICAgICAgICAgIGxhc3RQb3MgPSB7eDogMCwgeTogMH07XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGVkaXRDb250cm9sLmxlZnRVcCk7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZWRpdENvbnRyb2wuZm9sbG93TW91c2UpO1xuXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGtleVByZXNzOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDI3KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlc2NhcGVLZXkgPSB0cnVlO1xuXG4gICAgICAgIH1cblxuICAgIH0sXG4vKlxuICAgIGtleURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoZS5rZXlDb2RlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGtleXNQcmVzc2VkLnB1c2goZS5rZXlDb2RlKVxuICAgICAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICAgICAgICBlZGl0Q29udHJvbC5jb250cm9sbGluZy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA4NzogXG4gICAgICAgICAgICAgICAgICAgIGVkaXRDb250cm9sLmNvbnRyb2xsaW5nLnVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdENvbnRyb2wuY29udHJvbGxpbmcuZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDY1OiBcbiAgICAgICAgICAgICAgICAgICAgZWRpdENvbnRyb2wuY29udHJvbGxpbmcubGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRDb250cm9sLmNvbnRyb2xsaW5nLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgODM6IFxuICAgICAgICAgICAgICAgICAgICBlZGl0Q29udHJvbC5jb250cm9sbGluZy5kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdENvbnRyb2wuY29udHJvbGxpbmcudXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA2ODogXG4gICAgICAgICAgICAgICAgICAgIGVkaXRDb250cm9sLmNvbnRyb2xsaW5nLnJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZWRpdENvbnRyb2wuY29udHJvbGxpbmcubGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAga2V5VXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAga2V5c1ByZXNzZWQuc3BsaWNlKGtleXNQcmVzc2VkLmluZGV4T2YoZS5rZXlDb2RlKSwgMSk7XG4gICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICAgIGVkaXRDb250cm9sLmNvbnRyb2xsaW5nLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODc6IFxuICAgICAgICAgICAgICAgIGVkaXRDb250cm9sLmNvbnRyb2xsaW5nLnVwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoODMpICE9PSAtMSkgZWRpdENvbnRyb2wuY29udHJvbGxpbmcuZG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiBcbiAgICAgICAgICAgICAgICBlZGl0Q29udHJvbC5jb250cm9sbGluZy5sZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoNjgpICE9PSAtMSkgZWRpdENvbnRyb2wuY29udHJvbGxpbmcucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogXG4gICAgICAgICAgICAgICAgZWRpdENvbnRyb2wuY29udHJvbGxpbmcuZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChrZXlzUHJlc3NlZC5pbmRleE9mKDg3KSAhPT0gLTEpIGVkaXRDb250cm9sLmNvbnRyb2xsaW5nLnVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IFxuICAgICAgICAgICAgICAgIGVkaXRDb250cm9sLmNvbnRyb2xsaW5nLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoNjUpICE9PSAtMSkgZWRpdENvbnRyb2wuY29udHJvbGxpbmcubGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgIH0sXG4gICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlZGl0Q29udHJvbC5yaWdodENsaWNrKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGVkaXRDb250cm9sLmxlZnRDbGljayk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBlZGl0Q29udHJvbC5rZXlEb3duKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBlZGl0Q29udHJvbC5rZXlQcmVzcyk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZWRpdENvbnRyb2wua2V5VXApO1xuXG4gICAgfSxcbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGVkaXRDb250cm9sLnJpZ2h0Q2xpY2spO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZWRpdENvbnRyb2wubGVmdENsaWNrKTtcblxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGVkaXRDb250cm9sLmtleURvd24pO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGVkaXRDb250cm9sLmtleVByZXNzKTtcblxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBlZGl0Q29udHJvbC5rZXlVcCk7XG5cbiAgICB9LFxuXG4gICAgY29udHJvbGxpbmc6IG51bGxcblxufTtcblxud2luZG93Lm9uY29udGV4dG1lbnUgPSBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGVkaXRDb250cm9sO1xuIiwidmFyIGVkaXRDb250cm9sbGVyID0gcmVxdWlyZSgnLi9lZGl0Q29udHJvbGxlci5qcycpO1xuXG52YXIgZWRpdG9yID0ge1xuICAgIHBvczoge3g6IDAsIHk6IDAsIHJvdDogMH0sIFxuICAgIGNhbWVyYTogdHJ1ZSxcbiAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZWRpdENvbnRyb2xsZXIucmVzcG9uc2VFZmZlY3QuY2FsbChlZGl0b3IpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGNvbnRyb2xsZXI6IGVkaXRDb250cm9sbGVyLFxuICAgIGFkZE1vZGU6IGZ1bmN0aW9uKCkge31cbiAgICBcbn07XG5cbmVkaXRDb250cm9sbGVyLmNvbnRyb2xsaW5nID0gZWRpdG9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVkaXRvcjtcbiIsInZhciBlZmZlY3RzID0gW107XG52YXIgbmV3RWZmZWN0cyA9IFtdO1xudmFyIGxpbmVJbnRlcnNlY3QgPSBmdW5jdGlvbihhLGIsYyxkLHAscSxyLHMpIHtcbiAgICB2YXIgZGV0LCBnYW1tYSwgbGFtYmRhO1xuICAgIGRldCA9IChjIC0gYSkgKiAocyAtIHEpIC0gKHIgLSBwKSAqIChkIC0gYik7XG4gICAgaWYgKGRldCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGFtYmRhID0gKChzIC0gcSkgKiAociAtIGEpICsgKHAgLSByKSAqIChzIC0gYikpIC8gZGV0O1xuICAgICAgICBnYW1tYSA9ICgoYiAtIGQpICogKHIgLSBhKSArIChjIC0gYSkgKiAocyAtIGIpKSAvIGRldDtcbiAgICAgICAgcmV0dXJuICgwIDwgbGFtYmRhICYmIGxhbWJkYSA8IDEpICYmICgwIDwgZ2FtbWEgJiYgZ2FtbWEgPCAxKTtcbiAgICB9XG59O1xuXG52YXIgcG9seUludGVyc2VjdCA9IGZ1bmN0aW9uKHZlcnRzLCBwb2ludDEsIHBvaW50Mikge1xuICAgIHZhciBqID0gdmVydHMubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gdmVydHMucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cnIsIGluZGV4LCBhcnJheSkge1xuICAgICAgICBpZiAocHJldikgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChsaW5lSW50ZXJzZWN0KHBvaW50MS54LCBwb2ludDEueSwgcG9pbnQyLngsIHBvaW50Mi55LCBjdXJyLngsIGN1cnIueSwgYXJyYXlbal0ueCwgYXJyYXlbal0ueSkpIHJldHVybiB0cnVlO1xuICAgICAgICBqID0gaW5kZXg7XG4gICAgfSwgZmFsc2UpO1xuXG59O1xuXG52YXIgcGVycFBvaW50ID0gZnVuY3Rpb24odmVydHMsIHApIHtcbiAgICB2YXIgb3V0cHV0ID0gdmVydHMubWFwKGZ1bmN0aW9uKHYwLCBpbmRleCwgYXJyYXkpIHtcbiAgICAgICAgdmFyIHYxID0gYXJyYXlbaW5kZXggKyAxXTtcbiAgICAgICAgaWYgKGluZGV4ICsgMSA9PT0gYXJyYXkubGVuZ3RoKSB2MSA9IGFycmF5WzBdO1xuICAgICAgICB2YXIgayA9ICgodjEueSAtIHYwLnkpICogKHAueCAtIHYwLngpIC0gKHYxLnggLSB2MC54KSAqIChwLnkgLSB2MC55KSkgLyAoTWF0aC5wb3codjEueSAtIHYwLnksIDIpICsgTWF0aC5wb3codjEueCAtIHYwLngsIDIpKTtcbiAgICAgICAgdmFyIHBlcnBQb2ludCA9IHt4OiBwLnggLSBrICogKHYxLnkgLSB2MC55KSwgeTogcC55ICsgayAqICh2MS54IC0gdjAueCl9O1xuICAgICAgICB2YXIgZGlzID0gTWF0aC5zcXJ0KE1hdGgucG93KHAueCAtIHBlcnBQb2ludC54LCAyKSArIE1hdGgucG93KHAueSAtIHBlcnBQb2ludC55LCAyKSk7XG4gICAgICAgIHJldHVybiB7ZGlzOiBkaXMsIHBlcnBQb2ludDogcGVycFBvaW50fTtcbiAgICB9KTtcbiAgICByZXR1cm4gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwYXN0LCBjdXJyZW50KSB7IFxuICAgICAgICBpZiAoIXBhc3QuZGlzKSByZXR1cm4gY3VycmVudDtcbiAgICAgICAgaWYgKGN1cnJlbnQuZGlzIDwgcGFzdC5kaXMpIHJldHVybiBjdXJyZW50O1xuICAgICAgICByZXR1cm4gcGFzdDtcbiAgICB9KS5wZXJwUG9pbnQ7XG59O1xuXG52YXIgcG9pbnRJblBvbHlnb24gPSBmdW5jdGlvbih2ZXJ0aWNlcywgcG9pbnQpIHtcbiAgICB2YXIgYyA9IGZhbHNlO1xuICAgIHZhciBpLCBqO1xuXG4gICAgaiA9IHZlcnRpY2VzLmxlbmd0aCAtIDE7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBpZiAoICgodmVydGljZXNbaV0ueSA+IHBvaW50LnkpICE9PSAodmVydGljZXNbal0ueSA+IHBvaW50LnkpKSAmJlxuICAgICAgICAocG9pbnQueCA8ICh2ZXJ0aWNlc1tqXS54IC0gdmVydGljZXNbaV0ueCkgKiAocG9pbnQueSAtIHZlcnRpY2VzW2ldLnkpIC8gKHZlcnRpY2VzW2pdLnkgLSB2ZXJ0aWNlc1tpXS55KSArIHZlcnRpY2VzW2ldLngpICkge1xuICAgICAgICAgICAgYyA9ICFjO1xuICAgICAgICB9XG5cbiAgICAgICAgaiA9IGk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGM7XG59O1xuXG52YXIgc2V0VmVydHMgPSBmdW5jdGlvbihwb3MsIHdpZHRoLCBoZWlnaHQpIHtcblxuICAgIHZhciB2ZXJ0cyA9IFtcbiAgICAgICAge3g6IHBvcy54IC0gd2lkdGggLyAyLCB5OiBwb3MueSAtIGhlaWdodCAvIDJ9LCBcbiAgICAgICAge3g6IHBvcy54ICsgd2lkdGggLyAyLCB5OiBwb3MueSAtIGhlaWdodCAvIDJ9LCBcbiAgICAgICAge3g6IHBvcy54ICsgd2lkdGggLyAyLCB5OiBwb3MueSArIGhlaWdodCAvIDJ9LCBcbiAgICAgICAge3g6IHBvcy54IC0gd2lkdGggLyAyLCB5OiBwb3MueSArIGhlaWdodCAvIDJ9LCBcbiAgICBdO1xuXG4gICAgdmFyIHJvdCA9IHBvcy5yb3Q7XG4gICAgdmFyIG94ID0gcG9zLng7XG4gICAgdmFyIG95ID0gcG9zLnk7XG5cbiAgICByZXR1cm4gdmVydHMubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdmFyIHZ4ID0gaXRlbS54O1xuICAgICAgICB2YXIgdnkgPSBpdGVtLnk7XG4gICAgICAgIGl0ZW0ueCA9IE1hdGguY29zKHJvdCkgKiAodnggLSBveCkgLSBNYXRoLnNpbihyb3QpICogKHZ5IC0gb3kpICsgb3g7XG4gICAgICAgIGl0ZW0ueSA9IE1hdGguc2luKHJvdCkgKiAodnggLSBveCkgKyBNYXRoLmNvcyhyb3QpICogKHZ5IC0gb3kpICsgb3k7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuXG59O1xuXG52YXIgQmxvY2sgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgaTtcbiAgICB2YXIgaW1hZ2UgPSB7fTtcbiAgICBpZiAodHlwZW9mIEltYWdlICE9PSAndW5kZWZpbmVkJykgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWFnZS5zcmMgPSBvcHRpb25zLnBhdGg7XG5cbiAgICB2YXIgdmVydHMgPSBzZXRWZXJ0cyhvcHRpb25zLnBvcywgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQpO1xuXG4gICAgdmFyIGJsb2NrID0ge1xuICAgICAgICB2ZXJ0aWNlczogdmVydHMsXG4gICAgICAgIGdlb21ldHJ5OiAnYmxvY2snLFxuICAgICAgICBwYXR0ZXJuOiB0cnVlLFxuICAgICAgICB0eXBlOiAnYmxvY2snLFxuICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICBzb2xpZDogdHJ1ZSxcbiAgICAgICAgaW1nOiBpbWFnZSxcbiAgICAgICAgcG9zOiBvcHRpb25zLnBvcyxcbiAgICAgICAgd2lkdGg6IG9wdGlvbnMud2lkdGgsXG4gICAgICAgIGhlaWdodDogb3B0aW9ucy5oZWlnaHQsXG4gICAgICAgIHJlc2V0VmVydHM6IGZ1bmN0aW9uKCkgeyB2ZXJ0cyA9IHNldFZlcnRzKHRoaXMucG9zLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7IH0sXG4gICAgICAgIHRlc3RQb2ludDogZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChwb2ludEluUG9seWdvbih2ZXJ0cywgcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcGVycFBvaW50KHZlcnRzLCBwb2ludCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICBjb2xsaXNpb246IHt9LFxuICAgICAgICBhZGRFZmZlY3Q6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgICAgICBuZXdFZmZlY3RzLnB1c2goZm4pO1xuICAgICAgICB9LFxuICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGVmZmVjdHMgPSBlZmZlY3RzLmZpbHRlcigoZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gaXRlbS5jYWxsKHRoaXMpOyB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIGVmZmVjdHMgPSBlZmZlY3RzLmNvbmNhdChuZXdFZmZlY3RzKTtcbiAgICAgICAgICAgIG5ld0VmZmVjdHMgPSBbXTtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5kaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRpZTogZmFsc2UsXG4gICAgICAgIG9jbHVkZTogZnVuY3Rpb24ocG9pbnQxLCBwb2ludDIpIHtcbiAgICAgICAgICAgIHJldHVybiBwb2x5SW50ZXJzZWN0KHZlcnRzLCBwb2ludDEsIHBvaW50Mik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGJsb2NrO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jaztcblxuIiwidmFyIEJsb2NrID0gcmVxdWlyZSgnLi9CbG9jay5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuXG4gICAgdmFyIGRvb3IgPSBCbG9jayh7cGF0aDogb3B0aW9ucy5wYXRoLCBwb3M6IHt4OiBvcHRpb25zLnBvcy54LCB5OiBvcHRpb25zLnBvcy55LCByb3Q6IG9wdGlvbnMucG9zLnJvdH0sIHdpZHRoOiBvcHRpb25zLndpZHRoLCBoZWlnaHQ6IG9wdGlvbnMuaGVpZ2h0fSk7XG4gICAgdmFyIG9sZFN0ZXAgPSBkb29yLnN0ZXA7XG5cbiAgICBkb29yLm9wZW4gPSBmYWxzZTtcbiAgICBkb29yLm9uVG9wID0gdHJ1ZTtcbiAgICBkb29yLnBhdHRlcm4gPSBmYWxzZTtcblxuICAgIGRvb3IudHlwZSA9ICdkb29yJztcblxuICAgIGRvb3Iuc3RlcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRvb3Iub3BlbiAmJiAoZG9vci5wb3MueCAhPT0gZG9vci5vcGVuUG9zLnggfHwgZG9vci5wb3MueSAhPT0gZG9vci5vcGVuUG9zLnkpKSB7XG4gICAgICAgICAgICBkb29yLnBvcy54IC09IChkb29yLnBvcy54IC0gZG9vci5vcGVuUG9zLngpIC8gMTU7XG4gICAgICAgICAgICBkb29yLnBvcy55IC09IChkb29yLnBvcy55IC0gZG9vci5vcGVuUG9zLnkpIC8gMTU7XG4gICAgICAgICAgICBkb29yLnJlc2V0VmVydHMuY2FsbChkb29yKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRvb3Iub3BlbiAmJiAoZG9vci5wb3MueCAhPT0gZG9vci5jbG9zZWRQb3MueCB8fCBkb29yLnBvcy55ICE9PSBkb29yLmNsb3NlZFBvcy55KSkge1xuICAgICAgICAgICAgZG9vci5wb3MueCAtPSAoZG9vci5wb3MueCAtIGRvb3IuY2xvc2VkUG9zLngpIC8gMTU7XG4gICAgICAgICAgICBkb29yLnBvcy55IC09IChkb29yLnBvcy55IC0gZG9vci5jbG9zZWRQb3MueSkgLyAxNTtcbiAgICAgICAgICAgIGRvb3IucmVzZXRWZXJ0cy5jYWxsKGRvb3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvbGRTdGVwKCk7XG4gICAgfTtcblxuXG4gICAgZG9vci5jbG9zZWRQb3MgPSB7eDogb3B0aW9ucy5wb3MueCwgeTogb3B0aW9ucy5wb3MueSwgcm90OiBvcHRpb25zLnBvcy5yb3R9O1xuICAgIGRvb3Iub3BlblBvcyA9IHt4OiBvcHRpb25zLm9wZW5Qb3MueCwgeTogb3B0aW9ucy5vcGVuUG9zLnksIHJvdDogb3B0aW9ucy5vcGVuUG9zLnJvdH07XG5cbiAgICByZXR1cm4gZG9vcjtcbn07XG5cblxuIiwidmFyIEFjdGl2YXRpb24gPSByZXF1aXJlKCcuLi9hY3RpdmF0aW9uLmpzJyk7XG52YXIgQ2hhcmFjdGVyID0gcmVxdWlyZSgnLi9jaGFyYWN0ZXIuanMnKTtcbnZhciBXZWFwb25zID0gcmVxdWlyZSgnLi4vd2VhcG9ucy5qcycpO1xuLy92YXIgUmVuZGVyZXIgPSByZXF1aXJlKCcuLi9yZW5kZXJlci5qcycpO1xudmFyIHdhc2QgPSByZXF1aXJlKCcuLi93YXNkLmpzJyk7XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciBwbGF5ZXIgPSBDaGFyYWN0ZXIoe1xuICAgICAgICBvdXRlck9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgIHBsYXllcjogdHJ1ZSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgY3VycmVudFdlYXBvbjogJ3Bpc3RvbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IHdhc2QsXG4gICAgICAgIHZlbG9jaXR5OiAwLFxuICAgICAgICBwb3Y6IHRydWUsXG4gICAgICAgIHJlbmRlcmVyOiB7fSxcbiAgICAgICAgcmFkaXVzOiA1MCxcbiAgICAgICAgdHlwZTogJ2h1bWFuJyxcbiAgICAgICAgc3ByaXRlczogWycuL2ltZy9wbGF5ZXIucG5nJ10sXG4gICAgICAgIHRleE1hcDoge1xuICAgICAgICAgICAgeDogNixcbiAgICAgICAgICAgIHk6IDIsXG4gICAgICAgICAgICBzbGlkZXM6IFs2LCA1XVxuICAgICAgICB9LFxuICAgICAgICBtb2RlOiAnbG9hZGluZycsXG4gICAgICAgIG1vZGVzOiB7XG4gICAgICAgICAgICBsb2FkaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRNb2RlKCdzdGFuZGluZycpO1xuICAgICAgICAgICAgICAgICAgICB3YXNkLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhbmRpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zZS55ID0gMDtcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5pbmc6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2Fsa2luZzogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaG9vdGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NlLnkgPSAxO1xuICAgICAgICAgICAgICAgIHZhciB0aWNrID0gV2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlbG9hZCAtIDE7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGUgIT09ICdzaG9vdGluZycpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGljaysrO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGljayA+IFdlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5yZWxvYWQpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBXZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0uZmlyZS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgV2VhcG9ucy51cGRhdGUodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29sbGlzaW9uOiB7XG4gICAgICAgICAgICB6b21iaWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGdhbWVPdmVyKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWVlbGVlOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgYnVsbGV0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdvYWw6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2VhcG9uOiBmdW5jdGlvbih3ZWFwb24pIHtcbiAgICAgICAgICAgICAgICBXZWFwb25zW3dlYXBvbi5uYW1lXS5hbW1vICs9IFdlYXBvbnNbd2VhcG9uLm5hbWVdLnBpY2t1cEFtbW87XG4gICAgICAgICAgICAgICAgV2VhcG9ucy51cGRhdGUodGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWN0aXZhdGlvbjogZnVuY3Rpb24oKSB7fVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0pO1xuXG4gICAgd2FzZC5jb250cm9sbGluZyA9IHBsYXllcjtcbiAgICB3YXNkLnN0YXJ0KCk7XG5cbiAgICBwbGF5ZXIuYWRkRWZmZWN0KHdhc2QucmVzcG9uc2VFZmZlY3QpO1xuICAgIHBsYXllci5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goQWN0aXZhdGlvbih7cGFyZW50OiB0aGlzLCB4OiB0aGlzLnBvcy54LCB5OiB0aGlzLnBvcy55LCByb3Q6IHRoaXMucG9zLnJvdH0pKTtcbiAgICB9O1xuICAgIHBsYXllci5uZXh0V2VhcG9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHBsYXllci5jdXJyZW50V2VhcG9uID0gV2VhcG9uc1twbGF5ZXIuY3VycmVudFdlYXBvbl0ubmV4dDtcbiAgICAgICAgaWYgKCFXZWFwb25zW3BsYXllci5jdXJyZW50V2VhcG9uXS5hbW1vKSBwbGF5ZXIubmV4dFdlYXBvbigpO1xuICAgICAgICBXZWFwb25zLnVwZGF0ZShwbGF5ZXIpO1xuICAgIH07XG4gICAgV2VhcG9ucy51cGRhdGUocGxheWVyKTtcblxuICAgIHJldHVybiBwbGF5ZXI7XG59O1xuIiwidmFyIEJsb2NrID0gcmVxdWlyZSgnLi9CbG9jay5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuXG4gICAgdmFyIHNlbnNvciA9IEJsb2NrKHtwYXRoOiAnJywgcG9zOiB7eDogb3B0aW9ucy5wb3MueCwgeTogb3B0aW9ucy5wb3MueSwgcm90OiBvcHRpb25zLnBvcy5yb3R9LCB3aWR0aDogb3B0aW9ucy53aWR0aCwgaGVpZ2h0OiBvcHRpb25zLmhlaWdodH0pO1xuXG5cbiAgICBzZW5zb3IudHlwZSA9ICdzZW5zb3InO1xuICAgIHNlbnNvci52aXNpYmxlID0gZmFsc2U7XG4gICAgc2Vuc29yLnNvbGlkID0gZmFsc2U7XG5cblxuICAgIHZhciBhY3RpdmF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG9wdGlvbnMuZG9vci5vcGVuID0gIW9wdGlvbnMuZG9vci5vcGVuO1xuICAgIH07XG5cbiAgICBzZW5zb3IuY29sbGlzaW9uLmFjdGl2YXRpb24gPSBhY3RpdmF0aW9uO1xuICAgIHNlbnNvci5jb2xsaXNpb24uYnVsbGV0ID0gYWN0aXZhdGlvbjtcbiAgICBzZW5zb3IuY29sbGlzaW9uLm1lZWxlZSA9IGFjdGl2YXRpb247XG5cbiAgICByZXR1cm4gc2Vuc29yO1xuICAgIFxufTtcblxuXG4iLCJ2YXIgQmxvY2sgPSByZXF1aXJlKCcuL0Jsb2NrLmpzJyk7XG5cbnZhciBlZmZlY3RzID0gW107XG52YXIgbmV3RWZmZWN0cyA9IFtdO1xudmFyIEJhY2tncm91bmQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWFnZS5zcmMgPSBvcHRpb25zLnBhdGg7XG5cbiAgICB2YXIgdGlsZSA9IEJsb2NrKHtcbiAgICAgICAgcGF0aDogJy4uL2ltZy9iYWNrZ3JvdW5kLmpwZycsXG4gICAgICAgIHdpZHRoOiBvcHRpb25zLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IG9wdGlvbnMuaGVpZ2h0LFxuICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgIHg6IG9wdGlvbnMucG9zLngsXG4gICAgICAgICAgICB5OiBvcHRpb25zLnBvcy55LFxuICAgICAgICAgICAgcm90OiAwXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aWxlLnR5cGUgPSAndGlsZSc7XG4gICAgdGlsZS5zb2xpZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHRpbGU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tncm91bmQ7XG4iLCJ2YXIgQ2hhcmFjdGVyID0gcmVxdWlyZSgnLi9jaGFyYWN0ZXIuanMnKTtcbnZhciBXZWFwb25zID0gcmVxdWlyZSgnLi4vd2VhcG9ucy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciB6b21iaWUgPSBDaGFyYWN0ZXIoe1xuICAgICAgICBvdXRlck9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICAgIHRhcmdldDogdW5kZWZpbmVkLFxuICAgICAgICByZW5kZXJlcjogb3B0aW9ucy5yZW5kZXJlcixcbiAgICAgICAgaGVhbHRoOiAxMDAsXG4gICAgICAgIHJhZGl1czogNTAsXG4gICAgICAgIHR5cGU6ICd6b21iaWUnLFxuICAgICAgICBzcHJpdGVzOiBbJy4vaW1nL3pvbWJpZTEucG5nJywgJy4vaW1nL3pvbWJpZTIucG5nJywgJy4vaW1nL3pvbWJpZTMucG5nJ10sXG4gICAgICAgIHRleE1hcDoge1xuICAgICAgICAgICAgeDogNixcbiAgICAgICAgICAgIHk6IDQsXG4gICAgICAgICAgICBzbGlkZXM6IFs2LCA1LCAzLCAzXVxuICAgICAgICB9LFxuICAgICAgICBtb2RlOiAnd2FuZGVyaW5nJyxcbiAgICAgICAgbW9kZXM6IHtcbiAgICAgICAgICAgIHdhbmRlcmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnd2FuZGVyaW5nJyk7XG4gICAgICAgICAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjA1KSB0aGlzLmF1ZGlvID0gJ2dyb3dsJztcbiAgICAgICAgICAgICAgICB2YXIgdGltZUxlbmd0aCA9IDEgKyBwYXJzZUludChNYXRoLnJhbmRvbSgpICogMyAqIDEwMDApO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSAxICsgTWF0aC5yYW5kb20oKSAqIDI7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3Mucm90ID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zZS55ID0gMTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYWRkRWZmZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWxsYXBzZWRUaW1lID0gbm93IC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubW9kZSAhPT0gJ3dhbmRlcmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRUaW1lICsgdGltZUxlbmd0aCAgPCBub3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kZSgnd2FuZGVyaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlYXJjaGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc2VhcmNoaW5nJyk7XG4gICAgICAgICAgICAgICAgdmFyIGdvYWwgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLnRhcmdldC5wb3MueCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHRoaXMudGFyZ2V0LnBvcy55XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNTAsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdnb2FsJyxcbiAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBodW1hbjogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1bGxldDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZ29hbDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lZWxlZTogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvbWJpZTogZnVuY3Rpb24oem9tYmllKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvYWwgaGl0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHpvbWJpZSA9PT0gdGhpcy50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3pvbWJpZSBtYXRjaCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kaWUpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goZ29hbCk7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgd2luZG93LmcgPSBnb2FsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXNpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2NoYXNpbmcnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2UueSA9IDE7XG4gICAgICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IDM7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGUgIT09ICdjaGFzaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcy5yb3QgPSBNYXRoLmF0YW4yKCB0aGlzLnRhcmdldC5wb3MueSAtIHRoaXMucG9zLnksIHRoaXMudGFyZ2V0LnBvcy54IC0gdGhpcy5wb3MueCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYml0aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGFnZ2VyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZHJvcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICAgICAgICAgICAgICBpZiAoZHJvcCA8PSAyKSB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goV2VhcG9ucy5waXN0b2wuZHJvcCh0aGlzLCAncGlzdG9sJykpO1xuICAgICAgICAgICAgICAgIGlmIChkcm9wID09PSAzKSB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goV2VhcG9ucy5zaG90Z3VuLmRyb3AodGhpcywgJ3Nob3RndW4nKSk7XG4gICAgICAgICAgICAgICAgaWYgKGRyb3AgPT09IDQpIHRoaXMucmVuZGVyZXIubmV3SXRlbXMucHVzaChXZWFwb25zLnJpZmxlLmRyb3AodGhpcywgJ3JpZmxlJykpO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NlLnkgPSAzO1xuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2VvbWV0cnkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgdGhpcy5vblRvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRWZmZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wb3NlLnggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRWZmZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gNTAwMCkgdGhpcy5kaWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29sbGlzaW9uOiB7XG4gICAgICAgICAgICBodW1hbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgem9tYmllOiBmdW5jdGlvbih6b21iaWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zLnggLSB6b21iaWUucG9zLng7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvcy55IC0gem9tYmllLnBvcy55O1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsYXBzZWQgPSBEYXRlLm5vdygpIC0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGFwc2VkID4gNTApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueCAtPSAoMTAwIC0geCkgLyAzMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueSAtPSAoMTAwIC0geSkgLyAzMDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYnVsbGV0OiBmdW5jdGlvbihidWxsZXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IE1hdGguY29zKGJ1bGxldC5wb3Mucm90KSAqIDMwO1xuICAgICAgICAgICAgICAgIHZhciB5ID0gTWF0aC5zaW4oYnVsbGV0LnBvcy5yb3QpICogMzA7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSBidWxsZXQucG93ZXI7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsYXBzZWQgPSBEYXRlLm5vdygpIC0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGFwc2VkID4gNzUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueCArPSB4O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcy55ICs9IHk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lZWxlZTogZnVuY3Rpb24obWVlbGVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHggPSBNYXRoLmNvcyhtZWVsZWUucG9zLnJvdCkgKiAzMDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IE1hdGguc2luKG1lZWxlZS5wb3Mucm90KSAqIDMwO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFsdGggLT0gbWVlbGVlLnBvd2VyO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxhcHNlZCA+IDc1KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zLnggKz0geDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueSArPSB5O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnb2FsOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgICAgICAgIGlmIChibG9jay50YXJnZXQgPT09IHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kZSgnd2FuZGVyaW5nJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdlYXBvbjogZnVuY3Rpb24oKSB7fVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gem9tYmllO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBzcHJpdGVNYXBzID0gb3B0aW9ucy5zcHJpdGVzLm1hcChmdW5jdGlvbihwYXRoKSB7IFxuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5zcmMgPSBwYXRoO1xuICAgICAgICByZXR1cm4gaW1nO1xuICAgIH0pO1xuICAgIHZhciBtb2RlID0gb3B0aW9ucy5tb2RlO1xuICAgIHZhciB0ZXhNYXAgPSBvcHRpb25zLnRleE1hcDtcbiAgICB2YXIgbW9kZXMgPSBvcHRpb25zLm1vZGVzO1xuICAgIHZhciBjb2xsaXNpb24gPSBvcHRpb25zLmNvbGxpc2lvbjtcbiAgICB2YXIgdHlwZSA9IG9wdGlvbnMudHlwZTtcbiAgICB2YXIgcmFkaXVzID0gb3B0aW9ucy5yYWRpdXM7XG4gICAgdmFyIHJlbmRlcmVyID0gb3B0aW9ucy5yZW5kZXJlcjtcbiAgICB2YXIgY29udHJvbGxlciA9IG9wdGlvbnMuY29udHJvbGxlcjtcbiAgICB2YXIgaGVhbHRoID0gb3B0aW9ucy5oZWFsdGg7XG4gICAgdmFyIHBsYXllciA9IG9wdGlvbnMucGxheWVyO1xuICAgIHZhciB0YXJnZXQgPSBvcHRpb25zLnRhcmdldDtcbiAgICB2YXIgYXJzZW5hbCA9IG9wdGlvbnMuYXJzZW5hbDtcbiAgICB2YXIgY3VycmVudFdlYXBvbiA9IG9wdGlvbnMuY3VycmVudFdlYXBvbjtcbiAgICB2YXIgYW5pVGljayA9IDA7XG4gICAgdmFyIGVmZmVjdHMgPSBbXTtcbiAgICB2YXIgbmV3RWZmZWN0cyA9IFtdO1xuICAgIHZhciBpbWcgPSBzcHJpdGVNYXBzW29wdGlvbnMub3V0ZXJPcHRpb25zLmltZ107XG4gICAgdmFyIGNoYXJhY3RlciA9IHtcbiAgICAgICAgb25Ub3A6IHRydWUsXG4gICAgICAgIGFyc2VuYWw6IGFyc2VuYWwsXG4gICAgICAgIGN1cnJlbnRXZWFwb246IGN1cnJlbnRXZWFwb24sXG4gICAgICAgIGFuaW1hdGU6IHRydWUsXG4gICAgICAgIHBvdjogb3B0aW9ucy5wb3YsXG4gICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVyLFxuICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICBnZW9tZXRyeTogJ2NpcmNsZScsXG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICBpZDogb3B0aW9ucy5vdXRlck9wdGlvbnMuaW1nLFxuICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGUpIHtcbiAgICAgICAgICAgICAgICBhbmlUaWNrKys7XG4gICAgICAgICAgICAgICAgaWYgKGFuaVRpY2sgPiAxNiAtIHRoaXMudmVsb2NpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pVGljayA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBvc2UueCA8IHRleE1hcC5zbGlkZXNbdGhpcy5wb3NlLnldIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NlLngrKztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9zZS54ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaVRpY2srKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuY29udHJvbGxlciAmJiAhdGhpcy5lZGl0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3MueCArPSBNYXRoLmNvcyh0aGlzLnBvcy5yb3QpICogdGhpcy52ZWxvY2l0eTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy55ICs9IE1hdGguc2luKHRoaXMucG9zLnJvdCkgKiB0aGlzLnZlbG9jaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWZmZWN0cyA9IGVmZmVjdHMuZmlsdGVyKChmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpdGVtLmNhbGwodGhpcyk7IH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgZWZmZWN0cyA9IGVmZmVjdHMuY29uY2F0KG5ld0VmZmVjdHMpO1xuICAgICAgICAgICAgbmV3RWZmZWN0cyA9IFtdO1xuICAgICAgICAgICAgcmV0dXJuICF0aGlzLmRpZTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zOiBvcHRpb25zLm91dGVyT3B0aW9ucy5wb3MsXG4gICAgICAgIGltZzogaW1nLCBcbiAgICAgICAgbW92ZTogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICAgICAgfSxcbiAgICAgICAgdGV4TWFwOiB0ZXhNYXAsXG4gICAgICAgIGFkZEVmZmVjdDogZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgICAgIG5ld0VmZmVjdHMucHVzaChmbik7XG4gICAgICAgIH0sXG4gICAgICAgIGFkZE1vZGU6IGZ1bmN0aW9uKG1vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgICAgICBtb2Rlc1ttb2RlXS5jYWxsKGNoYXJhY3Rlcik7XG4gICAgICAgIH0sXG4gICAgICAgIHBvc2U6IHt4OiAwLCB5OiAwfSxcbiAgICAgICAgdmVsb2NpdHk6IDAsXG4gICAgICAgIG1vZGU6IG1vZGUsXG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGNvbGxpc2lvbjogY29sbGlzaW9uLFxuICAgICAgICByYWRpdXM6IHJhZGl1cyxcbiAgICAgICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgICAgICBoZWFsdGg6IGhlYWx0aFxuICAgIH07XG4gICAgY2hhcmFjdGVyLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hZGRNb2RlKHRoaXMubW9kZSk7XG4gICAgICAgIGlmICh0aGlzLmhlYWx0aCkge1xuICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRNb2RlKCdkZWFkJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNoYXJhY3Rlcjtcbn07XG5cbiIsInZhciBQbGF5ZXIgPSByZXF1aXJlKCcuL2VudGl0aWVzL1BsYXllci5qcycpO1xudmFyIExldmVscyA9IHt9O1xuXG5MZXZlbHNbJ29uZSddID0gcmVxdWlyZSgnLi9sZXZlbHMvb25lLmpzJyk7XG5cbnZhciBFbnRpdGllcyA9IHt9O1xuXG5FbnRpdGllc1snUGxheWVyJ10gPSByZXF1aXJlKCcuL2VudGl0aWVzL1BsYXllci5qcycpO1xuRW50aXRpZXNbJ1RpbGUnXSA9IHJlcXVpcmUoJy4vZW50aXRpZXMvVGlsZS5qcycpO1xuRW50aXRpZXNbJ1pvbWJpZSddID0gcmVxdWlyZSgnLi9lbnRpdGllcy9ab21iaWUuanMnKTtcbkVudGl0aWVzWydCbG9jayddID0gcmVxdWlyZSgnLi9lbnRpdGllcy9CbG9jay5qcycpO1xuRW50aXRpZXNbJ0Rvb3InXSA9IHJlcXVpcmUoJy4vZW50aXRpZXMvRG9vci5qcycpO1xuRW50aXRpZXNbJ1NlbnNvciddID0gcmVxdWlyZSgnLi9lbnRpdGllcy9TZW5zb3IuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsZXZlbElkKSB7XG4gICAgXG4gICAgcmV0dXJuIExldmVsc1tsZXZlbElkXS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgZW50aXR5ID0gRW50aXRpZXNbaXRlbS5lbnRpdHldKGl0ZW0pO1xuICAgICAgICB2YXIgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgZW50aXR5LmxldmVsID0gbGV2ZWxJZDtcbiAgICAgICAgZW50aXR5LmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgIGlmIChlbGFwc2VkID4gMjUwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGFjaXR5ID0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9wYWNpdHkgPSAoZWxhcHNlZCAvIDI1MCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBlbnRpdHk7XG4gICAgfSk7XG4gICAgXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBbXG5cbiAgICB7ZW50aXR5OiAnUGxheWVyJywgcG9zOiB7eDogMTAwLCB5OiAxMDAsIHJvdDogMH0sIGltZzogMH0sXG4gICAge2VudGl0eTogJ1RpbGUnLCBwb3M6IHt4OiAyNTAwLCB5OiAyNTAwfSwgd2lkdGg6IDUwMDAsIGhlaWdodDogNTAwMCwgcGF0aDogJy4vaW1nL2JhY2tncm91bmQuanBnJ30sXG4gICAge2VudGl0eTogJ0Jsb2NrJywgcGF0aDogJy4vaW1nL3dhbGwucG5nJywgcG9zOiB7eDogMCwgeTogMzkwMCwgcm90OiAwfSwgd2lkdGg6IDEwMCwgaGVpZ2h0OiAyNjAwfSxcbiAgICB7ZW50aXR5OiAnQmxvY2snLCBwYXRoOiAnLi9pbWcvd2FsbC5wbmcnLCBwb3M6IHt4OiAwLCB5OiAxMTAwLCByb3Q6IDB9LCB3aWR0aDogMTAwLCBoZWlnaHQ6IDIyMDB9LFxuICAgIHtlbnRpdHk6ICdCbG9jaycsIHBhdGg6ICcuL2ltZy93YWxsLnBuZycsIHBvczoge3g6IDI1MDAsIHk6IDAsIHJvdDogMH0sIHdpZHRoOiA1MDAwLCBoZWlnaHQ6IDEwMH0sXG4gICAge2VudGl0eTogJ0Jsb2NrJywgcGF0aDogJy4vaW1nL3dhbGwucG5nJywgcG9zOiB7eDogMjUwMCwgeTogNTAwMCwgcm90OiAwfSwgd2lkdGg6IDUwMDAsIGhlaWdodDogMTAwfSxcbiAgICB7ZW50aXR5OiAnQmxvY2snLCBwYXRoOiAnLi9pbWcvd2FsbC5wbmcnLCBwb3M6IHt4OiA1MDAwLCB5OiAyNTAwLCByb3Q6IDB9LCB3aWR0aDogMTAwLCBoZWlnaHQ6IDUwMDB9LFxuICAgIHtlbnRpdHk6ICdCbG9jaycsIHBhdGg6ICcuL2ltZy9jYXIxLnBuZycsIHBvczoge3g6IDMwMCwgeTogMzAwLCByb3Q6IDJ9LCB3aWR0aDogMjAwLCBoZWlnaHQ6IDMwMH0sXG4gICAge2VudGl0eTogJ1pvbWJpZScsIGltZzogMiwgcG9zOiB7eDogMTkwMCwgeTogMTcwMCwgcm90OiAwfX1cblxuXTtcblxuXG4iLCJ3aW5kb3cubG9nID0gJyc7XG5yZXF1aXJlKCcuL2FuaW1hdGlvblNoaW0uanMnKTtcbndpbmRvdy5yZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIuanMnKTtcbnZhciBlZGl0b3IgPSByZXF1aXJlKCcuL2VkaXRvci5qcycpO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgd2luZG93Lm9uZHJhZ3N0YXJ0ID0gZnVuY3Rpb24oKSB7IHJldHVybiBmYWxzZTsgfTtcbiAgICB2YXIgc3RhdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhdHMnKTtcbiAgICB2YXIgbmV3R2FtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdnYW1lJyk7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lVmlldycpO1xuICAgIHZhciBvcGVuaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29wZW5pbmcnKTtcbiAgICB2YXIgbGV2ZWxFZGl0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xldmVsRWRpdCcpO1xuICAgIG5ldyBBcnJheSgpLnNsaWNlLmNhbGwoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnd2VhcG9uJykpLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpdGVtLndpZHRoID0gMTAwO1xuICAgIH0pO1xuICAgIHZhciBzdGFydEdhbWUgPSBmdW5jdGlvbihlZGl0LCBlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVkaXQpO1xuICAgICAgICBuZXdHYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgIHN0YXJ0R2FtZSk7XG4gICAgICAgIHJlbmRlcmVyLmluaXQoe2NhbnZhczogJ2dhbWVWaWV3JywgcmVuZGVyZXI6IHJlbmRlcmVyLCBlZGl0OiBlZGl0fSk7XG4gICAgICAgIHJlbmRlcmVyLmxvYWRMZXZlbCgnb25lJyk7XG5cbiAgICAgICAgY2FudmFzLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICBvcGVuaW5nLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICByZW5kZXJlci5zdGFydCgpO1xuICAgIH07XG5cblxuXG4gICAgc3BsYXNoLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgc3BsYXNoLnN0eWxlLnRvcCA9ICgod2luZG93LmlubmVySGVpZ2h0IC0gc3BsYXNoLmhlaWdodCkgLyAyKSArICdweCc7XG4gICAgbmV3R2FtZS5zdHlsZS50b3AgPSAoKHdpbmRvdy5pbm5lckhlaWdodCAvIDIpICkgKyAncHgnO1xuICAgIG5ld0dhbWUuc3R5bGUubGVmdCA9ICgod2luZG93LmlubmVyV2lkdGggLyAyKSAtICBuZXdHYW1lLndpZHRoIC8gMiApICsgJ3B4JztcbiAgICBzcGxhc2guc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgbmV3R2FtZS5zdHlsZS5vcGFjaXR5ID0gMC41O1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgNDUwMCk7Ly9zcGxhc2gud2lkdGgpO1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIDIxMDApOy8vc3BsYXNoLmhlaWdodCk7XG4gICAgY2FudmFzLnN0eWxlLndpZHRoID0gc3BsYXNoLndpZHRoICsgJ3B4JztcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gc3BsYXNoLmhlaWdodCArICdweCc7XG4gICAgY2FudmFzLnN0eWxlLnRvcCA9ICgod2luZG93LmlubmVySGVpZ2h0IC0gc3BsYXNoLmhlaWdodCkgLyAyKSArICdweCc7XG4gICAgc3RhdHMuc3R5bGUudG9wID0gY2FudmFzLnN0eWxlLnRvcDtcblxuICAgIHdpbmRvdy5nYW1lT3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZW5kZXJlci5jbGVhciA9IHRydWU7XG4gICAgICAgIHZhciB0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG9wZW5pbmcuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgICAgICBuZXdHYW1lLnN0eWxlLm9wYWNpdHkgPSAwLjU7XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICAgICAgICBuZXdHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgIHN0YXJ0R2FtZSk7XG4gICAgICAgICAgICB2YXIgdCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyZXIuc3RvcCgpO1xuICAgICAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICB9LCA1MDApO1xuXG4gICAgfVxuICAgIGxldmVsRWRpdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN0YXJ0R2FtZS5iaW5kKG51bGwsIHRydWUpKTtcbiAgICBuZXdHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgIHN0YXJ0R2FtZS5iaW5kKG51bGwsIGZhbHNlKSk7XG4gICAgbmV3R2FtZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsICBmdW5jdGlvbihlKSB7XG4gICAgICAgIG5ld0dhbWUuc3R5bGUub3BhY2l0eSA9IC41O1xuICAgIH0pO1xuICAgIG5ld0dhbWUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgbmV3R2FtZS5zdHlsZS5vcGFjaXR5ID0gLjc1O1xuICAgIH0pO1xufTtcblxuXG5cbi8vcmVuZGVyZXIuc3RlcCgpO1xuLy9yZW5kZXJlci5zdGVwKCk7XG5cblxuXG4iLCJ2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbi8vaW1hZ2Uuc3JjID0gJy4vaW1nL2JhdHN3aW5nLnBuZyc7XG5pbWFnZS5zcmMgPSAnLi9pbWcvYmFzZWJhbGxiYXQucG5nJztcblxudmFyIE1lZWxlZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG5cbiAgICB2YXIgbWVlbGVlID0ge1xuICAgICAgICBwb3dlcjogb3B0aW9ucy5wb3dlcixcbiAgICAgICAgb25Ub3A6IHRydWUsXG4gICAgICAgIGdlb21ldHJ5OiAnY2lyY2xlJyxcbiAgICAgICAgdHlwZTogJ21lZWxlZScsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIHJhZGl1czogMTAwLFxuICAgICAgICBpbWc6IGltYWdlLFxuICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgIHg6IG9wdGlvbnMucGFyZW50LnBvcy54ICsgTWF0aC5jb3Mob3B0aW9ucy5yb3QpICogNTAsXG4gICAgICAgICAgICB5OiBvcHRpb25zLnBhcmVudC5wb3MueSArIE1hdGguc2luKG9wdGlvbnMucm90KSAqIDUwLFxuICAgICAgICAgICAgcm90OiBvcHRpb25zLnJvdFxuICAgICAgICB9LFxuICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRpZSB8fCBEYXRlLm5vdygpIC0gMjUwID4gc3RhcnQpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5wb3MueCA9IG9wdGlvbnMucGFyZW50LnBvcy54ICsgTWF0aC5jb3ModGhpcy5wb3Mucm90KSAqIDUwO1xuICAgICAgICAgICAgdGhpcy5wb3MueSA9IG9wdGlvbnMucGFyZW50LnBvcy55ICsgTWF0aC5zaW4odGhpcy5wb3Mucm90KSAqIDUwO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbGxpc2lvbjoge1xuICAgICAgICAgICAgem9tYmllOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpZSA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaHVtYW46IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYnVsbGV0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJsb2NrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpZSA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWVlbGVlOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdvYWw6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICB3ZWFwb246IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICBhY3RpdmF0aW9uOiBmdW5jdGlvbigpIHt9XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbWVlbGVlO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lZWxlZTtcbiIsInZhciBjb2xsaXNpb24gPSByZXF1aXJlKCcuL2NvbGxpc2lvbi5qcycpO1xudmFyIGF1ZGlvID0gcmVxdWlyZSgnLi9hdWRpby5qcycpO1xudmFyIGxldmVsUmVhZGVyID0gcmVxdWlyZSgnLi9sZXZlbFJlYWRlcicpO1xudmFyIGVkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG52YXIgY3VycmVudExldmVsO1xudmFyIHBvdjtcbnZhciBwbGF5ZXI7XG5cbnZhciBzdGVwID0gZnVuY3Rpb24oKSB7XG5cbiAgICBjb2xsaXNpb24ocmVuZGVyZXIud29ybGQpO1xuICAgIGlmIChwb3YpIGF1ZGlvLnVwZGF0ZVBvdihwb3YucG9zKTtcbiAgICByZW5kZXJlci53b3JsZC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEub25Ub3A7XG4gICAgfSk7XG5cbiAgICBpZiAoZWRpdCkgZWRpdG9yLnN0ZXAoKTtcbiAgICByZW5kZXJlci5jYW52YXMud2lkdGggPSByZW5kZXJlci5jYW52YXMud2lkdGg7XG4gICAgcmVuZGVyZXIud29ybGQgPSByZW5kZXJlci53b3JsZC5maWx0ZXIoZnVuY3Rpb24oaXRlbSkgeyBcbiAgICAgICAgdmFyIHdpZHRoLCBoZWlnaHQsIHN4LCBzeSwgaSwgaW1nV2lkdGgsIGltZ0hlaWdodCwgcGF0dGVybjtcbiAgICAgICAgaXRlbS5lZGl0ID0gZWRpdDtcbiAgICAgICAgaWYgKGl0ZW0ucGxheWVyKSB7XG4gICAgICAgICAgICBwbGF5ZXIgPSBpdGVtO1xuICAgICAgICAgICAgaXRlbS5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoaXRlbS5hdWRpbykge1xuICAgICAgICAgICAgYXVkaW9baXRlbS50eXBlXVtpdGVtLmF1ZGlvXShpdGVtLnBvcyk7XG4gICAgICAgICAgICBpdGVtLmF1ZGlvID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXRlbS52aXNpYmxlICYmIHBvdikge1xuICAgICAgICAgICAgaWYgKGl0ZW0ucG9zLnJvdCA+IE1hdGguUEkgKiAyKSBpdGVtLnBvcy5yb3QgLT0gTWF0aC5QSSAqIDI7XG4gICAgICAgICAgICBpZiAoaXRlbS5wb3Mucm90IDwgMCkgaXRlbS5wb3Mucm90ICs9IE1hdGguUEkgKiAyO1xuICAgICAgICAgICAgaWYgKGl0ZW0udGV4TWFwKSB7XG4gICAgICAgICAgICAgICAgaW1nV2lkdGggPSB3aWR0aCA9IGl0ZW0uaW1nLndpZHRoIC8gaXRlbS50ZXhNYXAueDtcbiAgICAgICAgICAgICAgICBpbWdIZWlnaHQgPSBoZWlnaHQgPSBpdGVtLmltZy5oZWlnaHQgLyBpdGVtLnRleE1hcC55O1xuICAgICAgICAgICAgICAgIHN4ID0gd2lkdGggKiBpdGVtLnBvc2UueDtcbiAgICAgICAgICAgICAgICBzeSA9IGhlaWdodCAqIGl0ZW0ucG9zZS55O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5pbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBpdGVtLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBpdGVtLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgaW1nV2lkdGggPSBpdGVtLmltZy53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgaW1nSGVpZ2h0ID0gaXRlbS5pbWcuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBzeCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHN5ID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgY3R4ID0gcmVuZGVyZXIuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICB2YXIgcG9zID0ge307XG4gICAgICAgICAgICBwb3MueCA9IDIyNTAgKyAoaXRlbS5wb3MueCAtIHBvdi5wb3MueCkgLSB3aWR0aCAvIDI7XG4gICAgICAgICAgICBwb3MueSA9IDE5MDAgKyAoaXRlbS5wb3MueSAtIHBvdi5wb3MueSkgLSBoZWlnaHQgLyAyO1xuICAgICAgICAgICAgY3R4LnNhdmUoKTsgXG5cbiAgICAgICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IGl0ZW0ub3BhY2l0eSB8fCAxO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgyMjUwICwgMTkwMCApO1xuICAgICAgICAgICAgY3R4LnJvdGF0ZSgtIHBvdi5wb3Mucm90IC0gTWF0aC5QSSAvIDIpO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSggLSAoMjI1MCApLCAtICgxOTAwICkpO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSggcG9zLnggKyB3aWR0aCAvIDIsIHBvcy55ICsgaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICBjdHgucm90YXRlKCBpdGVtLnBvcy5yb3QgKTtcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjRkYwMDAwJztcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSAyMDtcbiAgICAgICAgICAgIGlmIChpdGVtLnBhdHRlcm4pIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gY3R4LmNyZWF0ZVBhdHRlcm4oaXRlbS5pbWcsICdyZXBlYXQnKTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5oaWdobGlnaHQgfHwgaXRlbS5lZGl0aW5nKSBjdHguc3Ryb2tlUmVjdCgtd2lkdGggLyAyLCAtIGhlaWdodCAvIDIsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmVkaXRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgICAgICAgICAgICAgIGN0eC5hcmMoLXdpZHRoIC8gMiwgLWhlaWdodCAvIDIsIDUwLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgICAgICAgICAgICAgIGN0eC5hcmMoLXdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgNTAsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgICAgICAgICAgICAgY3R4LmFyYyh3aWR0aCAvIDIsIC1oZWlnaHQgLyAyLCA1MCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKVxuICAgICAgICAgICAgICAgICAgICBjdHguYXJjKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgNTAsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gcGF0dGVybjtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoLXdpZHRoIC8gMiwgLSBoZWlnaHQgLyAyLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaW1nKSBjdHguZHJhd0ltYWdlKGl0ZW0uaW1nLCBzeCwgc3ksIGltZ1dpZHRoLCBpbWdIZWlnaHQsIC0gd2lkdGggLyAyLCAtIGhlaWdodCAvIDIsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmhpZ2hsaWdodCB8fCBpdGVtLmVkaXRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgICAgICAgICAgICAgIGN0eC5hcmMoMCwgMCwgNTAsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbS5zdGVwLmNhbGwoaXRlbSk7IFxuICAgIH0pO1xuICAgIHJlbmRlcmVyLndvcmxkID0gcmVuZGVyZXIud29ybGQuY29uY2F0KHJlbmRlcmVyLm5ld0l0ZW1zKTtcbiAgICByZW5kZXJlci5uZXdJdGVtcyA9IFtdO1xuICAgIGlmIChyZW5kZXJlci5jbGVhcikge1xuICAgICAgICByZW5kZXJlci53b3JsZCA9IFtdO1xuICAgICAgICByZW5kZXJlci5jbGVhciA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChlZGl0KSB7XG4gICAgICAgIHBvdiA9IGVkaXRvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwb3YgPSBwbGF5ZXI7XG4gICAgfVxuXG5cbn07XG52YXIgcGxheWluZyA9IGZhbHNlO1xudmFyIGVkaXQgPSBmYWxzZTtcbnZhciByZW5kZXJlciA9IHtcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHJlbmRlcmVyLmxldmVsID0gb3B0aW9ucy5sZXZlbDtcbiAgICAgICAgcmVuZGVyZXIud29ybGQgPSBbXTtcbiAgICAgICAgcmVuZGVyZXIuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob3B0aW9ucy5jYW52YXMpO1xuICAgICAgICBpZiAob3B0aW9ucy5lZGl0KSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHsgcmVuZGVyZXIuZWRpdCh0cnVlKTsgfSwgNTAwKTtcbiAgICB9LFxuICAgIGVkaXQ6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICAgIGlmICghZWRpdCAmJiBzdGF0ZSkge1xuICAgICAgICAgICAgcGxheWVyLmNvbnRyb2xsZXIuc3RvcCgpO1xuICAgICAgICAgICAgZWRpdG9yLmNvbnRyb2xsZXIuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWRpdCAmJiAhc3RhdGUpIHtcbiAgICAgICAgICAgIHBsYXllci5jb250cm9sbGVyLnN0YXJ0KCk7XG4gICAgICAgICAgICBlZGl0b3IuY29udHJvbGxlci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWRpdCA9IHN0YXRlO1xuXG4gICAgfSxcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChwb3YpIHBvdi5jb250cm9sbGVyLnN0YXJ0KCk7XG4gICAgICAgIHZhciBhbmltYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzdGVwKCk7XG4gICAgICAgICAgICBpZiAocGxheWluZykgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFwbGF5aW5nKSB7XG4gICAgICAgICAgICBwbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGFuaW1hdGUoKTtcbiAgICAgICAgfVxuXG4gICAgfSxcbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcGxheWluZyA9IGZhbHNlO1xuICAgIH0sXG4gICAgc3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0ZXAoKTtcbiAgICB9LFxuICAgIGxvYWRMZXZlbDogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgXG4gICAgICAgIGlmIChjdXJyZW50TGV2ZWwpIHtcbiAgICAgICAgICAgIHJlbmRlcmVyLndvcmxkLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmxldmVsICYmIGl0ZW0ubGV2ZWwgPT09IGN1cnJlbnRMZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGFwc2VkID4gMjUwKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wYWNpdHkgPSAxIC0gKGVsYXBzZWQgLyAyNTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpdGVtcyA9IGxldmVsUmVhZGVyKGlkKTtcbiAgICAgICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7IFxuICAgICAgICAgICAgaXRlbS5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVuZGVyZXIubmV3SXRlbXMgPSByZW5kZXJlci5uZXdJdGVtcy5jb25jYXQoaXRlbXMpO1xuICAgICAgICBjdXJyZW50TGV2ZWwgPSBpZDtcbiAgICB9LFxuICAgIG5ld0l0ZW1zOiBbXVxufTtcblxuZWRpdG9yLnJlbmRlcmVyID0gcmVuZGVyZXI7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyZXI7XG4iLCJ2YXIga2V5c1ByZXNzZWQgPSBbXTtcbnZhciBzd2l0Y2hXZWFwb24sIGFjdGl2YXRlO1xuXG5cbnZhciB3YXNkID0ge1xuICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgIHg6IDAsXG4gICAgcmVzcG9uc2VFZmZlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IDEyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IDg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGVmdCB8fCB0aGlzLnJpZ2h0KSB0aGlzLnZlbG9jaXR5ICo9IDAuODtcbiAgICAgICAgaWYgKCF0aGlzLmxlZnQgJiYgIXRoaXMucmlnaHQgJiYgIXRoaXMudXAgJiYgIXRoaXMuZG93bikge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudXApIHsgXG4gICAgICAgICAgICB0aGlzLnBvcy54ICs9IE1hdGguY29zKHRoaXMucG9zLnJvdCkgKiB0aGlzLnZlbG9jaXR5O1xuICAgICAgICAgICAgdGhpcy5wb3MueSArPSBNYXRoLnNpbih0aGlzLnBvcy5yb3QpICogdGhpcy52ZWxvY2l0eTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxlZnQpIHsgXG4gICAgICAgICAgICB0aGlzLnBvcy54ICs9IE1hdGguY29zKHRoaXMucG9zLnJvdCAtIE1hdGguUEkgLyAyKSAqIDQ7XG4gICAgICAgICAgICB0aGlzLnBvcy55ICs9IE1hdGguc2luKHRoaXMucG9zLnJvdCAtIE1hdGguUEkgLyAyKSAqIDQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZG93bikgeyBcbiAgICAgICAgICAgIHRoaXMucG9zLnggKz0gTWF0aC5jb3ModGhpcy5wb3Mucm90IC0gTWF0aC5QSSkgKiA0O1xuICAgICAgICAgICAgdGhpcy5wb3MueSArPSBNYXRoLnNpbih0aGlzLnBvcy5yb3QgLSBNYXRoLlBJKSAqIDQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHQpIHsgXG4gICAgICAgICAgICB0aGlzLnBvcy54ICs9IE1hdGguY29zKHRoaXMucG9zLnJvdCAtIE1hdGguUEkgKiAxLjUpICogNDtcbiAgICAgICAgICAgIHRoaXMucG9zLnkgKz0gTWF0aC5zaW4odGhpcy5wb3Mucm90IC0gTWF0aC5QSSAqIDEuNSkgKiA0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzd2l0Y2hXZWFwb24pIHtcbiAgICAgICAgICAgIHN3aXRjaFdlYXBvbiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5uZXh0V2VhcG9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGl2YXRlKSB7XG4gICAgICAgICAgICBhY3RpdmF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZS5jYWxsKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgcmlnaHRDbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAzIHx8IGUuYnV0dG9uID09PSAyKSB7XG4gICAgICAgICAgICB3YXNkLnggPSBlLmNsaWVudFg7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgd2FzZC5mb2xsb3dNb3VzZSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHdhc2QucmlnaHRVcCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGxlZnRDbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS53aGljaCA9PT0gMSB8fCBlLmJ1dHRvbiA9PT0gMSkge1xuICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5hZGRNb2RlKCdzaG9vdGluZycpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB3YXNkLmxlZnRVcCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGZvbGxvd01vdXNlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICAgICAgd2FzZC5jb250cm9sbGluZy5wb3Mucm90ICs9IChlLmNsaWVudFggLSB3YXNkLngpIC8gMTUwO1xuICAgICAgICB3YXNkLnggPSBlLmNsaWVudFg7XG4gICAgfSxcbiAgICByaWdodFVwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDMgfHwgZS5idXR0b24gPT09IDIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB3YXNkLmZvbGxvd01vdXNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgd2FzZC5yaWdodFVwKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgbGVmdFVwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAxIHx8IGUuYnV0dG9uID09PSAxKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHdhc2QubGVmdFVwKTtcbiAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcuYWRkTW9kZSgnc3RhbmRpbmcnKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAga2V5UHJlc3M6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gOSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc3dpdGNoV2VhcG9uID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMikge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgYWN0aXZhdGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICB9LFxuXG4gICAga2V5RG93bjogZnVuY3Rpb24oZSkge1xuXG4gICAgICAgIGlmICh0aGlzLmluZGV4T2YoZS5rZXlDb2RlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucHVzaChlLmtleUNvZGUpO1xuICAgICAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDg3OiBcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy51cCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcuZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDY1OiBcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5yaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDgzOiBcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy51cCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDY4OiBcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5yaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcubGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0uYmluZChrZXlzUHJlc3NlZCksXG4gICAga2V5VXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5zcGxpY2UodGhpcy5pbmRleE9mKGUua2V5Q29kZSksIDEpO1xuICAgICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODc6IFxuICAgICAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcudXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRleE9mKDgzKSAhPT0gLTEpIHdhc2QuY29udHJvbGxpbmcuZG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY1OiBcbiAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLmxlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRleE9mKDY4KSAhPT0gLTEpIHdhc2QuY29udHJvbGxpbmcucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogXG4gICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kZXhPZig4NykgIT09IC0xKSB3YXNkLmNvbnRyb2xsaW5nLnVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjg6IFxuICAgICAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcucmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRleE9mKDY1KSAhPT0gLTEpIHdhc2QuY29udHJvbGxpbmcubGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgIH0uYmluZChrZXlzUHJlc3NlZCksXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXdhc2Quc3RhcnRlZCkge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHdhc2QucmlnaHRDbGljayk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgd2FzZC5sZWZ0Q2xpY2spO1xuXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHdhc2Qua2V5RG93bik7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHdhc2Qua2V5UHJlc3MpO1xuXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB3YXNkLmtleVVwKTtcbiAgICAgICAgfVxuICAgICAgICB3YXNkLnN0YXJ0ZWQgPSB0cnVlO1xuICAgIH0sXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB3YXNkLnJpZ2h0Q2xpY2spO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgd2FzZC5sZWZ0Q2xpY2spO1xuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgd2FzZC5rZXlEb3duKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB3YXNkLmtleVByZXNzKTtcblxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB3YXNkLmtleVVwKTtcblxuICAgIH0sXG5cbiAgICBjb250cm9sbGluZzogbnVsbFxuXG59O1xuXG53aW5kb3cub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gd2FzZDtcbiIsInZhciBCdWxsZXQgPSByZXF1aXJlKCcuL2J1bGxldC5qcycpO1xudmFyIE1lZWxlZSA9IHJlcXVpcmUoJy4vbWVlbGVlLmpzJyk7XG52YXIgcGlzdG9sSW1nID0gbmV3IEltYWdlKCk7XG5waXN0b2xJbWcuc3JjID0gJy4vaW1nL3Bpc3RvbC5wbmcnO1xudmFyIG1hY2hpbmVJbWcgPSBuZXcgSW1hZ2UoKTtcbm1hY2hpbmVJbWcuc3JjID0gJy4vaW1nL21hY2hpbmVndW4ucG5nJztcbnZhciBzaG90Z3VuSW1nID0gbmV3IEltYWdlKCk7XG5zaG90Z3VuSW1nLnNyYyA9ICcuL2ltZy9zaG90Z3VuLnBuZyc7XG52YXIgYmFzZWJhbGxJbWcgPSBuZXcgSW1hZ2UoKTtcbmJhc2ViYWxsSW1nLnNyYyA9ICcuL2ltZy9iYXNlYmFsbGJhdC5wbmcnO1xuXG52YXIgd2VhcG9uU3RhdHMgPSB7XG4gICAgYW1tbzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FtbW8nKSxcbiAgICBiYXNlYmFsbEJhdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jhc2ViYWxsYmF0JyksXG4gICAgcGlzdG9sOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGlzdG9sJyksXG4gICAgc2hvdGd1bjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3RndW4nKSxcbiAgICByaWZsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JpZmxlJylcbn1cblxuXG52YXIgZHJvcCA9IGZ1bmN0aW9uKGRyb3BwZXIsIHdlYXBvbikge1xuICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25Ub3A6IHRydWUsXG4gICAgICAgIG5hbWU6IHdlYXBvbnNbd2VhcG9uXS5uYW1lLFxuICAgICAgICBpbWc6IHdlYXBvbnNbd2VhcG9uXS5pbWcsXG4gICAgICAgIHBvczoge1xuICAgICAgICAgICAgeDogZHJvcHBlci5wb3MueCxcbiAgICAgICAgICAgIHk6IGRyb3BwZXIucG9zLnksXG4gICAgICAgICAgICByb3Q6IDBcbiAgICAgICAgfSxcbiAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgZ2VvbWV0cnk6ICdjaXJjbGUnLFxuICAgICAgICByYWRpdXM6IDUwLFxuICAgICAgICB0eXBlOiAnd2VhcG9uJyxcbiAgICAgICAgY29sbGlzaW9uOiB7XG4gICAgICAgICAgICBodW1hbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWUgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJ1bGxldDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgIGJsb2NrOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgZ29hbDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgIG1lZWxlZTogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgIHpvbWJpZTogZnVuY3Rpb24oem9tYmllKSB7fSxcbiAgICAgICAgICAgIHdlYXBvbjogZnVuY3Rpb24oKSB7fVxuICAgICAgICB9LFxuICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gc3RhcnQgPiAyMDAwMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5wb3Mucm90ICs9IC4wNTtcbiAgICAgICAgICAgIGlmICghdGhpcy5kaWUpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuXG52YXIgd2VhcG9ucyA9IHtcbiAgICBiYXNlYmFsbEJhdDoge1xuICAgICAgICBhbW1vOiAxLFxuICAgICAgICByZWxvYWQ6IDEwLFxuICAgICAgICB0eXBlOiAnbWVlbGVlJyxcbiAgICAgICAgbmFtZTogJ2Jhc2ViYWxsQmF0JyxcbiAgICAgICAgZmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goTWVlbGVlKHtuYW1lOiAnYmF0JywgcGFyZW50OiB0aGlzLCB4OiB0aGlzLnBvcy54LCB5OiB0aGlzLnBvcy55LCByb3Q6IHRoaXMucG9zLnJvdCwgcG93ZXI6IDEwfSkpO1xuICAgICAgICAgICAgdGhpcy5hdWRpbyA9ICdiYXQnO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0OiAncGlzdG9sJ1xuICAgIH0sXG4gICAgcGlzdG9sOiB7XG4gICAgICAgIGZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5uZXdJdGVtcy5wdXNoKEJ1bGxldCh7bmFtZTogJ3Bpc3RvbCcsIHg6IHRoaXMucG9zLngsIHk6IHRoaXMucG9zLnksIHJvdDogdGhpcy5wb3Mucm90LCB2ZWxvY2l0eTogMzAsIHJhbmdlOiA1MCwgcG93ZXI6IDIwfSkpO1xuICAgICAgICAgICAgdGhpcy5hdWRpbyA9ICdwaXN0b2wnO1xuICAgICAgICAgICAgd2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmFtbW8tLTtcbiAgICAgICAgfSxcbiAgICAgICAgaW1nOiBwaXN0b2xJbWcsXG4gICAgICAgIGFtbW86IDIwLFxuICAgICAgICBwaWNrdXBBbW1vOiAyMCxcbiAgICAgICAgcG93ZXI6IDIwLFxuICAgICAgICByYW5nZTogNDAwMCxcbiAgICAgICAgcmVsb2FkOiAxMCxcbiAgICAgICAgdHlwZTogJ3Byb2plY3RpbGUnLFxuICAgICAgICBuYW1lOiAncGlzdG9sJyxcbiAgICAgICAgZmFpbDogJ2Jhc2ViYWxsQmF0JyxcbiAgICAgICAgZHJvcDogZHJvcCxcbiAgICAgICAgbmV4dDogJ3Nob3RndW4nXG4gICAgfSxcbiAgICBzaG90Z3VuOiB7XG4gICAgICAgIGltZzogc2hvdGd1bkltZyxcbiAgICAgICAgZmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGV2aWF0aW9uLCBpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgICAgIGRldmlhdGlvbiA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAvIDM7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5uZXdJdGVtcy5wdXNoKEJ1bGxldCh7bmFtZTogJ3Nob3RndW4nLCB4OiB0aGlzLnBvcy54LCB5OiB0aGlzLnBvcy55LCByb3Q6IHRoaXMucG9zLnJvdCArIGRldmlhdGlvbiwgdmVsb2NpdHk6IDIwLCByYW5nZTogMzAsIHBvd2VyOiA3fSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmFtbW8tLTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW8gPSAnc2hvdGd1bic7XG4gICAgICAgIH0sXG4gICAgICAgIGFtbW86IDEwLFxuICAgICAgICBwaWNrdXBBbW1vOiAyMCxcbiAgICAgICAgcG93ZXI6IDUsXG4gICAgICAgIHJhbmdlOiAxNTAwLFxuICAgICAgICByZWxvYWQ6IDQwLFxuICAgICAgICB0eXBlOiAncHJvamVjdGlsZScsXG4gICAgICAgIG5hbWU6ICdzaG90Z3VuJyxcbiAgICAgICAgZmFpbDogJ3Bpc3RvbCcsXG4gICAgICAgIGRyb3A6IGRyb3AsXG4gICAgICAgIG5leHQ6ICdyaWZsZSdcblxuICAgIH0sXG4gICAgcmlmbGU6IHtcbiAgICAgICAgaW1nOiBtYWNoaW5lSW1nLFxuICAgICAgICBmaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIubmV3SXRlbXMucHVzaChCdWxsZXQoe25hbWU6ICdyaWZsZScsIHg6IHRoaXMucG9zLngsIHk6IHRoaXMucG9zLnksIHJvdDogdGhpcy5wb3Mucm90LCB2ZWxvY2l0eTogNTAsIHJhbmdlOiA4MCwgcG93ZXI6IDMwfSkpO1xuICAgICAgICAgICAgd2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLmFtbW8tLTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW8gPSAncmlmbGUnO1xuICAgICAgICB9LFxuICAgICAgICBhbW1vOiAyMCxcbiAgICAgICAgcGlja3VwQW1tbzogMjAsXG4gICAgICAgIHBvd2VyOiAyNSxcbiAgICAgICAgcmFuZ2U6IDQwMDAsXG4gICAgICAgIHJlbG9hZDogNSxcbiAgICAgICAgdHlwZTogJ3Byb2plY3RpbGUnLFxuICAgICAgICBmYWlsOiAnc2hvdGd1bicsXG4gICAgICAgIG5hbWU6ICdyaWZsZScsXG4gICAgICAgIGRyb3A6IGRyb3AsXG4gICAgICAgIG5leHQ6ICdiYXNlYmFsbEJhdCdcblxuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgICAgICAgdmFyIHdlYXBvbiA9IHdlYXBvbnNbcGxheWVyLmN1cnJlbnRXZWFwb25dO1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgZm9yIChpIGluIHdlYXBvbnMpIHtcbiAgICAgICAgICAgIGlmICh3ZWFwb25zW2ldLmFtbW8pIHtcbiAgICAgICAgICAgICAgICB3ZWFwb25TdGF0c1tpXS5zdHlsZS5ib3JkZXIgPSAnJztcbiAgICAgICAgICAgICAgICB3ZWFwb25TdGF0c1tpXS5zdHlsZS5kaXNwbGF5ID0gJ2luaGVyaXQnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAod2VhcG9uU3RhdHNbaV0pIHdlYXBvblN0YXRzW2ldLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgd2VhcG9uU3RhdHNbcGxheWVyLmN1cnJlbnRXZWFwb25dLnN0eWxlLmJvcmRlciA9ICcxcHggc29saWQgd2hpdGUnO1xuXG4gICAgICAgIGlmICh3ZWFwb24ubmFtZSAhPT0gJ2Jhc2ViYWxsQmF0Jykge1xuICAgICAgICAgICAgd2VhcG9uU3RhdHMuYW1tby5pbm5lclRleHQgPSB3ZWFwb24uYW1tbztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdlYXBvblN0YXRzLmFtbW8uaW5uZXJUZXh0ID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF3ZWFwb24uYW1tbykge1xuICAgICAgICAgICAgcGxheWVyLmN1cnJlbnRXZWFwb24gPSB3ZWFwb24uZmFpbDtcbiAgICAgICAgICAgIHdlYXBvbnMudXBkYXRlKHBsYXllcik7XG4gICAgICAgIH1cblxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gd2VhcG9ucztcbiJdfQ==
