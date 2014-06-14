define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");
    var utils = require("mokit/utils");
    var $ = require("mokit/jquery");
    var TextRange = require("self/utils/text_range");

    var cmdAreaScrollTop = 0;

    /**
     * 命令面板
     */
    return app.view.create({
        template: module.resovleUri('../templates/command.html'),
        el: {
            'commandBox': '#command-box',
            'commandListHolder': '.body'
        },
        onInit: function(context) {
            var self = this;
            //记录滚动位置
            self.el.commandListHolder.scroll(function() {
                cmdAreaScrollTop = $(this).prop('scrollTop');
            });
            //排序命令
            self.model.command.sort();
        },
        onRender: function(context) {
            var self = this;
            self.commandBoxRange = TextRange.create(self.el.commandBox[0]);
            utils.async(function() {
                self.el.commandBox.focus();
            });
            //保持滚动位置
            self.el.commandListHolder.prop('scrollTop', cmdAreaScrollTop);
            utils.async(function() {
                self.el.commandListHolder.prop('scrollTop', cmdAreaScrollTop);
            });
        },
        selectCommandBox: function(context) {
            var self = this;
            self.commandBoxRange.setSelection(self.el.commandBox.val());
        },
        updateCommandList: function(context, index, dir) {
            var self = this;
            self.commandList.render();
            var boxHeight = self.el.commandListHolder.outerHeight();
            var itemHeight = self.el.commandListHolder.find('li').outerHeight();
            if (dir == "down") {
                if ((itemHeight * (index + 2)) > (boxHeight + cmdAreaScrollTop)) {
                    self.el.commandListHolder.scrollTop(cmdAreaScrollTop + itemHeight);
                }
            } else {
                if ((itemHeight * index) < cmdAreaScrollTop) {
                    self.el.commandListHolder.scrollTop(cmdAreaScrollTop - itemHeight);
                }
            }
        },
        input: function(context) {
            var self = this;
            var keyword = context.$element.val();
            self.controller.findCommand(context, keyword);
            return false;
        }
    });
});