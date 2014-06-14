"use strict";
/**
 * 底部栏
 */
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var self = exports;
    var linq = require("mokit/linq");
    var utils = require("mokit/utils");
    var lang = require('mokit/language').current();

    self.height = 200;
    self.menuHeight = 25;
    self.state = null;
    self.speed = 200;

    self.items = [{
        'id': 'console',
        'text': lang.console.toUpperCase()
    }];

    //当前选中项
    self.current = null;

    /**
     * 选择一个侧边栏项
     * @param  {String}   id       边栏id
     * @param  {Function} callback 选中完成回调
     * @return {Null}              无返回值
     */
    self.pickMenu = function(id, callback) {
        self.current = linq.From(self.items).First(function(item) {
            return item.id == id;
        });
        self.state = {};
        self.state[id] = true;
        if (callback) callback();
    };

    /**
     * 取消选择一个侧边栏项
     * @param  {String}   id       边栏id
     * @param  {Function} callback 取消完成回调
     * @return {Null}              无返回值
     */
    self.unPickMenu = function(id, callback) {
        self.state = {};
        if (!utils.isNull(id)) {
            self.state[id] = false;
        }
    };

});