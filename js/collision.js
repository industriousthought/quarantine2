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
