define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var self = exports;
    var mode = require('self/models/edit_mode');
    var utils = require('mokit/utils');
    var context = null;
    var lang = null;

    var temp = {};
    var list = [];

    function getModeList() {
        if (list && list.length > 0) return list;
        utils.each(mode.modes, function(key, value) {
            if (temp[value]) return;
            list.push({
                "text": value,
                "value": value
            });
            temp[value] = true;
        });
        return list;
    };

    self.switchMode = function(context) {
        context = context || self.context;
        context.view.alert.show(context, {
            title: lang.language_mode,
            items: getModeList(),
            buttons: [lang.cancel, lang.ok],
            callback: function(rs) {
                if (rs.state == 1 && rs.value) {
                    var editor = context.getEditor();
                    if (!editor) return;
                    editor.setMode(rs.value);
                }
            }
        });
    };

    self.onReady = function(_context) {
        context = _context;
        lang = context.lang;
        var command = context.command;
        var cmdKey = context.cmdKey;
        command.add([{
            name: 'edit:mode',
            key: cmdKey + '+shift+m',
            exec: function() {
                self.switchMode(context);
            }
        }]);
    };

});