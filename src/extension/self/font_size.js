define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var self = exports;
    var context = null;
    var lang = null;

    self.onReady = function(_context) {
        context = _context;
        lang = context.lang;
        var command = context.command;
        var cmdKey = context.cmdKey;
        command.add([{
            name: 'font:plus',
            key: cmdKey + '+=',
            exec: function() {
                var editor = context.getEditor();
                if (!editor) return;
                var fontSize = parseInt(editor.getFontSize()) + 1;
                if (fontSize > 80) fontSize = 80;
                editor.setFontSize(fontSize);
            }
        }, {
            name: 'font:reset',
            key: cmdKey + '+0',
            exec: function() {
                var editor = context.getEditor();
                if (!editor) return;
                editor.setFontSize(context.config.editor.font_size);
            }
        }, {
            name: 'font:minus',
            key: cmdKey + '+-',
            exec: function() {
                var editor = context.getEditor();
                if (!editor) return;
                var fontSize = parseInt(editor.getFontSize()) - 1;
                if (fontSize < 8) fontSize = 8;
                editor.setFontSize(fontSize);
            }
        }]);
    };
});