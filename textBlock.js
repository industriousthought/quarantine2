var block = require('./js/block.js')({path: './img/wall.png', pos: {x: 0, y: 2500, rot: 0}, width: 100, height: 5000});
var point = {x: 40, y: 1000}
console.log(block.testPoint(point));

