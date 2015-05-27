define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");
    var utils = require("mokit/utils");
    var tree = require("../utils/tree");
    var $ = require("mokit/jquery");
    var contextMenu = require('./contextmenu');
    var fileDlg = require('self/utils/file_dialog');

    var treeAreaScrollTop = 0;
    var treeAreaScrollLeft = 0;

    /**
     * 工作区视图
     */
    return app.view.create({
        template: module.resovleUri('../templates/workspace.html'),
        el: {
            tree: '.body ul',
            body: '.body'
        },

        /**
         * 初始化
         */
        onInit: function(context) {
            var self = this;
            //记录滚动位置
            self.el.body.scroll(function() {
                treeAreaScrollTop = $(this).prop('scrollTop');
                treeAreaScrollLeft = $(this).prop('scrollLeft');
            });
        },

        /**
         * 视图呈现事件
         */
        onRender: function(context) {
            var self = this;
            //文件夹打开或关闭
            tree.use(self.el.tree, {
                onOpen: function(node) {
                    var path = $(node).attr('path');
                    self.controller.openDir(context, path);
                },
                onClose: function(node) {
                    var path = $(node).attr('path');
                    self.controller.closeDir(context, path);
                }
            });
            //保持滚动位置
            self.el.body.prop('scrollTop', treeAreaScrollTop);
            self.el.body.prop('scrollLeft', treeAreaScrollLeft);
            utils.async(function() {
                self.el.body.prop('scrollTop', treeAreaScrollTop);
                self.el.body.prop('scrollLeft', treeAreaScrollLeft);
            });
        },
        updateState: function() {
            var self = this;
            self.el.fileItems = self.el.tree.find('.item-file');
            self.el.fileItems.removeClass('selected');
            var currentFile = self.model.file.currentFile || {};
            if (currentFile) {
                self.el.tree.find('li[path="' + currentFile.path + '"] .item-file').addClass('selected');
            }
        },
        _getItemInfo: function(context, type) {
            var element = context.$element.parent();
            return {
                path: element.attr('path'),
                isRoot: element.attr('isroot'),
                root: element.attr('root'),
                type: element.attr('type')
            };
        },

        /**
         * 目录或文件右建
         */
        onContextMenu: function(context, type) {
            var self = this;
            var item = self._getItemInfo(context, type);
            contextMenu.finder.finderItem = item;
            contextMenu.finder.call('popup');
            contextMenu.finder.popup(context.pageX, context.pageY);
        }
    });
});