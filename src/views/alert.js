define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");
    var $ = require("mokit/jquery");
    var utils = require("mokit/utils");
    var FileManager = require('self/models/file_manager');
    var key = require("mokit/key");
    var TextRange = require("self/utils/text_range");

    var dialog = null;
    var aniDelay = 220;

    //订阅 Tab 键
    key('tab', function(event) {
        if (!utils.isNull(dialog) && key.token == 'alert') {
            //处理提标框按钮切换
            dialog.op.selectedIndex++;
            if (dialog.op.selectedIndex >= dialog.op.buttons.length) {
                dialog.op.selectedIndex = 0;
            }
            dialog.el.buttons.removeClass('selected');
            $(dialog.el.buttons[dialog.op.selectedIndex]).addClass('selected');
            //处理焦点，防止焦移到编辑框
            dialog.focus();
            return false;
        }
    });

    //订阅 Enter 键
    key('enter', function(event) {
        if (!utils.isNull(dialog) && key.token == 'alert') {
            $(dialog.el.buttons[dialog.op.selectedIndex]).focus().click();
            return false;
        }
    });

    //订阅 esc 键
    key('esc', function(event) {
        if (!utils.isNull(dialog) && key.token == 'alert') {
            dialog.hide(dialog.context, 'esc');
            return false;
        }
    });

    /**
     * 提示框
     */
    return app.view.create({
        template: module.resovleUri('../templates/alert.html'),
        //元素映射
        el: {
            'box': '.ui-alert-inner',
            'title': 'header',
            'input': 'input',
            'select': 'select',
            'text': 'section',
            'buttons': 'footer button'
        },
        //在初始化时
        onInit: function(context) {
            var self = this;
            self.ui.on('click', function() {
                if (self.op.clickBlank) self.hide();
                return false;
            });
            self.el.box.on('click', function() {
                return false;
            });
        },
        //在呈现时
        onRender: function(context) {
            var self = this;
            self.context = context;
            if (self.el.input && self.el.input.length > 0) {
                self.inputRange = TextRange.create(self.el.input[0]);
            }
        },
        //提示框选项
        op: {},
        //隐藏提示框
        hide: function(context, _state) {
            var self = this;
            self.ui.fadeOut(aniDelay);
            key.token = '';
            dialog = null;
            //默认将焦点移动编辑框
            if (FileManager.currentFile && FileManager.currentFile.editor) {
                FileManager.currentFile.editor.innerEditor.focus();
            }
            if (self.op.callback) {
                utils.async(function() {
                    var value = null;
                    if (self.op.input) {
                        value = self.el.input.val();
                    }
                    if (self.op.items) {
                        value = self.el.select.find('option:selected').val();
                    }
                    self.op.callback({
                        "state": _state,
                        "input": value,
                        "value": value
                    });
                });
            }
        },
        focus: function(context) {
            var self = this;
            //处理焦点，防止焦移到编辑框
            if (FileManager.currentFile && FileManager.currentFile.editor) {
                FileManager.currentFile.editor.innerEditor.blur();
            }
            utils.async(function() {
                self.ui.focus();
                if (self.op.select) {
                    self.el.select.focus();
                }
                if (self.op.input) {
                    self.el.input.focus();
                }
            });
        },
        //显示提示框
        show: function(context, op) {
            var self = this;
            self.ui.fadeOut(aniDelay);
            key.token = 'alert';
            self.op = op || {};
            self.op.title = self.op.title || '提示';
            self.op.selectedIndex = self.op.selectedIndex || 0;
            self.op.buttons = self.op.buttons || ["取消", "确定"];
            self.model = self.op;
            self.render(null, function() {
                dialog = self;
                self.ui.fadeIn(aniDelay);
                //自动隐藏
                if (self.op.autoHide) {
                    utils.async(function() {
                        self.hide(context, 'auto');
                    }, self.op.autoHide);
                }
                self.focus(context);
                if (op.show) op.show();
            });
        }
    });
});