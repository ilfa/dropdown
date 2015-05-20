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

module.exports = Util;
