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
