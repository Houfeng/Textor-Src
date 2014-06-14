define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var self = exports;
    var store = require('mokit/store');
    var utils = require('mokit/utils');

    self.openHelp = function() {
        var url = self.context.sysInfo.site + "/documentation.html";
        self.context.shell.openExternal(url);
    };

    self.onReady = function(context) {
        var command = context.command;
        var cmdKey = context.cmdKey;
        command.add([{
            name: 'sys:help',
            key: cmdKey + '+shift+h',
            exec: function() {
                self.openHelp();
            }
        }]);
    };

    self.onRender = function() {
        if (self.context.isFirstStart) {
            utils.async(function() {
                self.openHelp();
            }, 2000);
        }
    };

});