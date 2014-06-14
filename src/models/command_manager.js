"use strict";
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var self = exports;
    var linq = require("mokit/linq");
    var utils = require("mokit/utils");
    var key = require('mokit/key');
    var usrCfg = require('./user_config').get();
    usrCfg.key_binding = usrCfg.key_binding || {};
    textor.utils = utils;

    //确保合局 require 不和 ems 的模块局部 require 冲突。
    var fs = require_node('fs', null);
    var os = require_node('os', null);
    var gui = require_node('nw.gui', null);

    //alert(gui.App.dataPath);
    var platform = os.platform();
    var isWin = /^win/.test(platform);

    var pathSpliter = isWin ? '\\' : '/';

    var cmdKey = isWin ? 'ctrl' : 'command';

    //当前选中命令的索引
    self.selectedIndex = 0;

    //当前选中的命令
    self.selectedCommand = null;

    //关键词
    self.keyword = null;

    //命令例表
    self.list = [];

    //查找结果
    self.findResult = self.list;

    //选中一条命令
    self.select = function(index, callback) {
        self.selectedIndex = index;
        if (self.selectedIndex < 0) {
            self.selectedIndex = 0;
        }
        if (self.selectedIndex > self.findResult.length - 1) {
            self.selectedIndex = self.findResult.length - 1;
        }
        self.selectedCommand = self.findResult[self.selectedIndex];
        if (callback) callback();
    };

    //排序命令列表
    self.sort = function() {
        if (self.list.length < 1) {
            return;
        }
        self.list = linq.From(self.list).OrderBy(function(cmd) {
            return cmd.name;
        }).ToArray() || [];
        self.findResult = self.list;
    };

    //添加一个命令
    var addCommand = function(cmd) {
        if (!cmd || !cmd.name) return;
        cmd.key = usrCfg.key_binding[cmd.name] || cmd.key || '';
        cmd.key = utils.replace(cmd.key, '{cmd}', cmdKey);
        if (cmd.key && cmd.exec && !cmd.noBind) {
            key(cmd.key, function() {
                if (!key.token) {
                    cmd.exec();
                }
            });
        }
        self.list.push(cmd);
    };

    //添加命令
    self.add = function(cmd) {
        if (!cmd) return;
        if (utils.isArray(cmd)) {
            utils.each(cmd, function(i, item) {
                addCommand(item);
            });
        } else {
            addCommand(cmd);
        }
    };

    //执行命令
    self.execSelectedCommand = function() {
        if (self.selectedCommand && self.selectedCommand.exec) {
            return self.selectedCommand.exec();
        }
    };

    //查找一个命令
    self.find = function(_keyword, callback) {
        self.keyword = _keyword;
        if (self.keyword == "") {
            self.findResult = self.list;
        } else {
            self.findResult = linq.From(self.list).Where(function(command) {
                return utils.contains(command.name, self.keyword);
            }).ToArray();
        }
        if (callback) callback();
    };
});