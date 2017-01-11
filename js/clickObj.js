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


