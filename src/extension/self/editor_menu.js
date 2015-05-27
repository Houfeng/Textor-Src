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
            name: 'edit:cut',
            key: cmdKey + '+x',
            noBind: true,
            exec: function() {
                var editor = context.getEditor();
                if (editor) {
                    editor.focus();
                    editor.cut();
                }
            }
        }, {
            name: 'edit:copy',
            key: cmdKey + '+c',
            noBind: true,
            exec: function() {
                var editor = context.getEditor();
                if (editor) {
                    editor.focus();
                    editor.copy();
                }
            }
        }, {
            name: 'edit:paste',
            key: cmdKey + '+v',
            noBind: true,
            exec: function() {
                var editor = context.getEditor();
                if (editor) {
                    editor.focus();
                    editor.paste();
                }
            }
        }, {
            name: 'edit:select all',
            key: cmdKey + '+a',
            noBind: true,
            exec: function() {
                var editor = context.getEditor();
                if (editor) {
                    editor.focus();
                    editor.selectAll();
                }
            }
        }]);
    };

    self.onCreateContextMenu = function(contextMenu) {
        //菜单类
        var Menu = contextMenu.Menu;
        var MenuItem = contextMenu.MenuItem;

        contextMenu.editor.append(new MenuItem({
            label: lang.cut,
            click: function() {
                var editor = context.getEditor();
                if (editor) editor.cut();
            }
        }));
        contextMenu.editor.append(new MenuItem({
            label: lang.copy,
            click: function() {
                var editor = context.getEditor();
                if (editor) editor.copy();
            }
        }));
        contextMenu.editor.append(new MenuItem({
            label: lang.paste,
            click: function() {
                var editor = context.getEditor();
                if (editor) editor.paste();
            }
        }));
        contextMenu.editor.append(new MenuItem({
            type: 'separator'
        }));
        contextMenu.editor.append(new MenuItem({
            label: lang.select_all,
            click: function() {
                var editor = context.getEditor();
                if (editor) editor.selectAll();
            }
        }));
    };
});