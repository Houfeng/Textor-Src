define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;
    var utils = require('mokit/utils');
    var linq = require('mokit/linq');
    var Task = require("mokit/task");
    var $event = require('mokit/event');
    var commandManager = require('./command_manager');
    var fileManager = require('./file_manager');
    var console = require('./console');
    var _process = require("./process");
    var store = require("mokit/store");
    var app = require('mokit/app');
    var lang = require('mokit/language');
    var network = require('self/utils/network');
    var usrCfg = require('self/models/user_config').get();

    //确保合局 require 不和 ems 的模块局部 require 冲突。
    var fs = require_node('fs', null);
    var os = require_node('os', null);
    var gui = require_node('nw.gui', null);

    //alert(gui.App.dataPath);
    var platform = os.platform();
    var isWin = /^win/.test(platform);

    var pathSpliter = isWin ? '\\' : '/';

    window.textor.process = _process;

    self.setDebugPath = function(path) {
        store.session.set('textor-ext-debug-path', path);
    };

    self.getDebugPath = function() {
        return store.session.get('textor-ext-debug-path');
    };

    self.resovleUri = function(uri, module) {
        var pyUri = module.resovleUri(uri).replace((isWin ? 'file:///' : 'file://'), '');
        if (isWin) {
            pyUri = utils.replace(pyUri, '/', '\\');
        }
        return pyUri;
    };

    self.extensionPath = {
        //系统插件路径
        system: self.resovleUri('../extension/', module),
        //用户插件路径
        user: gui.App.dataPath + pathSpliter + "extension" + pathSpliter
    };

    //检查用户插件路径是否存在
    if (!fs.existsSync(self.extensionPath.user)) {
        fs.mkdir(self.extensionPath.user);
    }
    commandManager.add({
        name: 'extension:local path',
        exec: function() {
            //alert(self.extensionPath.user);
            gui.Shell.showItemInFolder(self.extensionPath.user);
        }
    });

    self.extensions = [];

    window.textor.extensions = self.extensions;

    self.getExtension = function(p) {
        var fn = utils.isFunction(p) ? p : function(ext) {
            return ext.info.id === p;
        };
        var list = linq.From(self.extensions).Where(fn).ToArray();
        return list ? list[0] : null;
    };

    $event.use(self);

    var maxLoadTime = 5 * 1000; //指定时间不能完成加载的插件，直接丢弃

    var loadExtension = function(type, path, id, callback) {
        var extPath = path + id + "/";
        var infoFile = extPath + "package.json";
        var loaded = false;
        require("mokit/ems-json!" + infoFile, function(info) {
            info = info || {};
            info.id = info.id || id; //参数中的id其实就是安装的目录名
            info.path = extPath;
            info.name = info.name || info.id;
            info.main = info.main || 'main';
            info.version = info.version || 'unknow';
            info.summary = info.summary || 'not found';
            info.type = type;
            self.call('loadBegin', info);
            //console.log('插件 "' + info.name + '" 加载开始.');
            require(extPath + info.main, function(ext) {
                if (loaded === false && callback) {
                    ext.info = info || {};
                    self.extensions.push(ext);
                    //console.log('插件 "' + info.name + '" 加载完成.');
                    self.call('loadEnd', info);
                    loaded = true;
                    callback();
                }
            });
        });
        //最大加载时间检查
        utils.async(function() {
            if (loaded === false && callback) {
                loaded = true;
                callback();
            }
        }, maxLoadTime);
    };

    /**
     * 加载插件
     * @param  {Function} callback 完成回调
     * @return {Null}              无返回值
     */
    var loadByPath = function(type, path, callback) {
        try {
            var dirList = fs.readdirSync(path);
            var task = Task.create();
            utils.each(dirList, function(i, id) {
                if (utils.startWith(id, '.') || utils.startWith(id, '_')) return;
                task.add(function(done) {
                    try {
                        loadExtension(type, path, id, done);
                    } catch (ex) {
                        console.error(ex);
                        if (done) done();
                    }
                });
            });
            task.end(callback);
        } catch (ex) {
            alert("system extension error : " + ex.message);
            if (callback) callback();
        }
    };

    var loadDebug = function(callback) {
        var debugPath = self.getDebugPath();
        if (utils.isNull(debugPath)) {
            if (callback) callback();
            return;
        }
        //
        var splitIndex = debugPath.lastIndexOf(pathSpliter);
        var path = debugPath.substr(0, splitIndex + 1);
        var id = debugPath.substr(splitIndex + 1);
        loadExtension('debug', path, id, callback);
    };

    self.load = function(callback) {
        utils.async(function() {
            loadByPath('system', self.extensionPath.system, function() {
                loadByPath('user', self.extensionPath.user, function() {
                    loadDebug(callback);
                });
            });
        });
    };

    self.each = function(callback) {
        utils.each(self.extensions, function(i, item) {
            if (callback) callback(item);
        });
    };

    var isFirstStart = null;
    var checkFirstStart = function() {
        if (!utils.isNull(isFirstStart)) {
            return isFirstStart;
        }
        var store_key = 'textor:first-start-mark';
        var first_start_mark = store.local.get(store_key);
        isFirstStart = (first_start_mark == null || first_start_mark != app.config.version);
        store.local.set(store_key, app.config.version);
        return isFirstStart;
    };

    var wrapContext = function(context) {
        context = context || {};
        context.platform = platform;
        context.isWin = isWin;
        context.cmdKey = (platform === 'darwin') ? 'command' : 'ctrl';
        context.gui = gui;
        context.nativeApp = gui.App;
        context.app = app;
        context.shell = gui.Shell;
        context.process = _process;
        context.fs = fs;
        context.os = os;
        context.command = commandManager;
        context.pathSpliter = pathSpliter;
        context.console = console;
        context.dataPath = gui.App.dataPath;
        context.extensionPath = self.extensionPath.user;
        context.lang = lang.current();
        context.network = network;
        context.config = usrCfg;
        context.isFirstStart = checkFirstStart();
        context.getExtension = self.getExtension;
        context.trigger = self.trigger;
        context.env = _process.env;
        context.resovleUri = self.resovleUri;
        context.extensions = self;
        context.file = fileManager;
        return context;
    };

    /**
     * 程序启动完成
     * @param  {Object} context 上下文
     * @return {Null}           无返回值
     */
    self.ready = function(context) {
        //console.log("系统就序");
        context = wrapContext(context);
        textor.context = context;
        self.each(function(item) {
            item.context = context;
        });
        //console.log("开始触发各插件 Ready 事件");
        self.call('Ready', context, function() {
            //console.log("所有插件就序");
            self.call('AllExtensionReady');
        });
    };

    self.render = function(context) {
        context = wrapContext(context);
        self.call('Render', context);
    };

    self.call = function(name, args, callback) {
        var eventName = "on" + name;
        utils.async(function() {
            var task = Task.create();
            self.each(function(item) {
                if (utils.isNull(item) || (typeof item[eventName] !== 'function')) {
                    return;
                }
                task.add(function(done) {
                    try {
                        item[eventName](args);
                        if (done) done();
                    } catch (ex) {
                        console.error("在'" + item.info.id + "'的事件'" + eventName + "'中" + ": " + ex);
                        if (done) done();
                    }
                });
            });
            task.end(callback);
        });
    };
});
//