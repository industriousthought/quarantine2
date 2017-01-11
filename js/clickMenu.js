var DomMenu = document.getElementsByTagName('body')[0].appendChild(document.createElement('ul'));
DomMenu.setAttribute('id', 'clickMenu');
var menuObjMouseOver = function(obj, e) {
    obj.highlight = true;
    console.log(obj + ', ' + e);
};
var menuObjMouseOut = function(obj, e) {
    console.log('mouseOut');
    obj.highlight = false;
};
var editObj = function(obj, e) {
    obj.editing = true;
    clickMenu.editing = obj;
};

var clickMenu = function(options) {

    while (DomMenu.firstChild) { DomMenu.removeChild(DomMenu.firstChild); }
    DomMenu.style.display = 'inherit';
    DomMenu.style.top = parseInt(options.mousePos.x) + 'px';
    DomMenu.style.left = parseInt(options.mousePos.y) + 'px';

    var objs = [];
    
    return clickMenu = {
        editing: false,
        visible: true,
        highlight: true,
        geometry: 'circle',
        onTop: true,
        radius: 50,
        kill: function() {
            DomMenu.style.display = 'none';
        },
        type: 'clickMenu',
        step: function() {
            return false;
        },
        pos: options.pos,
        addObj: function(obj) {
            var li = document.createElement('li');
            li.addEventListener('mouseover', menuObjMouseOver.bind(li, obj));
            li.addEventListener('click', editObj.bind(li, obj));
            li.addEventListener('mouseout', menuObjMouseOut.bind(li, obj));
            li.innerText = obj.type;
            DomMenu.appendChild(li);

            objs.push(obj);
        },
        collision: {
            zombie: function (zombie) {
                clickMenu.addObj(zombie);
            }
        }

    };


};


module.exports = clickMenu;


