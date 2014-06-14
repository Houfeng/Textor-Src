define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var $ = require('mokit/jquery');
    var utils = require('mokit/utils');

    var objects = []; //记录已处理的对象

    var words = {
        regexp: (/[a-zA-Z0-9\_\$]/),
        direct: [
            "Date", "Math", "complete", "error", "warn", "log", "getElementById",
            "jsonp", "step", "mouseover", "mouseup", "mousedown", "wait", "do",
            "click", "clickOnce", "type", "define", "should", "try", "catch",
            "have", "has", "haveProperty", "hasProperty", "property", "attr", "haveAttr", "hasAttr", "beTrue", "beFalse", "beTrues",
            "beFalses", "ownProperty", "hasOwnProperty", "lengthOf", "beLengthOf", "keys", "haveKeys", "hasKeys", "include",
            "empty", "beEmpty", "beA", "above", "beAbove", "below", "beBelow", "equal", "beEqual", "exist", "match", "child", "haveChild",
            "haveHrefKeys", "hasHrefKeys", "haveHrefKey", "hasHrefKey",
            "haveFormKeys", "haveFormKey", "new", "public", "for", "if", "else", "class",
            "hasChild", "parent", "haveParent", "hasParent", "next", "haveNext", "hasNext", "prev", "havePrev", "hasPrev",
            "empty", "beEmpty", "visible", "hide", "var",
            "function", "while", "case", "switch", "for", "return", "true", "false", "undefined", "null",
            "toLowerCase", "toUpperCase", "parseInt", "parseFloat",
            "slice", "substring", "substr", "join", "split", "splice", "toString",
            "attachEvent", "detachEvent", "preventDefault", "apply", "call", "prototype", "arguments",
            "Array", "Function", "Date", "Number", "RegExp", "Object", "String", "Error", "Boolean", "Iterator", "Namespace", "eval",
            "isFinite", "isNaN", "encodeURI", "encodeURIComponent", "decodeURI", "decodeURIComponent", "JSON",
        ],
        member: {}
    };

    //添加内置对象的word列表
    function addAutoCompleteListWords(targets) {
        //如果对像为空，为已处理，则直接返回
        if (utils.isNull(targets) || $.inArray(targets, objects) > -1) {
            return;
        }
        objects.push(targets);
        //
        utils.each(targets, function(key, target) {
            //将所有 key 添加到自动完成列表
            if (utils.isNull(key) || !isNaN(key) || $.inArray(key, words.direct) > -1 || utils.contains(key, '/') || utils.contains(key, '\\')) {
                return;
            }
            words.direct.push(key);
            if (utils.isNull(target)) return;
            //添加对像的 “.” 操作，就是指对像下的属性。将对像名为 key 的成员拷贝到成员表
            words.member[key] = words.member[key] || [];
            var isArray = utils.isArray(target);
            utils.each(target, function(subKey, subItem) {
                var _subKey = isArray ? subItem : subKey;
                if (utils.isNull(_subKey) || !isNaN(_subKey) || $.inArray(_subKey, words.member[key]) > -1 || utils.contains(_subKey, '/') || utils.contains(_subKey, '\\')) {
                    return;
                }
                words.member[key].push(_subKey);
                if ($.inArray(_subKey, words.direct) > -1) {
                    words.direct.push(_subKey);
                }
            });
            //如果没有子成员，则从成员表中移除这个key
            if (words.member[key].length < 1) {
                delete words.member[key];
            }
            //递归处理子对像
            try {
                addAutoCompleteListWords(target);
            } catch (ex) {}
        });
    }

    //添加系统对像到自动完成列表
    addAutoCompleteListWords({
        "window": window,
        "$(document)": (function() {
            var obj = $(document);
            obj.length == null;
            delete obj.length;
            return obj;
        }()),
        "define": define,
        "require": require,
        "exports": exports,
        "module": module
    });

    return words;
});