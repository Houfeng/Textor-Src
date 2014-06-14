"use strict";
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    
    var self = exports;

    var lang = require('mokit/language');
    var store = require('mokit/store');
    var utils = require('mokit/utils');

    self.lang = lang;

    self.getLangName = function() {
        var usrLang = store.local.get('textor:language');
        if (usrLang && lang.languages.hasOwnProperty(usrLang)) {
            return usrLang;
        } else {
            var sysLang = navigator.language.toLowerCase();
            if (sysLang && lang.languages.hasOwnProperty(sysLang)) {
                return sysLang;
            } else {
                return self.defaultLanguage;
            }
        }
    };

    self.setLangName = function(name) {
        store.local.set('textor:language', name);
    };

});