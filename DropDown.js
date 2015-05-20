
var DropDown = (function() {

    /**
     *
     * @param options
     * @param options.container {Element}
     * @param options.data {Array}
     * @param options.showPhoto {Boolean|Undefined}
     * @param options.serverUrl {String|Undefined}
     * @constructor
     */
    var DropDown = function (options) {
        this._container = options.container;
        this._input = null;
        this._list = null;
        this._data = options.data;

        this._serverUrl = options.serverUrl || false;

        this._filteredData = [];
        this._hightlightFilter = '';

        this._showPhoto = !!(typeof options.showPhoto == 'undefined' || options.showPhoto);


        this._createDropDown();

        this._addEvents();

        this._items = [];


        for (var i in this._data) {
            this._items.push(this._createDropDownItem(this._data[i]));
        }
    };

    DropDown.prototype._templates = {
        itemPhoto: '<img src="$photo" class="dropDown__itemPhoto">',
        itemEmail: '<div class="dropDown__itemEmail">$email</div>',
        itemText: '<div class="dropDown__itemText">$name</div>'
    };


    DropDown.prototype._addEvents = function () {
        DomEvent.addEvent(this._input, 'click', this._update, this);
        DomEvent.addEvent(this._input, 'keyup', this._update, this);
        DomEvent.addEvent(this._input, 'blur', this._hide, this);
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
        for (var i in this._filteredData) {
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

    DropDown.prototype._clearList = function() {
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
        if (contact.email) {
            itemBody += this._render('itemEmail', {email: contact.email});
        }
        itemBody += this._render('itemText', {name: name});

        item.innerHTML = itemBody;
        this._list.appendChild(item);
        return item;
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

    var Util = {
        /**
         *
         * @param str {String}
         * @returns {String}
         */
        trim: function (str) {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
        },

        /**
         *
         * @param str {String}
         * @returns {Array}
         */
        splitWords: function (str) {
            return Util.trim(str).split(/\s+/);
        },

        /**
         *
         * @param x {Array}
         * @param y {Array}
         * @returns {Array}
         */
        mergeItems: function (x, y) {
            var obj = {}, i;
            for (i = x.length-1; i >= 0; --i)
                obj[x[i].id] = x[i];
            for (i = y.length-1; i >= 0; --i)
                obj[y[i].id] = y[i];
            var res = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k))
                    res.push(obj[k]);
            }
            return res;
        },

        /*
            string => trans

            patt => trans
            patt => ru => trans
            patt => en
         */

        /**
         *
         * @param text {String}
         * @param pattern {String}
         * @returns {boolean}
         */
        searchSubstring: function(text, pattern) {
            var str = text.toLowerCase();
            var pat = pattern.toLowerCase();

            if (str.search(pat) != -1) {
                return true;
            }
            str = str.replace(/[а-яё]/g, translit);

            var pat1 = pat.replace(/[а-яё]/g, translit);
            if (str.search(pat1) != -1) {
                return true;
            }

            var pat2 = pat.replace(/[a-z,;:<>'"`~\|\]}\[\{\.]/g, fixLang).replace(/[а-яё]/g, translit);
            if (str.search(pat2) != -1) {
                return true;
            }

            var pat3 = pat.replace(/[а-яё]/g, fixLang);
            if (str.search(pat3) != -1) {
                return true;
            }

            function translit(a){
                return Util.translitMap[a]||a
            }

            function fixLang(a){
                return Util.keyMap[a]||a
            }
        },

        keyMap: {
            "q": "й",
            "w": "ц",
            "e": "у",
            "r": "к",
            "t": "е",
            "y": "н",
            "u": "г",
            "i": "ш",
            "o": "щ",
            "p": "з",
            "[": "х",
            "]": "ъ",
            "a": "ф",
            "s": "ы",
            "d": "в",
            "f": "а",
            "g": "п",
            "h": "р",
            "j": "о",
            "k": "л",
            "l": "д",
            ";": "ж",
            "'": "э",
            "z": "я",
            "x": "ч",
            "c": "с",
            "v": "м",
            "b": "и",
            "n": "т",
            "m": "ь",
            ",": "б",
            ".": "ю",
            "`": "ё",
            "й": "q",
            "ц": "w",
            "у": "e",
            "к": "r",
            "е": "t",
            "н": "y",
            "г": "u",
            "ш": "i",
            "щ": "o",
            "з": "p",
            "х": "[",
            "ъ": "]",
            "ф": "a",
            "ы": "s",
            "в": "d",
            "а": "f",
            "п": "g",
            "р": "h",
            "о": "j",
            "л": "k",
            "д": "l",
            "ж": ";",
            "э": "'",
            "я": "z",
            "ч": "x",
            "с": "c",
            "м": "v",
            "и": "b",
            "т": "n",
            "ь": "m",
            "б": ",",
            "ю": ".",
            "ё": "`"
        },
        translitMap: {
            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'g',
            'д': 'd',
            'е': 'e',
            'ж': 'g',
            'з': 'z',
            'и': 'i',
            'й': 'y',
            'к': 'k',
            'л': 'l',
            'м': 'm',
            'н': 'n',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'с': 's',
            'т': 't',
            'у': 'u',
            'ф': 'f',
            'ы': 'i',
            'э': 'e',
            'ё': 'yo',
            'х': 'h',
            'ц': 'ts',
            'ч': 'ch',
            'ш': 'sh',
            'щ': 'shch',
            'ъ': '',
            'ь': '',
            'ю': 'yu',
            'я': 'ya'
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
