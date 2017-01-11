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


