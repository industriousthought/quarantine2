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
