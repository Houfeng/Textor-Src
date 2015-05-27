define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;
    var utils = require('mokit/utils');

    var lang = null;
    var context = null;
    var finderItem = null;

    function refrushWorkspace() {
        context.controller.refrushWorkspace(context);
    }

    function reLoadWorkspace() {
        context.file.refrushInfo(function() {
            refrushWorkspace();
        });
    }

    function showAlert(text, callback) {
        context.view.alert.show(context, {
            title: lang.alert,
            text: text,
            buttons: [lang.cancel, lang['continue']],
            callback: function(rs) {
                if (rs && rs.state == 1) {
                    if (callback) callback();
                }
            }
        });
    }

    function deleteFile() {
        context.view.alert.show(context, {
            title: lang.delete_file,
            text: lang.delete_file_confirm.replace('{0}', finderItem.path),
            buttons: [lang.cancel, lang["delete"]],
            callback: function(rs) {
                if (rs.state == 1) {
                    context.file.deleteFile(finderItem.path, function() {
                        refrushWorkspace();
                    });
                }
            }
        });
    }

    function moveFile(_name) {
        context.view.alert.show(context, {
            title: lang.move_file,
            input: _name || finderItem.path,
            buttons: [lang.cancel, lang.move],
            callback: function(rs) {
                if (rs.state == 1) {
                    context.file.exists(rs.input, function(exists) {
                        if (exists) {
                            showAlert(lang.file_already_exists.replace('{0}', rs.input), function() {
                                moveFile(rs.input);
                            });
                        } else {
                            context.file.rename(finderItem.path, rs.input, function() {
                                refrushWorkspace();
                            });
                        }
                    });
                }
            }
        });
    }

    function renameFile(_name) {
        var fileName = context.file.getFileName(finderItem.path);
        context.view.alert.show(context, {
            title: lang.rename_file,
            input: _name || fileName,
            buttons: [lang.cancel, lang.rename],
            callback: function(rs) {
                if (rs.state == 1) {
                    var newPath = context.file.path.dirname(finderItem.path) + '/' + rs.input;
                    context.file.exists(newPath, function(exists) {
                        if (exists) {
                            showAlert(lang.file_already_exists.replace('{0}', rs.input), function() {
                                renameFile(rs.input);
                            });
                        } else {
                            context.file.rename(finderItem.path, newPath, function() {
                                refrushWorkspace();
                            });
                        }
                    });
                }
            },
            show: function() {
                context.view.alert.inputRange.setSelection(fileName.split('.')[0]);
            }
        });
    }

    function newFile(_name) {
        context.view.alert.show(context, {
            title: lang.new_file,
            input: _name || lang.new_file,
            buttons: [lang.cancel, lang['new']],
            callback: function(rs) {
                if (rs.state == 1 && utils.trim(rs.input) !== '') {
                    var filePath = finderItem.path + '/' + rs.input;
                    context.file.exists(filePath, function(exists) {
                        if (exists) {
                            showAlert(lang.file_already_exists.replace('{0}', rs.input), function() {
                                newFile(rs.input);
                            });
                        } else {
                            context.file.newFile(filePath, function() {
                                refrushWorkspace();
                            });
                        }
                    });
                }
            }
        });
    }

    function deleteDir() {
        context.view.alert.show(context, {
            title: lang.delete_folder,
            text: lang.delete_folder_confirm.replace('{0}', finderItem.path),
            buttons: [lang.cancel, lang["delete"]],
            callback: function(rs) {
                if (rs.state == 1) {
                    context.file.deleteDir(finderItem.path, function() {
                        refrushWorkspace();
                    });
                }
            }
        });
    }

    function moveDir(_name) {
        context.view.alert.show(context, {
            title: lang.move_folder,
            input: _name || finderItem.path,
            buttons: [lang.cancel, lang.move],
            callback: function(rs) {
                if (rs.state == 1) {
                    context.file.exists(rs.input, function(exists) {
                        if (exists) {
                            showAlert(lang.folder_already_exists.replace('{0}', rs.input), function() {
                                moveDir(rs.input);
                            });
                        } else {
                            context.file.rename(finderItem.path, rs.input, function() {
                                refrushWorkspace();
                            });
                        }
                    });
                }
            }
        });
    }

    function renameDir(_name) {
        context.view.alert.show(context, {
            title: lang.rename_folder,
            input: _name || context.file.getFileName(finderItem.path),
            buttons: [lang.cancel, lang.rename],
            callback: function(rs) {
                if (rs.state == 1) {
                    var newPath = context.file.path.dirname(finderItem.path) + '/' + rs.input;
                    context.file.exists(newPath, function(exists) {
                        if (exists) {
                            showAlert(lang.folder_already_exists.replace('{0}', rs.input), function() {
                                renameDir(rs.input);
                            });
                        } else {
                            context.file.rename(finderItem.path, newPath, function() {
                                refrushWorkspace();
                            });
                        }
                    });
                }
            }
        });
    }

    function newDir(_name) {
        context.view.alert.show(context, {
            title: lang.new_folder,
            input: _name || lang.new_folder,
            buttons: [lang.cancel, lang['new']],
            callback: function(rs) {
                if (rs.state == 1) {
                    var filePath = finderItem.path + '/' + rs.input;
                    context.file.exists(filePath, function(exists) {
                        if (exists) {
                            showAlert(lang.folder_already_exists.replace('{0}', rs.input), function() {
                                newDir(rs.input);
                            });
                        } else {
                            context.file.newDir(filePath, function() {
                                refrushWorkspace();
                            });
                        }
                    });
                }
            }
        });
    }

    function copyDir(_name) {
        context.view.alert.show(context, {
            title: lang.copy_folder,
            input: _name || finderItem.path,
            buttons: [lang.cancel, lang.copy],
            callback: function(rs) {
                if (rs.state == 1) {
                    context.file.exists(rs.input, function(exists) {
                        if (exists) {
                            showAlert(lang.folder_already_exists.replace('{0}', rs.input), function() {
                                copyDir(rs.input);
                            });
                        } else {
                            context.file.copyDir(finderItem.path, rs.input, function() {
                                refrushWorkspace();
                            });
                        }
                    });
                }
            }
        });
    }

    function copyFile(_name) {
        context.view.alert.show(context, {
            title: lang.copy_file,
            input: _name || finderItem.path,
            buttons: [lang.cancel, lang.copy],
            callback: function(rs) {
                if (rs.state == 1) {
                    context.file.exists(rs.input, function(exists) {
                        if (exists) {
                            showAlert(lang.file_already_exists.replace('{0}', rs.input), function() {
                                copyFile(rs.input);
                            });
                        } else {
                            context.file.copyFile(finderItem.path, rs.input, function() {
                                refrushWorkspace();
                            });
                        }
                    });
                }
            }
        });
    }

    function remove() {
        context.view.alert.show(context, {
            title: lang.remove_from_workspace,
            text: lang.remove_from_workspace_confirm.replace('{0}', finderItem.path),
            buttons: [lang.cancel, lang.remove],
            callback: function(rs) {
                if (rs.state == 1) {
                    context.file.removeInfo(finderItem.path, function() {
                        refrushWorkspace();
                    });
                }
            }
        });
    }

    function deleteItem() {
        if (finderItem.type == 'dir')
            deleteDir();
        else
            deleteFile();
    }

    function moveItem() {
        if (finderItem.type == 'dir')
            moveDir();
        else
            moveFile();
    }

    function copyItem() {
        if (finderItem.type == 'dir')
            copyDir();
        else
            copyFile();
    }

    function renameItem() {
        if (finderItem.type == 'dir')
            renameDir();
        else
            renameFile();
    }

    function showItemInFolder() {
        context.shell.showItemInFolder(finderItem.path);
    }

    function openItem() {
        context.shell.openItem(finderItem.path);
    }

    //----

    self.onReady = function(_context) {
        context = _context;
        lang = context.lang;
    };
    
    self.onCreateContextMenu = function(contextMenu) {
        //菜单类
        var Menu = contextMenu.Menu;
        var MenuItem = contextMenu.MenuItem;

        //新建文件或目录的菜单项
        var newItems = [
            new MenuItem({
                label: lang.new_file,
                click: function() {
                    newFile();
                }
            }),
            new MenuItem({
                label: lang.new_folder,
                click: function() {
                    newDir();
                }
            })
        ];
        //公共菜单项
        var commonItems = [
            new MenuItem({
                label: lang["delete"].toString(),
                click: function() {
                    deleteItem();
                }
            }),
            new MenuItem({
                label: lang.rename,
                click: function() {
                    renameItem();
                }
            }),
            new MenuItem({
                label: lang.move,
                click: function() {
                    moveItem();
                }
            }),
            new MenuItem({
                label: lang.copy,
                click: function() {
                    copyItem();
                }
            })
        ];
        //文件打开菜单项
        var openItems = [
            new MenuItem({
                label: lang.show_in_folder,
                click: function() {
                    showItemInFolder();
                }
            }),
            new MenuItem({
                label: lang.open_in_default,
                click: function() {
                    openItem();
                }
            })
        ];
        //根菜单项
        var rootItems = [
            new MenuItem({
                label: lang.refrush_workspace,
                click: function() {
                    reLoadWorkspace();
                }
            }),
            new MenuItem({
                label: lang.remove_from_workspace,
                click: function() {
                    remove();
                }
            })
        ];

        //添加新建菜单
        utils.each(newItems, function(i, menuItem) {
            contextMenu.finder.append(menuItem);
        });
        contextMenu.finder.append(new MenuItem({
            type: 'separator'
        }));
        //添加公共菜单
        utils.each(commonItems, function(i, menuItem) {
            contextMenu.finder.append(menuItem);
        });
        contextMenu.finder.append(new MenuItem({
            type: 'separator'
        }));
        //添加打开菜单
        utils.each(openItems, function(i, menuItem) {
            contextMenu.finder.append(menuItem);
        });
        contextMenu.finder.append(new MenuItem({
            type: 'separator'
        }));
        //添加根目录菜单
        utils.each(rootItems, function(i, menuItem) {
            contextMenu.finder.append(menuItem);
        });
        //--
        contextMenu.finder.on('popup', function() {
            finderItem = contextMenu.finder.finderItem;
            //控制新建菜单的状态
            utils.each(newItems, function(i, menuItem) {
                menuItem.enabled = (finderItem.type == 'dir');
            });
            //控制公共菜单状态
            utils.each(commonItems, function(i, menuItem) {
                menuItem.enabled = !finderItem.isRoot;
            });
            //用默认程序打开菜单状态
            openItems[1].enabled = (finderItem.type == 'file');
            //控制针对根目录的菜单项的状态
            utils.each(rootItems, function(i, menuItem) {
                menuItem.enabled = finderItem.isRoot;
            });
        });
    };
});