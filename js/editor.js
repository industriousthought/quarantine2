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
