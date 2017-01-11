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
