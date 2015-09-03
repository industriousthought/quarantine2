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

