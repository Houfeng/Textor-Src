"use strict";
/*处理 node 和 ems 的 require 冲突 */
top.require_node = top.require;
top.require_node = top.require_node;
top.textor = top.textor || {};

/*是否是 Debug 模式*/
top.textor.debugMode = false;

/*包配置*/
ems.config({
    packages: [{ //配置mokit包
        'name': 'mokit',
        'location': ems.resovleUri('./lib/mokit/'),
        'main': 'app'
    }, { //配置ACE包
        'name': 'ace',
        'location': ems.resovleUri('./lib/ace/'),
        'main': 'ace'
    }, { //配置Textor自身
        'name': 'self',
        'location': ems.resovleUri('./'),
        'main': 'main'
    }],
    alias: {
        'jqueryui': ems.resovleUri('./lib/juqeryui')
    }
});

/**
 * 应用启动模块
 */
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require('mokit/app');
    var $ = require('mokit/jquery');
    var lang = require('mokit/language');
    var key = require('mokit/key');
    var console = require('self/models/console');
    var utils = require('mokit/utils');
    var langMgr = require('self/models/langmgr');
    var extMgr = require('self/models/extension_manager');
    var network = require('self/utils/network');
    //应用加载完成后，显示应用主界面
    var gui = require_node('nw.gui');
    var win = gui.Window.get();

    if (!top.textor.debugMode) {
        //全局错误处理开始
        //浏览器全局错误处理方法
        top.onerror = function(msg, url, line) {
            console.error(msg + '\r\n' + url + ':' + line);
            return true;
        };
        //Node 全局错误处理方法
        top.process.on('uncaughtException', function(err) {
            return true; //阻止 node-webkit 的错误界面
        });
        //全局错误处理结束
    }

    /**
     * 加载配置
     */
    var config = app.config = require('mokit/ems-json!package.json');

    textor.config = config;
    extMgr.config = config;

    //过滤
    key.filter = function(event) {
        var tagName = (event.target || event.srcElement).tagName;
        key.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'other');
        return true;
    };

    //禁止退格键触发页面返回
    key('backspace', function(event) {
        var tagName = (event.target || event.srcElement).tagName;
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tagName)) return true;
        event.keyCode = 0;
        return false;
    });

    //快捷键令牌
    key.token = '';

    //设置网络检查 Url
    network.setUrl(config.site);

    /**
     * 样式配置
     */
    app.style.addStyle({
        'default': './styles/default/main.css'
    }, module);

    /**
     * 语言配置
     */
    app.language.addLanguage({
        'zh-cn': './languages/zh-cn',
        'en-us': './languages/en-us'
    }, module);

    //默认语言
    langMgr.defaultLanguage = config.language;

    /**
     * 路由配置
     */
    app.route.addRoute([{
        pattern: '/main',
        target: './controllers/main',
        effect: [0, 0]
    }, {
        pattern: '/splash',
        target: './controllers/splash',
        effect: [0, 0]
    }], module);

    //重启程序
    app.restart = function() {
        win.hide();
        utils.async(function() {
            location.href = location.href.split('#')[0];
        }, 500);
    };

    /**
     * 初始化应用程序
     */
    app.init({
        language: langMgr.getLangName(),
        style: config.style,
        index: config.index,
        splash: config.splash,
        preInit: function(done) {
            extMgr.load(function() {
                extMgr.trigger('Init', app);
                done();
            });
        }
    });

    //显示 native window
    win.show();
    win.focus();
});