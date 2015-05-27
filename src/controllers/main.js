"use strict";
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var $ = require('mokit/jquery');
    var utils = require('mokit/utils');
    var config = require('mokit/ems-json!self/package.json');
    var app = require('mokit/app');
    var Task = require("mokit/task");
    var MainView = require('self/views/main');
    var EditorView = require('self/views/editor');
    var SidebarModel = require('self/models/sidebar');
    var CommandManager = require('self/models/command_manager');
    var FileManager = require('self/models/file_manager');
    var editMode = require('self/models/edit_mode');
    var ExtensionManager = require('self/models/extension_manager');
    var contextMenu = require('self/views/contextmenu');
    var lang = require('mokit/language').current();
    var FooterModel = require('self/models/footer');
    var ConsoleModel = require('self/models/console');
    var fileDlg = require('self/utils/file_dialog');
    //
    var gui = require_node('nw.gui');
    var win = gui.Window.get();

    window.ondragover = function(e) {
        e.preventDefault();
        return false
    };
    window.ondrop = function(e) {
        e.preventDefault();
        return false
    };

    /**
     * 主界面控制器
     */
    return app.controller.create({

        /**
         * 默认 action
         */
        index: function(context) {
            var self = this;
            //定义模型
            var _model = {
                sidebar: SidebarModel,
                footer: FooterModel,
                command: CommandManager,
                console: ConsoleModel,
                file: FileManager,
                config: config
            };
            ExtensionManager.call('CreateModel', _model);
            //实例根视图
            self.rootView = new MainView({
                model: _model
            });
            //通知插件程序已就绪
            var extensionContext = {
                'controller': self,
                'view': self.rootView,
                'file': FileManager,
                'command': CommandManager,
                'contextMenu': contextMenu,
                'window': win,
                'sidebar': SidebarModel,
                'footer': FooterModel,
                'console': ConsoleModel,
                'getCurrentFile': function() {
                    return FileManager.currentFile;
                },
                'getEditor': function() {
                    var file = this.getCurrentFile();
                    if (file) return file.editor;
                }
            };
            ExtensionManager.ready(extensionContext);
            //显示视图
            self.setView(self.rootView, function() {
                ExtensionManager.call('CreateContextMenu', contextMenu);
                ExtensionManager.render(extensionContext);
                console.log("主视图加载完成");
                //订阅窗口关闭事件
                win.on('close', function(event) {
                    context.event = event;
                    context.view = self.rootView;
                    return self.onClose(context);
                });
            });
        },

        /*
        退出应用
        */
        exitApp: function(context) {
            var self = this;
            win.hide();
            win.close(true);
            gui.App.quit();
        },

        /*
        处理命令行参数
        */
        onCmdLine: function(context, items) {
            var self = this;
            self.openFiles(context, items);
        },

        /*
        处理拖拽到窗口的文件
        */
        onDrop: function(context) {
            var self = this;
            if (utils.isNull(context.event) || utils.isNull(context.event.originalEvent) || utils.isNull(context.event.originalEvent.dataTransfer) || utils.isNull(context.event.originalEvent.dataTransfer.files)) {
                return;
            }
            var items = context.event.originalEvent.dataTransfer.files;
            if (items.length > 0) {
                self.openFiles(context, items);
            }
            return false;
        },

        /*
        打开一组文件
        */
        openFiles: function(context, items) {
            var self = this;
            utils.each(items, function(i, item) {
                if (utils.isNull(item)) return;
                var path = item.path || item;
                if (item.type === "") {
                    self.chooseDir(context, path);
                } else {
                    self.chooseFile(context, path);
                    self.openFile(context, path);
                }
            });
        },

        /*
        处理窗口关闭
        */
        onClose: function(context) {
            var self = this;
            var hasEditing = self.hasEditing(context);
            if (hasEditing) {
                context.view.root.alert.show(context, {
                    title: lang.save_file,
                    text: lang.exit_save_confirm,
                    buttons: [lang.cancel, lang.no_save, lang.save],
                    callback: function(rs) {
                        if (rs.state == 2) {
                            self.saveAllFile(context, function() {
                                self.exitApp(context);
                            });
                        } else if (rs.state == 1) {
                            self.exitApp(context);
                        }
                    }
                });
            } else {
                self.exitApp(context);
            }
            return false;
        },

        /*
        检查发前是否有编辑中的文件 
        */
        hasEditing: function(context) {
            var self = this;
            var hasEditing = false;
            utils.each(FileManager.openFiles, function(i, item) {
                if (item.state == FileManager.OPEN_FILE_STATES.editing) {
                    hasEditing = true;
                    return true;
                }
            });
            return hasEditing;
        },

        /*
        保存所有文件 
        */
        saveAllFile: function(context, callback) {
            var self = this;
            if (FileManager.openFiles.length < 1) {
                if (callback) callback();
                return;
            }
            var task = Task.create();
            utils.each(FileManager.openFiles, function(i, item) {
                task.add(function(done) {
                    self.saveFile(context, item.path, done);
                });
            });
            task.seq(callback);
        },

        /*
        保存当前文件 
        */
        saveCurrentFile: function(context, callback) {
            var self = this;
            if (FileManager.currentFile) {
                var path = FileManager.currentFile.path;
                self.saveFile(context, path, callback);
            } else {
                if (callback) callback();
            }
        },

        /*
        关才当前文件 
        */
        closeCurrentFile: function(context, callback) {
            var self = this;
            if (FileManager.currentFile) {
                var path = FileManager.currentFile.path;
                self.closeFile(context, path);
                if (callback) callback();
            } else {
                if (callback) callback();
            }
        },

        /*
        当前文件另存为，会弹出保对话框
        */
        saveAs: function(context, callback) {
            var self = this;
            if (FileManager.currentFile) {
                var fileInfo = FileManager.currentFile;
                fileDlg.show(context, {
                    type: 'save',
                    defaultName: fileInfo.name,
                    callback: function(path) {
                        FileManager.saveFile(path, fileInfo.data, callback);
                    }
                });
            } else {
                if (callback) callback();
            }
        },

        /**
         * 选择一个目录到工作区
         */
        chooseDir: function(context, rs) {
            var self = this;
            utils.async(function() {
                FileManager.setShowType('finder', function() {
                    FileManager.loadDirInfo(rs, function() {
                        self.refrushWorkspace(context);
                        context.view.root.tab.render();
                        context.view.root.state.render();
                        ExtensionManager.call('ChooseDir', rs);
                    });
                });
            });
        },

        /**
         * 选择一个文件到工作区
         */
        chooseFile: function(context, rs) {
            var self = this;
            utils.async(function() {
                FileManager.setShowType('finder', function() {
                    FileManager.loadFileInfo(rs, function() {
                        self.refrushWorkspace(context);
                        context.view.root.tab.render();
                        context.view.root.state.render();
                        ExtensionManager.call('ChooseFile', rs);
                    });
                });
            });
        },

        /*
        选择一个文件，，将弹出对话框
        */
        pickFile: function(context) {
            var self = this;
            fileDlg.show(context, {
                type: 'file',
                callback: function(rs) {
                    self.chooseFile(context, rs);
                }
            });
        },

        /*
        选择一个目录，将弹出对话框
        */
        pickFolder: function(context) {
            var self = this;
            fileDlg.show(context, {
                type: 'folder',
                callback: function(rs) {
                    self.chooseFile(context, rs);
                }
            });
        },

        /**
         * 创建一个空白文件
         **/
        createBlankFile: function(context) {
            var self = this;
            self.openFile(context, null);
        },

        /**
         * 从取最近列表中选取
         */
        chooseRecent: function(context, index) {
            var self = this;
            utils.async(function() {
                var item = FileManager.recentInfo[index];
                if (item.type == 'dir') {
                    self.chooseDir(context, item.path);
                } else {
                    self.chooseFile(context, item.path);
                }
            });
        },

        /**
         * 刷新工作区
         */
        refrushWorkspace: function(context) {
            var root = context.view.root;
            utils.async(function() {
                if (root.sidebarPanel && root.sidebarPanel.sidebarPanel_workspace) {
                    root.sidebarPanel.sidebarPanel_workspace.render();
                }
            });
        },

        //重新从磁盘加载并刷新工作区
        reLoadWorkspace: function(context) {
            var self = this;
            utils.async(function() {
                FileManager.refrushInfo(function() {
                    self.refrushWorkspace();
                });
            });
        },

        //更新工作区状态
        updateWorkspace: function(context) {
            var self = this;
            utils.async(function() {
                var root = context.view.root;
                if (root.sidebarPanel && root.sidebarPanel.sidebarPanel_workspace) {
                    root.sidebarPanel.sidebarPanel_workspace.updateState(context);
                }
            });
        },

        /*
        清空工作区，这个方法会弹出提示
        */
        $clearWorkspace: function(context) {
            var self = this;
            context.view.root.alert.show(context, {
                title: lang.clear_workspace,
                text: lang.clear_workspace_confirm,
                buttons: [lang.cancel, lang.clear_workspace],
                callback: function(rs) {
                    if (rs.state == 1) {
                        self.clearWorkspace(context, rs);
                    }
                }
            });
        },

        /*
        清空工作区
        */
        clearWorkspace: function(context, rs) {
            var self = this;
            FileManager.clearWorkspace(function() {
                self.refrushWorkspace(context);
                context.view.root.tab.render();
                context.view.root.state.render();
                ExtensionManager.call('ChooseFile', rs);
            });
        },

        /**
         * 解发编辑框resize，以解决编辑框大小改后，输入法面板定位不偏离问题。
         */
        resizeAllEditor: function(context) {
            utils.each(FileManager.openFiles, function(i, item) {
                if (item && item.editor) {
                    item.editor.resize();
                }
            });
        },

        /**
         * 隐藏所有编辑框
         */
        hideAllEditor: function(context) {
            utils.each(FileManager.openFiles, function(i, item) {
                if (item && item.editor) {
                    item.editor.hide();
                }
            });
        },

        /**
         * 移除所有编辑框
         */
        removeAllEditor: function(context) {
            utils.each(FileManager.openFiles, function(i, item) {
                if (item && item.editor) {
                    item.editor.remove();
                }
            });
        },

        /**
         * 打开一个文件
         */
        openFile: function(context, filePath) {
            var self = this;
            //打开新文件
            FileManager.openFile(filePath, function() {
                var currentFile = FileManager.currentFile;
                self.hideAllEditor();
                if (!currentFile.editor) {
                    var editorHolder = context.view.root.el.editorHolder;
                    currentFile.editor = new EditorView();
                    currentFile.editor.file = currentFile;
                    currentFile.editor.controller = self;
                    currentFile.editor.model = currentFile;
                    currentFile.editor.root = context.view.root;
                    currentFile.editor.render(editorHolder, function() {
                        currentFile.editor.initEditor(context, function() {
                            //设置文件模式
                            currentFile.mode = editMode.getMode(currentFile.path);
                            currentFile.editor.setMode(currentFile.mode);
                            currentFile.editor.focus();
                            ExtensionManager.call('OpenFile', currentFile);
                        });
                    });
                } else {
                    currentFile.editor.show();
                    currentFile.editor.focus();
                    ExtensionManager.call('OpenFile', currentFile);
                }
                //重绘相关view
                context.view.root.tab.render();
                //self.refrushWorkspace(context);
                self.updateWorkspace(context);
                context.view.root.state.render();
            });
        },

        /**
         * 打开一个文件，这个方法将从UI上取参数
         */
        $openFile: function(context) {
            var self = this;
            var filePath = context.$element.parent().attr('path');
            filePath = filePath || context.$element.attr('path');
            self.openFile(context, filePath);
        },

        /**
         * 关闭一个文件
         */
        closeFile: function(context, path, force) {
            var self = this;
            //取对应编辑框
            var fileInfo = FileManager.openFiles[path];
            var fileEditor = fileInfo.editor;
            //保存一个文件时，可以指定是否强制关闭，如果不强制关闭，编辑中的文件将弹出提示。
            FileManager.closeFile(fileInfo.path, function(rs) {
                if (rs == 0) { //如果文件已保存
                    //移除编辑器
                    fileEditor.remove();
                    //重绘视图
                    context.view.root.tab.render();
                    //self.refrushWorkspace(context);
                    self.updateWorkspace(context);
                    //打开新选中的当前文件
                    if (FileManager.currentFile) {
                        self.openFile(context, FileManager.currentFile.path);
                    } else {
                        //在关闭最后一个文件时没有当前文件，但需要刷新状态栏
                        context.view.root.state.render();
                    }
                } else { //如果是未保存的文件
                    context.view.root.alert.show(context, {
                        title: lang.save_file,
                        text: lang.close_save_confirm.replace('{0}', fileInfo.path),
                        buttons: [lang.cancel, lang.no_save, lang.save],
                        callback: function(rs) {
                            if (rs.state == 2) {
                                self.saveFile(context, fileInfo.path, function() {
                                    self.closeFile(context, path, true);
                                    ExtensionManager.call('CloseFile', fileInfo);
                                });
                            } else if (rs.state == 1) {
                                self.closeFile(context, path, true);
                                ExtensionManager.call('CloseFile', fileInfo);
                            }
                        }
                    });
                }
            }, force);
        },

        /**
         * 关闭一个文件,这个方法将从UI上取参数
         */
        $closeFile: function(context) {
            var self = this;
            //从视图取文件路径
            var filePath = context.$element.parent().attr('path');
            filePath = filePath || context.$element.attr('path');
            self.closeFile(context, filePath);
            return false;
        },

        /**
         * 保存一个文件，如果文件是临时文件会弹出保存对话框
         */
        saveFile: function(context, path, callback) {
            var self = this;
            var fileInfo = FileManager.openFiles[path];
            if (fileInfo == null || fileInfo.state != FileManager.OPEN_FILE_STATES.editing) {
                if (callback) callback();
                return;
            }
            //将编辑器内容同步到"模型"中
            fileInfo.data = fileInfo.editor.getValue();
            //如果是一个新空白文件，弹出保存对话框
            if (fileInfo.isNewFile) {
                utils.async(function() {
                    fileDlg.show(context, {
                        type: 'save',
                        defaultName: fileInfo.name,
                        callback: function(rs) {
                            fileInfo.path = rs;
                            fileInfo.name = FileManager.getFileName(fileInfo.path);
                            FileManager.openFiles[fileInfo.path] = fileInfo;
                            FileManager.addRecent(fileInfo);
                            fileInfo.mode = editMode.getMode(fileInfo.path);
                            fileInfo.editor.setMode(fileInfo.mode);
                            //移除旧的未保存的文件
                            FileManager.openFiles[path] = null;
                            delete FileManager.openFiles[path];
                            //重新触发打开事件，以启用相关插件功能
                            ExtensionManager.call('OpenFile', fileInfo);
                            //将isNewFile置为false并保存文件。
                            fileInfo.isNewFile = false;
                            self.saveFile(context, fileInfo.path, callback);
                        }
                    });
                }, 100);
                return;
            } else { //直接保存文件
                FileManager.saveFile(fileInfo.path, fileInfo.data, function() {
                    context.view.root.tab.render();
                    context.view.root.state.render();
                    //self.refrushWorkspace(context);
                    self.updateWorkspace(context);
                    ExtensionManager.call('SaveFile', fileInfo);
                    if (callback) callback();
                });
                return;
            }
        },

        /**
         * 展开一个目录
         */
        openDir: function(context, path) {
            FileManager.openDir(path);
            ExtensionManager.call('OpenDir', path);
        },

        /**
         * 收缩一个目录
         */
        closeDir: function(context, path) {
            FileManager.closeDir(path);
            ExtensionManager.call('CloseDir', path);
        },

        /*
        设置工作区显示类型，可选 “文件浏览、最近列表”
        */
        setShowType: function(context, type) {
            var self = this;
            FileManager.setShowType(type, function() {
                self.refrushWorkspace(context);
            });
        },

        /**
         * 查找一个命令
         */
        findCommand: function(context, keyword) {
            var keyCode = context.keyCode;
            if (keyCode == 38 || keyCode == 40) {
                var index = CommandManager.selectedIndex + (keyCode == 38 ? -1 : 1);
                CommandManager.select(index, function() {
                    context.view.updateCommandList(context, index, keyCode == 38 ? 'up' : 'down');
                });
                keyCode = 0;
                context.preventDefault();
            } else if (keyCode == 13) {
                CommandManager.execSelectedCommand();
                context.view.selectCommandBox(context);
            } else {
                CommandManager.find(keyword, function() {
                    CommandManager.select(0, function() {
                        context.view.commandList.render();
                    });
                });
            }
            return false;
        },

        //执行一个命令
        execCommand: function(context, index) {
            CommandManager.select(index, function() {
                context.view.parent.updateCommandList(context, index);
                CommandManager.execSelectedCommand();
                context.view.parent.selectCommandBox(context);
            });
        },

        //切换语言模式
        switchMode: function(context) {
            var my = ExtensionManager.getExtension('__self__');
            my.mode.switchMode();
        },

        /**
         * 显示设置面板
         */
        showSetting: function(context) {
            var gui = top.require('nw.gui', null);
            var win = gui.Window.get();
            win.showDevTools();
        },

        //显示官网
        showInfo: function(context) {
            var self = this;
            gui.Shell.openExternal(config.site);
        }

    });
});