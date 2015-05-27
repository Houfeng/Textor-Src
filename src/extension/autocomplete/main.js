//自动完成插件
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var self = exports;

    var ExtensionManager = require('self/models/extension_manager');
    var AutoComplete = require("./common/autocomplete");

    //组件记库
    var words = {};
    words.javascript = require("./lang/javascript");
    words.css = require("./lang/css");
    words.less = require("./lang/css");
    words.sass = require("./lang/css");
    words.html = require("./lang/html");

    var context = null;

    self.onReady = function(_context) {
        context = _context;
        ExtensionManager.call("AutocompleteReady", words);
    };

    //在设置文件模式时
    self.onSetMode = function(file) {
        if (!AutoComplete || !file) return;
        var option = {
            editor: file.editor.innerEditor,
            showNumber: 50,
            words: words[file.mode] || {}
        };
        if (file.autoComplete) {
            file.autoComplete.setOption(option);
        } else {
            file.autoComplete = new AutoComplete(option);
        }
    };
});