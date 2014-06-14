define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");
    var move = require("mokit/move");
    var $ = require("mokit/jquery");
    var utils = require("mokit/utils");
    var ace = require('ace');
    var ExtensionManager = require('self/models/extension_manager');
    var fileDlg = require('self/utils/file_dialog');
    var network = require('self/utils/network');
    //
    var gui = require_node('nw.gui');

    //在应用程序已经打开，需要在单一实例打文件时
    //cmdline 参数在mac 下window格式不一样
    //在此处理 window 下的参数
    var getCmdlineFile = function(cmdline) {
        var mark = '--original-process-start-time';
        var markIndex = cmdline.indexOf(mark);
        if (markIndex < 0) return cmdline;
        cmdline = cmdline.substr(markIndex + mark.length);
        var beginIndex = cmdline.indexOf('"');
        var endIndex = cmdline.lastIndexOf('"');
        cmdline = cmdline.substring(beginIndex + 1, endIndex);
        return cmdline;
    };

    /**
     * 主界面
     */
    return app.view.create({
        template: module.resovleUri('../templates/main.html'),
        el: {
            "sidebarArea": "#sidebar-area",
            "mainArea": "#main-area",
            "footerArea": "#footer-area",
            "editorHolder": "#editor-holder",
            "stat_frame": "#stat_frame"
        },
        onInit: function(context) {
            var self = this;
            self.fileDialog = fileDlg;
        },
        checkNetwork: function(callback) {
            var self = this;
            network.check(callback);
        },
        onRender: function(context) {
            var self = this;
            self.checkNetwork(function(_state) {
                if (_state) {
                    self.el.stat_frame.attr('src', self.model.config.site + "/stat.html");
                }
            });
        },
        onChildRender: function(context) {
            var self = this;
            //拖拽并打开文件
            self.ui.on('drop', function(event) {
                context.event = event;
                return self.controller.onDrop(context);
            });
            utils.async(function() {
                //处理命行参数
                if (gui.App.argv && gui.App.argv.length > 0) {
                    self.controller.onCmdLine(context, gui.App.argv);
                }
                //在同一应用实例中打开文件
                gui.App.on('open', function(cmdline) {
                    if (utils.isNull(cmdline)) return;
                    var path = getCmdlineFile(cmdline);
                    if (path == "") return;
                    self.controller.onCmdLine(context, [path]);
                });
            });
        },
        //打开侧栏
        openSidebar: function(context, id, callback) {
            var self = this;
            var sidebar = self.model.sidebar;
            sidebar.pickMenu(id);
            ExtensionManager.trigger('OpenSidebar', id, function() {
                self.el.sidebarArea.show();
                self.sidebarPanel.render(null, function() {
                    move(self.el.sidebarArea[0]).set("left", 0).duration(sidebar.speed).end(function() {
                        if (callback) callback(true);
                    });
                    move(self.ui[0]).set("padding-left", sidebar.width).duration(sidebar.speed).end(function() {
                        self.controller.resizeAllEditor();
                        self.root.sidebarMenu.render();
                        self.ui[0].scrollTop = 0;
                        self.ui[0].scrollLeft = 0;
                        //延迟确定 Tab 能正确计算
                        utils.async(function() {
                            self.root.tab.render();
                        }, 50);
                    });
                });
            });
        },
        //关闭侧栏
        closeSidebar: function(context, id, callback) {
            var self = this;
            var sidebar = self.model.sidebar;
            sidebar.unPickMenu(id);
            move(self.el.sidebarArea[0]).set("left", -sidebar.width).duration(sidebar.speed).end(function() {
                if (callback) callback(false);
            });
            move(self.ui[0]).set("padding-left", sidebar.menuWidth).duration(sidebar.speed).end(function() {
                self.controller.resizeAllEditor();
                self.root.sidebarMenu.render();
                self.el.sidebarArea.hide();
                self.ui[0].scrollTop = 0;
                self.ui[0].scrollLeft = 0;
                //延迟确定 Tab 能正确计算
                utils.async(function() {
                    self.root.tab.render();
                }, 50);
            });
        },
        //切换侧栏状态
        toggleSidebar: function(context, id, callback) {
            var self = this;
            var sidebar = self.model.sidebar;
            sidebar.state = sidebar.state || {};
            var state = sidebar.state[id];
            if (state)
                self.closeSidebar(context, id, callback);
            else
                self.openSidebar(context, id, callback);
        },
        //打开底栏
        openFooter: function(context, id, callback) {
            var self = this;
            var footer = self.model.footer;
            footer.pickMenu(id);
            ExtensionManager.trigger('OpenFooter', id, function() {
                self.el.footerArea.show();
                self.footerPanel.render(null, function() {
                    move(self.el.footerArea[0]).set("bottom", 0).duration(footer.speed).end(function() {
                        if (callback) callback(true);
                    });
                    move(self.el.mainArea[0]).set("padding-bottom", footer.height).duration(footer.speed).end(function() {
                        self.controller.resizeAllEditor();
                        self.root.footerMenu.render();
                        self.ui[0].scrollTop = 0;
                        self.ui[0].scrollLeft = 0;
                    });
                });
            });
        },
        //关闭底栏
        closeFooter: function(context, id, callback) {
            var self = this;
            var footer = self.model.footer;
            footer.unPickMenu(id);
            move(self.el.footerArea[0]).set("bottom", -footer.height).duration(footer.speed).end(function() {
                if (callback) callback(false);
            });
            move(self.el.mainArea[0]).set("padding-bottom", footer.menuHeight).duration(footer.speed).end(function() {
                self.controller.resizeAllEditor();
                self.root.footerMenu.render();
                self.el.footerArea.hide();
                self.ui[0].scrollTop = 0;
                self.ui[0].scrollLeft = 0;
            });
        },
        //切换底栏状态
        toggleFooter: function(context, id, callback) {
            var self = this;
            var footer = self.model.footer;
            footer.state = footer.state || {};
            var state = footer.state[id];
            if (state)
                self.closeFooter(context, id, callback);
            else
                self.openFooter(context, id, callback);
        },
        //更新状态栏
        updateStateBar: function(context) {
            var self = this;
            self.state.render();
        }
    });
});