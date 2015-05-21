
var DropDown = (function() {

    /**
     *
     * @param options
     * @param options.container {Element}
     * @param options.data {Array}
     * @param options.showPhoto {Boolean|Undefined}
     * @param options.serverUrl {String|Undefined}
     * @param options.inputType {String|Undefined}
     * @constructor
     */
    var DropDown = function (options) {
        this._container = options.container;
        this._input = null;
        this._list = null;
        this._data = options.data;
        this._type = options.inputType || 'checkbox';

        this._serverUrl = options.serverUrl || false;

        this._filteredData = [];
        this._hightlightFilter = '';

        this._showPhoto = !!(typeof options.showPhoto == 'undefined' || options.showPhoto);


        this._createDropDown();

        this._eventCallbacks = {};
        this._addEvents();

        this._items = [];

        this._activeItems = [];


        for (var i in this._data) {
            this._items.push(this._createDropDownItem(this._data[i]));
        }
    };

    DropDown.prototype.remove = function() {
        DomEvent.removeEvent(this._input, 'click', this._eventCallbacks.click);
        DomEvent.removeEvent(this._input, 'keyup', this._eventCallbacks.keyup);
        DomEvent.removeEvent(this._input, 'blur', this._eventCallbacks.blur);

        this._clearList();
        this._clearActiveItems();
    };

    DropDown.prototype._templates = {
        itemPhoto: '<img src="$photo" class="dropDown__itemPhoto">',
        itemEmail: '<div class="dropDown__itemEmail">$email</div>',
        itemText: '<div class="dropDown__itemText">$name</div>'
    };


    DropDown.prototype._addEvents = function () {
        this._eventCallbacks.click = DomEvent.addEvent(this._input, 'click', this._update, this);
        this._eventCallbacks.keyup = DomEvent.addEvent(this._input, 'keyup', this._update, this);
        this._eventCallbacks.blur = DomEvent.addEvent(this._input, 'blur', this._hide, this);
    };

    DropDown.prototype._update = function(e) {
        this._clearList();
        var pattern = this._input.value;
        this._filterData(pattern);

        if (this._serverUrl) {
            this._askServer(pattern);
        } else {
            this._redrawList();
        }

        DomUtil.removeClass(this._list, '_hidden');
    };

    /**
     *
     * @param pattern {String}
     */
    DropDown.prototype._askServer = function(pattern) {
        if (pattern.length == 0) return;
        var that = this;
        var url = this._serverUrl + pattern;
        var xhr = Request.send(url, function(err, res) {
            var list = JSON.parse(res);
            if (!err && list.length) {
                that._filteredData = Util.mergeItems(that._filteredData, list);
                that._redrawList();
            } else {
                that._redrawList();
            }
        });
    };

    DropDown.prototype._redrawList = function() {
        var obj = {}, i, res = [];

        for (i = 0; i < this._activeItems.length; i++) {
            obj[this._activeItems[i].data.id] = true;
        }

        for (i = 0; i < this._filteredData.length; i++) {
            if (!obj.hasOwnProperty(this._filteredData[i].id)) {
                res.push(this._filteredData[i]);
            }
        }

        this._filteredData = res;
        for (i in this._filteredData) {
            this._items.push(this._createDropDownItem(this._filteredData[i]));
        }

    };

    /**
     *
     * @param pattern {String}
     * @private
     */
    DropDown.prototype._filterData = function(pattern) {
        this._filteredData = [];
        var match;
        var name;

        var patterns = Util.splitWords(pattern.toLowerCase());

        if (patterns.length == 1) {
            this._hightlightFilter = pattern;
        }

        for (var i in this._data) {
            match = true;
            name = this._data[i].name.toLowerCase();
            for (var j in patterns) {
                if (!Util.searchSubstring(name, patterns[j])) {
                    match = false;
                }
            }
            if (match) {
                this._filteredData.push(this._data[i]);
            }
        }
    };

    DropDown.prototype._hide = function() {
        var that = this;
        setTimeout(function() {
            DomUtil.addClass(that._list, '_hidden');
        }, 250);
    };

    DropDown.prototype._createDropDown = function () {

        DomUtil.addClass(this._container, 'dropDown__Container');

        this._selectedItems = document.createElement('div');
        this._selectedItems.className = 'dropDown__selectedItems';

        this._input = document.createElement('input');
        this._input.type = 'text';
        this._input.className = 'dropDown__input';

        this._list = document.createElement('ul');
        this._list.className = 'dropDown__list';

        if (!this._showPhoto) {
            DomUtil.addClass(this._list, '_noPhoto');
        }

        this._container.appendChild(this._selectedItems);
        this._container.appendChild(this._input);
        this._container.appendChild(this._list);

        DomUtil.addClass(this._list, '_hidden');
    };

    DropDown.prototype._clearList = function() {
        for (var i = 0; i < this._items.length; i++) {
            this._items[i].detachEvents();
        }
        this._items = [];
        this._list.innerHTML = '';
        this._hightlightFilter = '';
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

    DropDown.prototype._updateActiveItems = function(contact) {
        if (this._type != 'checkbox') {
            this._clearActiveItems();
        }
        this._activeItems.push({
            data: contact,
            dom: this._addSelectedItem(contact)
        });
        this._input.value = '';
        this._input.focus();
    };

    DropDown.prototype._addSelectedItem = function(item) {
        var itemContainer = document.createElement('div');
        itemContainer.className = 'dropDown__selectedItem';
        itemContainer.innerHTML = item.name;
        this._selectedItems.appendChild(itemContainer);
        var eventCallback = DomEvent.addEvent(itemContainer, 'click', function() {
            this._removeActiveItem(item.id);
        }, this);

        return {
            container: itemContainer,
            detachEvents: function() {
                DomEvent.removeEvent(itemContainer, 'click', eventCallback)
            }
        }
    };

    DropDown.prototype._removeActiveItem = function(id) {
        for (var i = 0; i < this._activeItems.length; i++) {
            if (this._activeItems[i].data.id == id) {
                this._activeItems[i].dom.detachEvents();
                this._selectedItems.removeChild(this._activeItems[i].dom.container);
                this._activeItems.splice(i, 1);
                return;
            }
        }
    };

    DropDown.prototype._clearActiveItems = function() {
        for (var i = 0; i < this._activeItems.length; i++) {
            this._activeItems[i].dom.detachEvents();
            this._selectedItems.removeChild(this._activeItems[i].dom.container);
        }
        this._activeItems = [];
    };

    /**
     *
     * @param contact {Object}
     * @param contact.name {String}
     * @param contact.photo {String}
     * @param contact.email {String|Undefined}
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

        var name = contact.name;
        if (this._hightlightFilter) {
            var start = name.toLowerCase().search(this._hightlightFilter.toLowerCase());
            if (start != -1) {
                var end = start + this._hightlightFilter.length;
                var namePart = name.substring(start, end);
                name = name.replace(namePart, '<b>' + namePart + '</b>');
            }
        }
        itemBody += this._render('itemText', {name: name});

        if (contact.email) {
            itemBody += this._render('itemEmail', {email: contact.email});
        }

        item.innerHTML = itemBody;
        this._list.appendChild(item);



        var eventCallback = DomEvent.addEvent(item, 'click', function() {
            this._updateActiveItems(contact);
        }, this);

        return {
            elementNode: item,
            detachEvents: function() {
                DomEvent.removeEvent(item, 'click', eventCallback, this);
            }
        };
    };


    var DomUtil = {
        /**
         *
         * @param el {Element}
         * @param name {String}
         * @returns {boolean}
         */
        hasClass: function (el, name) {
            if (el.classList !== undefined) {
                return el.classList.contains(name);
            }
            var className = DomUtil.getClass(el);
            return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
        },

        /**
         *
         * @param el {Element}
         * @param name {String}
         */
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

        /**
         *
         * @param el {Element}
         * @param name {String}
         */
        removeClass: function (el, name) {
            if (el.classList !== undefined) {
                el.classList.remove(name);
            } else {
                DomUtil.setClass(el, Util.trim((' ' + DomUtil.getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
            }
        },

        /**
         *
         * @param el {Element}
         * @param name {String}
         */
        setClass: function (el, name) {
            el.className = name;
        },

        /**
         *
         * @param el {Element}
         * @returns {String}
         */
        getClass: function (el) {
            return el.className;
        }
    };

    var DomEvent = {
        addEvent: function(target, type, callback, context) {
            var bindedCallback;
            if (context) {
                bindedCallback = callback.bind(context);
            } else {
                bindedCallback = callback;
            }

            if (target.addEventListener) {
                target.addEventListener(type, bindedCallback);
            } else {
                target.attachEvent(type, bindedCallback);
            }
            return bindedCallback;
        },

        removeEvent: function (target, type, callback) {
            if (target.removeEventListener) {
                target.removeEventListener(type, callback);
            } else {
                target.detachEvent(type, callback);
            }
        }
    };

    var Request = {

        send: function(url, callback) {
            var xhr = Request.createCORSRequest('GET', url);
            if (!xhr) {
                callback(new Error("CORS not supported"));
            }

            xhr.onload = function() {
                callback(null, xhr.responseText);
            };

            xhr.onerror = function() {
                callback(new Error("Connection problem"));
            };

            xhr.send();

            return xhr;
        },

        createCORSRequest: function (method, url) {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {

                // Check if the XMLHttpRequest object has a "withCredentials" property.
                // "withCredentials" only exists on XMLHTTPRequest2 objects.
                xhr.open(method, url, true);

            } else if (typeof XDomainRequest != "undefined") {

                // Otherwise, check if XDomainRequest.
                // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
                xhr = new XDomainRequest();
                xhr.open(method, url);

            } else {
                // Otherwise, CORS is not supported by the browser.
                xhr = null;
            }
            return xhr;
        }
    };

    return DropDown;
})();
