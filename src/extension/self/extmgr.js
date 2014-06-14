define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;
    var utils = require('mokit/utils');
    var extMgr = require('self/models/extension_manager');
    var console = require('self/models/console');
    var Task = require('mokit/task');

    var win_zip = '"' + require.toUrl('self/files/zip.exe').replace('file:///', '') + '"';
    var win_unzip = '"' + require.toUrl('self/files/unzip.exe').replace('file:///', '') + '"';

    var extList = null;
    var lang = null;

    function getExtensions() {
        if (!utils.isNull(extList)) {
            return extList;
        }
        extList = [];
        utils.each(extMgr.extensions, function(i, item) {
            if (item.info.type == 'user') {
                extList.push({
                    text: item.info.name + "[" + item.info.version + "] (" + item.info.summary + ")",
                    value: item.info.path
                });
            }
        });
        return extList;
    };

    function install(context) {
        context.view.fileDialog.show(context, {
            type: 'file',
            accept: '.tpk',
            callback: function(path) {
                context.view.openFooter(context, 'console');
                console.writeLine('install extension start.\r\n');
                utils.async(function() {
                    var guid = utils.newGuid();
                    var unzipCmd = 'unzip "' + path + '" -d "' + context.extensionPath + guid + '"';
                    if (context.isWin) {
                        unzipCmd = win_unzip + ' "' + path + '" -d "' + context.extensionPath + guid + '"';
                    }
                    //document.write(unzipCmd);
                    context.process.exec(unzipCmd, null, function() {
                        console.writeLine('Wait for the installation...');
                        checkInstallState(context, context.extensionPath + guid + '/package.json', 0);
                    });
                });
            }
        });
    };

    //检查是否安装成功
    function checkInstallState(context, path, num) {
        if (!context || !path) {
            console.writeLine('install extension failed.\r\n');
            return;
        }
        //检查是否安装超时
        num = (num || 0) + 1;
        if (num >= 120) {
            //如果已开始安装，但安装超时或失败，清楚失败的残余文件 
            var dirPath = path.replace('/package.json', '');
            deleteExt(context, dirPath, function() {
                console.writeLine('install extension failed.\r\n');
            });
            return;
        }
        //检查是否安装成功
        if (context.fs.existsSync(path)) {
            console.writeLine('install extension done.\r\n');
        } else {
            utils.async(function() {
                console.write('.');
                checkInstallState(context, path, num);
            }, 1000);
        }
    };

    function deleteExt(context, path, callback) {
        utils.async(function() {
            if (context.fs.existsSync(path)) {
                context.fs.deleteDir(path, callback);
            }
        }, 1000);
    };

    function uninstall(context) {
        context.view.alert.show(context, {
            title: lang.uninstall,
            items: getExtensions(),
            buttons: [lang.cancel, lang.uninstall],
            callback: function(rs) {
                if (rs.state == 1) {
                    context.view.openFooter(context, 'console');
                    console.writeLine('uninstall extension start.\r\n');
                    deleteExt(context, rs.value, function() {
                        console.writeLine('uninstall extension done.\r\n');
                    });
                }
            }
        });
    };

    function packExt(context) {
        context.view.fileDialog.show(context, {
            type: 'save',
            accept: '.tpk',
            callback: function(path) {
                var debugPath = extMgr.getDebugPath();
                if (!debugPath) {
                    console.error('debug path not found.');
                    return;
                }
                context.view.openFooter(context, 'console');
                console.writeLine('pack extension start.\r\n');
                var zipCmd = 'zip "' + path + '" -r ./';
                if (context.isWin) {
                    zipCmd = win_zip + ' "' + path + '" -r ./';
                }
                //console.writeLine(zipCmd);
                context.process.exec(zipCmd, {
                    cwd: debugPath
                }, function() {
                    console.writeLine('pack extension done.\r\n');
                });
            }
        });
    };

    function devOn(context) {
        context.view.fileDialog.show(context, {
            type: 'folder',
            callback: function(path) {
                extMgr.setDebugPath(path);
                console.writeLine('Development mode has been opened.\r\n');
                context.view.openFooter(context, 'console');
            }
        });
    };

    function devOff(context) {
        extMgr.setDebugPath(null);
        console.writeLine('Development mode has been closed.\r\n');
        context.view.openFooter(context, 'console');
    };

    function openExtRepo(context) {
        var url = context.sysInfo.site + "/extension-list.html";
        context.shell.openExternal(url);
    };

    self.onReady = function() {
        lang = self.context.lang;
        self.context.command.add([{
            name: 'extension:install',
            exec: function() {
                install(self.context);
            }
        }, {
            name: 'extension:uninstall',
            exec: function() {
                uninstall(self.context);
            }
        }, {
            name: 'extension:dev on',
            exec: function() {
                devOn(self.context);
            }
        }, {
            name: 'extension:dev off',
            exec: function() {
                devOff(self.context);
            }
        }, {
            name: 'extension:package',
            exec: function() {
                packExt(self.context);
            }
        }, {
            name: 'extension:repertory',
            exec: function() {
                openExtRepo(self.context);
            }
        }]);
    };
});