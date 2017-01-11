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

