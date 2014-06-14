define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;
    var utils = require('mokit/utils');
    var userConfig = require('self/models/user_config');
    var langMgr = require('self/models/langmgr');

    var context = null;
    var command = null;
    var cmdKey = null;

    self.onReady = function(_context) {
        context = _context;
        command = context.command;
        cmdKey = context.cmdKey;
        command.add([{
            name: 'sys:restart',
            exec: function() {
                context.app.restart();
            }
        }, {
            name: 'sys:config',
            exec: function() {
                userConfig.checkCreate();
                context.controller.openFile(context, userConfig.path);
            }
        }, {
            name: 'sys:site',
            exec: function() {
                context.shell.openExternal(context.sysInfo.site);
            }
        }, {
            name: 'sys:data path',
            exec: function() {
                context.shell.showItemInFolder(context.dataPath);
            }
        }, {
            name: 'sys:exit',
            exec: function() {
                context.window.hide();
                context.window.close(true);
                context.gui.App.quit();
            }
        }, {
            name: 'tab:switch',
            key: 'ctrl+shift+tab',
            exec: function() {
                context.view.tab.next();
            }
        }, {
            name: 'edit:focus',
            key: cmdKey + '+enter',
            exec: function() {
                var editor = context.getEditor();
                if (editor) editor.focus();
            }
        }, {
            name: 'file:new',
            key: cmdKey + '+n',
            exec: function() {
                context.controller.createBlankFile(context);
            }
        }, {
            name: 'file:save',
            key: cmdKey + '+s',
            exec: function() {
                context.controller.saveCurrentFile(context);
            }
        }, {
            name: 'file:save all',
            key: cmdKey + '+shift+s',
            exec: function() {
                context.controller.saveAllFile(context);
            }
        }, {
            name: 'file:save as',
            key: cmdKey + '+shift+a',
            exec: function() {
                context.controller.saveAs(context);
            }
        }, {
            name: 'file:close',
            key: cmdKey + '+shift+c',
            exec: function() {
                context.controller.closeCurrentFile(context);
            }
        }, {
            name: 'file:pick file',
            key: cmdKey + '+shift+o',
            exec: function() {
                context.controller.pickFile(context);
            }
        }, {
            name: 'file:pick folder',
            key: cmdKey + '+o',
            exec: function() {
                context.controller.pickFolder(context);
            }
        }, {
            name: 'view:fullscreen',
            key: 'f11',
            exec: function() {
                context.window.toggleFullscreen();
            }
        }, {
            name: 'panel:close all',
            key: 'esc',
            exec: function() {
                context.view.closeSidebar(context);
                context.view.closeFooter(context);
            }
        }, {
            name: 'footer:close all',
            key: cmdKey + '+shift+`',
            exec: function() {
                context.view.closeFooter(context);
            }
        }, {
            name: 'sidebar:close all',
            key: cmdKey + '+`',
            exec: function() {
                context.view.closeSidebar(context);
            }
        }]);
        //语言切换命令
        utils.each(langMgr.lang.languages, function(name) {
            command.add({
                name: 'language:' + name,
                exec: function() {
                    langMgr.setLangName(name);
                    context.app.restart();
                }
            });
        });
    };
    self.onAllExtensionReady = function() {
        //处理 sidebar 快捷键
        utils.each(context.sidebar.items, function(i, item) {
            command.add({
                name: 'sidebar:' + item.id,
                key: cmdKey + '+' + (i + 1),
                exec: function() {
                    context.view.openSidebar(context, item.id, function(state) {
                        if (!state) {
                            utils.async(function() {
                                var editor = context.getEditor();
                                if (editor) editor.focus();
                            }, 1500);
                        }
                    });
                }
            });
        });
        //处理 footer 快捷键
        utils.each(context.footer.items, function(i, item) {
            command.add({
                name: 'footer:' + item.id,
                key: cmdKey + '+shift+' + (i + 1),
                exec: function() {
                    context.view.openFooter(context, item.id, function(state) {
                        if (!state) {
                            utils.async(function() {
                                var editor = context.getEditor();
                                if (editor) editor.focus();
                            }, 1500);
                        }
                    });
                }
            });
        });
        //--
    };
});