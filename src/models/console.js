define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;
    var utils = require("mokit/utils");
    var $event = require("mokit/event");
    var jschardet = require_node("./node_modules/jschardet");
    var iconv = require_node('./node_modules/iconv-lite');
    var usrCfg = require('self/models/user_config').get();

    usrCfg.console = usrCfg.console || {};

    var buffer = "";
    var lastInfo = "";

    $event.use(self);

    self.bufferSize = usrCfg.console.max_buffer || 100000;

    self.getBuffer = function() {
        return buffer;
    };

    self.getLines = function() {
        return buffer.split('\n');
    };

    self.getLastInfo = function() {
        return lastInfo;
    };

    //清理
    self.clear = function() {
        process.nextTick(function() {
            buffer = "";
           self.call('change');
        });
    };

    //输出文本
    self.write = function(text) {
        utils.async(function() {
            var charset = jschardet.detect(text) || {};
            charset.encoding = (charset.encoding || "unknow").toLowerCase();
            //jschardet 识别 windows-1252 好像有点问题，暂认为 utf-8
            if (charset.encoding == 'windows-1252' || charset.encoding == 'windows-1251') {
                charset.encoding = 'utf-8';
            }
            //alert(charset.encoding);
            if (charset.encoding != 'utf-8' && charset.encoding != 'unicode' && !(/^utf/.test(charset.encoding)) && charset.encoding != 'ascii' && charset.encoding != 'unknow') {
                text = iconv.decode(text, charset.encoding);
            }
            lastInfo = text;
            buffer += text;
            var cutIndex = buffer.length - self.bufferSize;
            if (cutIndex < 0) cutIndex = 0;
            buffer = buffer.substr(cutIndex);
            self.call('change');
        });
    };

    //输出一行文本
    self.writeLine = function(text) {
        self.write((buffer === "" ? "" : "\n") + text);
    };

    self.error = function(text) {
        self.writeLine('[E] ' + text);
    };

    self.wran = function(text) {
        self.writeLine('[W] ' + text);
    };

    self.info = function(text) {
        self.writeLine('[I] ' + text);
    };

    self.log = function(text) {
        self.writeLine('[L] ' + text);
    };

    window.textor.console = self;

});