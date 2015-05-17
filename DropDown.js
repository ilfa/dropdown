
var DropDown = (function() {

    /**
     *
     * @param options
     * @param options.container {Element}
     * @param options.data {Array}
     * @param options.showPhoto {Boolean|Undefined}
     * @constructor
     */
    var DropDown = function (options) {
        this._container = options.container;
        this._input = null;
        this._list = null;

        this._showPhoto = !!(typeof options.showPhoto == 'undefined' || options.showPhoto);


        this._createDropDown();

        this._addEvents();


        for (var i in options.data) {
            this._createDropDownItem(options.data[i]);
        }
    };

    DropDown.prototype._templates = {
        itemPhoto: '<img src="$photo" class="dropDown__itemPhoto">',
        itemText: '<div class="dropDown__itemText">$name</div>'
    };


    DropDown.prototype._addEvents = function () {
        DomEvent.addEvent(this._input, 'click', this._update, this);
        DomEvent.addEvent(this._input, 'keyup', this._update, this);
        DomEvent.addEvent(this._input, 'blur', this._hide, this);
    };

    DropDown.prototype._update = function(e) {
        console.log(this._input.value);
        DomUtil.removeClass(this._list, '_hidden');
    };

    DropDown.prototype._hide = function() {
        DomUtil.addClass(this._list, '_hidden');
    };

    DropDown.prototype._createDropDown = function () {

        DomUtil.addClass(this._container, 'dropDown__Container');

        this._selectedItems = document.createElement('div');
        this._selectedItems.className = 'dropDown__selectedItems';
        this._selectedItems.innerText = 'qwerty';

        this._input = document.createElement('input');
        this._input.type = 'text';
        this._input.className = 'dropDown__input';

        this._list = document.createElement('ul');
        this._list.className = 'dropDown__list';

        this._container.appendChild(this._selectedItems);
        this._container.appendChild(this._input);
        this._container.appendChild(this._list);

        DomUtil.addClass(this._list, '_hidden');
    };

    /**
     *
     * @param template {String}
     * @param data {Object}
     * @returns {String}
     * @private
     */
    DropDown.prototype._render = function(template, data) {
        var result = this._templates[template];
        for (var varName in data) {
            if (data.hasOwnProperty(varName)) {
                result = result.replace('$' + varName, data[varName]);
            }
        }
        return result;
    };

    /**
     *
     * @param contact {Object}
     * @param contact.name {String}
     * @param contact.photo {String}
     * @returns {Element}
     * @private
     */
    DropDown.prototype._createDropDownItem = function(contact) {
        var item = document.createElement('li');
        item.className = 'dropDown__listItem';

        var itemBody = '';

        if (this._showPhoto && contact.photo) {
            itemBody += this._render('itemPhoto', {photo: contact.photo});
        }
        itemBody += this._render('itemText', {name: contact.name});

        item.innerHTML = itemBody;
        this._list.appendChild(item);
        return item;
    };


    var DomUtil = {
        hasClass: function (el, name) {
            if (el.classList !== undefined) {
                return el.classList.contains(name);
            }
            var className = DomUtil.getClass(el);
            return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
        },

        addClass: function (el, name) {
            if (el.classList !== undefined) {
                var classes = Util.splitWords(name);
                for (var i = 0, len = classes.length; i < len; i++) {
                    el.classList.add(classes[i]);
                }
            } else if (!DomUtil.hasClass(el, name)) {
                var className = DomUtil.getClass(el);
                DomUtil.setClass(el, (className ? className + ' ' : '') + name);
            }
        },

        removeClass: function (el, name) {
            if (el.classList !== undefined) {
                el.classList.remove(name);
            } else {
                DomUtil.setClass(el, Util.trim((' ' + DomUtil.getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
            }
        },

        setClass: function (el, name) {
            el.className = name;
        },

        getClass: function (el) {
            return el.className;
        }
    };

    var Util = {
        trim: function (str) {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
        },

        splitWords: function (str) {
            return Util.trim(str).split(/\s+/);
        }
    };

    var DomEvent = {
        addEvent: function(target, type, callback, context) {
            if (target.addEventListener) {
                target.addEventListener(type, callback.bind(context));
            } else {
                target.attachEvent(type, callback.bind(context));
            }
        }
    };

    return DropDown;
})();
