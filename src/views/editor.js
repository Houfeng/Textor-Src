define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");
    var ace = require('ace');
    var utils = require("mokit/utils");
    var fileMgr = require('self/models/file_manager');
    var contextMenu = require('./contextmenu');
    var usrCfg = require('self/models/user_config').get();
    var ExtMgr = require('self/models/extension_manager');

    var modeCache = {};
    var themeCache = {};

    var usrTheme = usrCfg.editor['theme'];
    var editorTheme = 'textor-' + (usrTheme == 'dark' ? usrTheme : 'light');
    var editorTabSize = usrCfg.editor['tab_size'] || 4;
    var editorFontSize = usrCfg.editor['font_size'] || 14;

    /**
     * 主界面
     */
    return app.view.create({
        template: module.resovleUri('../templates/editor.html'),
        onInit: function(context) {
            var self = this;
            //如果第一次加载某 Theme 先隐藏，加载后再显示，以避免闪烁
            if (!themeCache[editorTheme]) {
                self.hide();
            }
            self.ui.on('contextmenu', function(event) {
                contextMenu.editor.editor = self;
                contextMenu.editor.onPopup.trigger();
                contextMenu.editor.popup(event.pageX, event.pageY);
            });
        },
        onRender: function(context) {
            var self = this;
        },
        initEditor: function(context, callback) {
            var self = this;
            self.defaultContext = context;
            self.ui.text(self.model.data);
            self.innerEditor = ace.edit(self.ui[0]);
            //公开API
            self.session = self.innerEditor.getSession();
            self.selection = self.innerEditor.getSelection();
            self.command = self.innerEditor.command;
            self.on = self.innerEditor.on;
            //设置默认值
            self.session.setUseWorker(false);
            self.session.setUseWrapMode(false);
            self.session.setTabSize(editorTabSize);
            self.session.setUseSoftTabs(true);
            self.innerEditor.setPrintMarginColumn(80);
            self.innerEditor.setDisplayIndentGuides(false);
            self.setFontSize(editorFontSize);
            self.innerEditor.setOptions({
                enableBasicAutocompletion: true
            });
            //绑定默认事件处理
            self.selection.on('changeCursor', function() {
                utils.async(function() {
                    self.model.cursor = self.selection.getCursor();
                    self.root.updateStateBar(context);
                });
            });
            //检查编辑状态
            self.session.on('change', function() {
                utils.async(function() {
                    self.model.state = fileMgr.OPEN_FILE_STATES.editing;
                });
            });
            //设置主题
            self.setTheme(editorTheme, themeCache[editorTheme] ? null : function() {
                utils.async(function() {
                    self.show();
                    self.focus();
                });
            });
            if (callback) callback();
        },
        on: function() {},
        resize: function(callback) {
            var self = this;
            self.innerEditor.resize();
            if (callback) callback();
        },
        focus: function(callback) {
            var self = this;
            self.innerEditor.focus();
            if (callback) callback();
        },
        hide: function(callback) {
            var self = this;
            if (self && self.ui)
                self.ui.hide();
            if (callback) callback();
        },
        show: function(callback) {
            var self = this;
            if (self && self.ui)
                self.ui.show();
            if (callback) callback();
        },
        setFontSize: function(size, callback) {
            var self = this;
            self.innerEditor.setFontSize(size);
            if (callback) callback();
        },
        getFontSize: function() {
            var self = this;
            return self.innerEditor.getFontSize();
        },
        setValue: function(text, callback) {
            var self = this;
            utils.async(function() {
                self.innerEditor.setValue(text);
                self.clearSelection();
                if (callback) callback();
            });
        },
        getValue: function(callback) {
            var self = this;
            var buffer = self.innerEditor.getValue();
            if (callback) callback(buffer);
            return buffer;
        },
        clearSelection: function(callback) {
            var self = this;
            self.innerEditor.clearSelection();
            if (callback) callback();
        },
        moveCursorTo: function(row, _char, callback) {
            var self = this;
            self.innerEditor.moveCursorTo(row, _char);
            if (callback) callback();
        },
        navigateTo: function(row, column, callback) {
            var self = this;
            self.innerEditor.navigateTo(row, column);
            if (callback) callback();
        },
        navigateFileStart: function(callback) {
            var self = this;
            self.innerEditor.navigateFileStart();
            if (callback) callback();
        },
        setMode: function(name, callback) {
            var self = this;
            utils.async(function() {
                self.file = self.file || {};
                if (modeCache[name]) {
                    self.file.mode = name;
                    self.session.setMode(modeCache[name]);
                    ExtMgr.trigger('SetMode', self.file);
                    self.root.updateStateBar(self.defaultContext);
                    if (callback) callback();
                    return;
                }
                require("ace/mode/" + name, function(rs) {
                    self.file.mode = name;
                    modeCache[name] = new rs.Mode();
                    self.session.setMode(modeCache[name]);
                    ExtMgr.trigger('SetMode', self.file);
                    self.root.updateStateBar(self.defaultContext);
                    if (callback) callback();
                });
            }, 0);
        },
        getMode: function() {
            return self.file.mode;
        },
        setTheme: function(name, callback) {
            var self = this;
            utils.async(function() {
                if (themeCache[editorTheme]) {
                    self.innerEditor.setStyle(themeCache[editorTheme]);
                    if (callback) callback();
                } else {
                    var theme = "ace/theme/" + name + ".css";
                    require(theme, function() {
                        themeCache[editorTheme] = 'ace-' + name;
                        self.innerEditor.setStyle(themeCache[editorTheme]);
                        if (callback) callback();
                    });
                }
            }, 0);
        },
        copy: function() {
            document.execCommand("copy");
        },
        cut: function() {
            document.execCommand("cut");
        },
        paste: function() {
            document.execCommand("paste");
        },
        selectAll: function() {
            var self = this;
            self.innerEditor.selectAll();
        }
    });
});