"use strict";
define(function(require, exports, modules) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var self = exports;
    var utils = require("mokit/utils");
    var linq = require("mokit/linq");
    var Task = require("mokit/task");
    var store = require("mokit/store");
    //
    var path = require_node("path");
    var fs = require_node('fs');
    var os = require_node('os');
    var jschardet = require_node("./node_modules/jschardet");
    var iconv = require_node('./node_modules/iconv-lite');
    //
    var platform = os.platform();
    var isWin = /^win/.test(platform);
    //
    var blankFileIndex = 0;
    var maxRecent = 15;
    //
    self.path = path; //path 工具类

    /**
     * 文件状态枚举
     * @type {Object}
     */
    var OPEN_FILE_STATES = {
        saved: 0, //已保存
        editing: 1 //编辑中
    };
    self.OPEN_FILE_STATES = OPEN_FILE_STATES;

    /**
     * 目录状态枚举
     * @type {Object}
     */
    var DIR_STATES = {
        closed: 0,
        opened: 1
    };
    self.DIR_STATES = DIR_STATES;

    self.currentInfo = []; //当前的文件系统信息
    self.currentFile = null; //当正在编辑的文件
    self.openFiles = {}; //所有打开的文件
    self.dirState = {}; //存目录状态
    self.recentInfo = []; //最新打开的文件或目录
    self.showType = 'finder'; // 可选类型 finder/recent;

    /**
     * 取一个文件名
     * @param  {String} _path 路径
     * @return {String}       文件名
     */
    function getFileName(_path) {
        if (_path === null) return "";
        return self.path.basename(_path);
    };

    self.getFileName = getFileName;

    //设置工作区显示模式
    self.setShowType = function(type, callback) {
        self.showType = type;
        if (self.showType == 'recent') {
            self.loadRecent(callback);
        } else {
            if (callback) callback();
        }
    };

    self.loadRecent = function(callback) {
        utils.async(function() {
            var recent = store.local.get('textor:recent');
            self.recentInfo = recent || [];
            if (callback) callback();
        });
    };

    self.addRecent = function(item) {
        utils.async(function() {
            self.recentInfo = linq.From(self.recentInfo).Where(function(x) {
                return x.path != item.path;
            }).ToArray();
            if (self.recentInfo.length > maxRecent) {
                self.recentInfo.pop();
            }
            self.recentInfo.splice(0, 0, {
                name: item.name,
                path: item.path,
                type: item.type
            });
            store.local.set('textor:recent', self.recentInfo);
        });
    };

    /**
     * 加载一个目录信息
     * @param  {String}   path     目录路径
     * @param  {Function} callback 加载完成回调
     * @param  {Object}   parent   目录父级，递归时使用
     * @return {Null}              无返回值
     */
    self.loadDirInfo = function(path, callback, parent) {
        if (!fs.existsSync(path)) {
            if (callback) callback();
            return;
        }
        if (!(fs.statSync(path).isDirectory())) {
            self.loadFileInfo(path, callback);
            return;
        }
        if (!parent) {
            self.removeInfo(path);
            parent = new ItemInfo(getFileName(path), path, 'dir', true);
            parent.root = parent;
            self.currentInfo.push(parent);
            self.addRecent(parent);
        }
        //为了方便确定什么时候查找并加载文件完成，暂使用同步方式
        var dirList = fs.readdirSync(path);
        dirList.forEach(function(item) {
            if (utils.startWith(item, '.')) return;
            var itemPath = path + (isWin ? '\\' : '/') + item;
            if (fs.statSync(itemPath).isDirectory()) {
                var dir = new ItemInfo(item, itemPath, 'dir');
                dir.root = parent.root;
                self.loadDirInfo(itemPath, function() {
                    //TODO:
                }, dir);
                parent.children.push(dir);
            } else {
                var file = new ItemInfo(item, itemPath, 'file');
                file.root = parent.root;
                parent.children.push(file);
            }
        });
        if (callback) callback();
    };

    /**
     * 加载一个文件信息
     * @param  {String}   path     文件路径
     * @param  {Function} callback 加载完成回调
     * @return {Null}              无返回值
     */
    self.loadFileInfo = function(path, callback) {
        if (!fs.existsSync(path)) {
            if (callback) callback();
            return;
        }
        if (fs.statSync(path).isDirectory()) {
            self.loadDirInfo(path, callback);
            return;
        }
        self.removeInfo(path);
        var item = new ItemInfo(getFileName(path), path, 'file', true);
        item.root = item;
        self.currentInfo.push(item);
        self.addRecent(item);
        if (callback) callback();
    };

    /**
     * 从工作区移除一个目录或文件
     * @param  {String}   path     文件或目录路径
     * @param  {Function} callback 完成回调
     * @return {Null}              无返回值
     */
    self.removeInfo = function(path, callback) {
        var removeIndex = null;
        utils.each(self.currentInfo, function(i, item) {
            if (item.path == path) {
                removeIndex = i;
                return false;
            }
        });
        if (removeIndex !== null) {
            self.currentInfo.splice(removeIndex, 1);
        }
        if (callback) callback();
    };

    self.refrushInfo = function(callback) {
        utils.async(function() {
            var task = Task.create();
            utils.each(self.currentInfo, function(i, item) {
                task.add(function(done) {
                    self['load' + (item.type == 'dir' ? 'Dir' : 'File') + 'Info'](item.path, done);
                });
            });
            task.seq(callback);
        });
    };

    self.clearWorkspace = function(callback) {
        self.currentInfo = [];
        self.dirState = {};
        if (callback) callback();
    };

    /**
     * 指文件系统的一个项（指一个目录或一个文件）
     * @param {String} _name 名称
     * @param {String} _path 路径
     * @param {String} _type 类型（dir:目录，file:文件）
     */
    function ItemInfo(_name, _path, _type, _isRoot) {
        this.name = _name;
        this.path = _path;
        this.type = _type;
        this.isRoot = _isRoot;
        if (this.type == 'dir') {
            this.children = [];
        }
    };

    /**
     * 打开一个目录
     * @param  {String} path       目录路径
     * @param  {Function} callback 打开回调
     * @return {Null}              无返回值
     */
    self.openDir = function(path, callback) {
        self.dirState[path] = DIR_STATES.opened;
        if (callback) callback();
    };

    /**
     * 关闭一个目录
     * @param  {String} path       目录路径
     * @param  {Function} callback 关闭回调
     * @return {Null}              无返回值
     */
    self.closeDir = function(path, callback) {
        self.dirState[path] = DIR_STATES.closed;
        if (callback) callback();
    };

    /**
     * 打开一个文件
     * @param  {String}   path     文件路径
     * @param  {Function} callback 打开回调
     * @return {Null}              无返回值
     */
    self.openFile = function(path, callback) {
        var fileInfo = self.openFiles[path] || {};
        fileInfo.path = path;
        //如 path 为空则创建空白文件
        if (utils.isNull(fileInfo.path)) {
            blankFileIndex++;
            fileInfo.name = "Untitled-" + blankFileIndex;
            fileInfo.path = fileInfo.name;
            fileInfo.isNewFile = true;
            fileInfo.encoding = 'unknow';
            fileInfo.state = OPEN_FILE_STATES.saved;
            fileInfo.data = "";
            self.openFiles[fileInfo.path] = fileInfo;
            self.currentFile = self.openFiles[fileInfo.path];
            if (callback) callback(self.currentFile);
            return;
        }
        //如果第一次打开文件从磁盘中读取
        if (utils.isNull(fileInfo.state)) {
            fs.readFile(fileInfo.path, function(err, data) {
                if (err) throw err;
                //识别编码
                var charset = jschardet.detect(data) || {};
                charset.encoding = (charset.encoding || "unknow").toLowerCase();
                //jschardet 识别 windows-1252 好像有点问题，暂认为 utf-8
                if (charset.encoding == 'windows-1252' || charset.encoding == 'windows-1251') {
                    charset.encoding = 'utf-8';
                }
                //--
                fileInfo.name = getFileName(fileInfo.path);
                fileInfo.state = OPEN_FILE_STATES.saved;
                fileInfo.encoding = charset.encoding;
                //编码转换开始
                if (fileInfo.encoding == 'utf-8' || fileInfo.encoding == 'unknow') {
                    fileInfo.data = data;
                } else if (fileInfo.encoding == 'unicode' || /^utf/.test(charset.encoding)) {
                    fileInfo.data = data.toString('UCS2'); //utf-16 
                } else { //其它编码需要转换
                    fileInfo.data = iconv.decode(data, fileInfo.encoding);
                }
                //编码转换结束
                self.openFiles[fileInfo.path] = fileInfo;
                self.currentFile = self.openFiles[fileInfo.path];
                if (callback) callback(self.currentFile);
            });
        } else { //如果内存中有直接打开
            self.currentFile = self.openFiles[fileInfo.path];
            if (callback) callback(self.currentFile);
        }
    };

    /**
     * 保存一个文件
     * @param  {String}   path     文件路径
     * @param  {String}   data     文件内容
     * @param  {Function} callback 保存回调
     * @return {Null}              无返回值
     */
    self.saveFile = function(path, data, callback) {
        var fileInfo = self.openFiles[path] || {};
        fileInfo.data = data;
        if (fileInfo.state != OPEN_FILE_STATES.saved) {
            fileInfo.state = OPEN_FILE_STATES.saved;
            if (fs.existsSync(path)) {
                //先设置写入权限
                fs.chmod(path, '+666', function() {
                    fs.writeFile(path, data, {
                        encoding: 'utf8'
                    }, function(err) {
                        if (err) throw err;
                        if (callback) callback();
                    });
                });
            } else {
                fs.writeFile(path, data, function(err) {
                    if (err) throw err;
                    if (callback) callback();
                });
            }
        } else {
            if (callback) callback();
        }
    };

    /**
     * 关闭一个文件
     * @param  {String}   path     路径
     * @param  {Function} callback 关闭回调
     * @return {Null}              无返回值
     */
    self.closeFile = function(path, callback, force) {
        if (self.openFiles[path].state == OPEN_FILE_STATES.saved || force) {
            self.openFiles[path] = null;
            delete self.openFiles[path];
            var otherOpenFiles = Object.getOwnPropertyNames(self.openFiles);
            //alert(otherOpenFiles);
            if (otherOpenFiles && otherOpenFiles.length > 0) {
                if (self.currentFile == null || self.currentFile.path == path) {
                    self.currentFile = self.openFiles[otherOpenFiles[otherOpenFiles.length - 1]];
                }
            } else if (otherOpenFiles == null || otherOpenFiles.length <= 0) {
                self.currentFile = null;
            }
            if (callback) callback(OPEN_FILE_STATES.saved);
        } else {
            if (callback) callback(OPEN_FILE_STATES.editing);
        }
    };

    self.exists = function(path, callback) {
        fs.exists(path, callback);
    };

    var deleteDir = function(path) {
        if (fs.existsSync(path)) {
            var files = fs.readdirSync(path);
            files.forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    deleteDir(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    fs.deleteDir = function(path, callback) {
        utils.async(function() {
            deleteDir(path);
            if (callback) callback();
        })
    };

    self.deleteDir = function(path, callback) {
        fs.deleteDir(path, function() {
            self.refrushInfo(callback);
        });
    };

    self.newDir = function(path, callback) {
        fs.mkdir(path, function() {
            self.refrushInfo(callback);
        });
    };

    //删除文件
    self.deleteFile = function(path, callback) {
        fs.unlink(path, function() {
            self.refrushInfo(callback);
        });
    };

    //新建文件
    self.newFile = function(path, callback) {
        fs.writeFile(path, '', function() {
            self.refrushInfo(callback);
        });
    };

    //重命名文件
    self.rename = function(path, newPath, callback) {
        fs.rename(path, newPath, function() {
            self.refrushInfo(callback);
        });
    };

    self.copyFile = function(src, dst, callback) {
        fs.readFile(src, function(err, buffer) {
            fs.writeFile(dst, buffer, function() {
                self.refrushInfo(callback);
            });
        });
    };

    var copyDir = function(src, dst) {
        if (fs.existsSync(src)) {
            if (!fs.existsSync(dst)) {
                fs.mkdirSync(dst);
            }
            var files = fs.readdirSync(src);
            files.forEach(function(file, index) {
                var subSrc = src + "/" + file;
                var subDst = dst + "/" + file;
                if (fs.statSync(subSrc).isDirectory()) {
                    copyDir(subSrc, subDst);
                } else {
                    var buffer = fs.readFileSync(subSrc);
                    fs.writeFileSync(subDst, buffer);
                }
            });
        }
    };

    self.copyDir = function(src, dst, callback) {
        utils.async(function() {
            copyDir(src, dst);
            self.refrushInfo(callback);
        })
    };

});