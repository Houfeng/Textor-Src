//系统内置核心功能
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;
    var sysInfo = require('mokit/ems-json!self/package.json');

    self.editorMenu = require('./editor_menu');
    self.finderMenu = require('./finder_menu');
    self.command = require('./command');
    self.update = require('./update');
    self.find = require('./find');
    self.extmgr = require('./extmgr');
    self.fontSize = require('./font_size');
    self.mode = require('./mode');
    self.help = require('./help');


    self.onReady = function(context) {
        context.sysInfo = sysInfo;
        //
        self.editorMenu.context = context;
        self.finderMenu.context = context;
        self.command.context = context;
        self.update.context = context;
        self.find.context = context;
        self.extmgr.context = context;
        self.fontSize.context = context;
        self.mode.context = context;
        self.help.context = context;
        //--
        self.editorMenu.onReady(context);
        self.finderMenu.onReady(context);
        self.command.onReady(context);
        self.find.onReady(context);
        self.extmgr.onReady(context);
        self.fontSize.onReady(context);
        self.mode.onReady(context);
        self.help.onReady(context);
    };

    self.onRender = function(context) {
        self.update.onRender(context);
        self.help.onRender(context);
    };

    self.onCreateContextMenu = function(contextMenu) {
        self.editorMenu.onCreateContextMenu(contextMenu);
        self.finderMenu.onCreateContextMenu(contextMenu);
    };

    self.onAllExtensionReady = function() {
        self.command.onAllExtensionReady();
    };

});