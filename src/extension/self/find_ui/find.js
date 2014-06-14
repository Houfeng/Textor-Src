define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    require('./find.css');
    var app = require("mokit/app");
    var fileMgr = require('self/models/file_manager');
    var utils = require("mokit/utils");
    var $ = require('mokit/jquery');

    var autoCompleteDialog = $('.autocomplete');

    /**
     * "查找/替换" 面板
     */
    return app.view.create({
        template: module.resovleUri('./find.html'),
        el: {
            findBox: '#findBox',
            replaceBox: '#replaceBox',
            findButton: '#findButton',
            findAllButton: '#findAllButton',
            replaceButton: '#replaceButton',
            replaceAllButton: '#replaceAllButton',
            ignoreCaseBox: '#ignoreCaseBox'
        },
        onRender: function(context) {
            var self = this;
            utils.async(function() {
                if (fileMgr.currentFile && fileMgr.currentFile.editor) {
                    self.el.findBox.val(fileMgr.currentFile.editor.innerEditor.getSelectedText());
                }
                self.el.findBox.focus();
            }, 300);
        },
        findTextInput: function(context) {
            var self = this;
            var keyCode = context.keyCode;
            if (keyCode == 13) {
                self.find(context);
            }
        },
        find: function(context) {
            var self = this;
            if (!fileMgr.currentFile || !fileMgr.currentFile.editor) {
                return;
            }
            fileMgr.currentFile.editor.innerEditor.find(self.el.findBox.val());
            autoCompleteDialog.hide();
        },
        findAll: function(context) {
            var self = this;
            if (!fileMgr.currentFile || !fileMgr.currentFile.editor) {
                return;
            }
            fileMgr.currentFile.editor.innerEditor.findAll(self.el.findBox.val());
            autoCompleteDialog.hide();
        },
        replace: function(context) {
            var self = this;
            if (!fileMgr.currentFile || !fileMgr.currentFile.editor) {
                return;
            }
            self.find(context);
            fileMgr.currentFile.editor.innerEditor.replace(self.el.replaceBox.val());
            autoCompleteDialog.hide();
        },
        replaceAll: function(context) {
            var self = this;
            if (!fileMgr.currentFile || !fileMgr.currentFile.editor) {
                return;
            }
            self.findAll(context);
            fileMgr.currentFile.editor.innerEditor.replaceAll(self.el.replaceBox.val());
            autoCompleteDialog.hide();
        },
    });
});