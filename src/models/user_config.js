define(function(require, exports, module) {
    var self = exports;
    //确保合局 require 不和 ems 的模块局部 require 冲突。
    var fs = require_node('fs');
    var os = require_node('os');
    var gui = require_node('nw.gui');
    var platform = os.platform();
    var isWin = /^win/.test(platform);

    var pathSpliter = isWin ? '\\' : '/';
    var dataPath = gui.App.dataPath;

    self.path = dataPath + pathSpliter + 'config.json';

    self.checkCreate = function() {
        if (!fs.existsSync(self.path)) {
            var tmplPath = require.toUrl('../files/config.json').replace((isWin ? 'file:///' : 'file://'), '');
            var tmplBuffer = fs.readFileSync(tmplPath);
            fs.writeFileSync(self.path, tmplBuffer);
        }
    };

    function removeComments(str) {
        str = str.replace(/\/\*[\w\W]*?\*\//gm, '').replace(/\/\/.*/gi, '');
        return str;
    };

    var cache = null;

    self.get = function() {
        if (cache === null) {
            if (fs.existsSync(self.path)) {
                try {
                    var buffer = fs.readFileSync(self.path);
                    var buffer = removeComments(buffer.toString());
                    //alert(buffer);
                    cache = JSON.parse(" " + buffer + " ");
                } catch (ex) {
                    cache = {};
                    utils.async(function() {
                        require('self/models/console', function() {
                            console.log('user config error : ' + ex.message);
                        });
                    }, 3000);
                }
            }
        }
        cache = cache || {};
        cache.key_binding = cache.key_binding || {};
        cache.editor = cache.editor || {};
        cache.editor.font_size = cache.editor.font_size || 14;
        cache.editor.tab_size = cache.editor.tab_size || 4;
        cache.environment = cache.environment || {};
        cache.environment.path = cache.environment.path || [];
        cache.console = cache.console || {};
        cache.child_process = cache.child_process || {};
        return cache;
    };

    window.textor.userConfig = self;

});