define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");
    var utils = require("mokit/utils");
    var gui = require('self/utils/menu');
    var lang = require('mokit/language').current();
    var console = require('self/models/console');

    var contextMenu = new gui.Menu();
    contextMenu.append(new gui.MenuItem({
        label: lang.clear_console,
        click: function() {
            console.clear();
        }
    }));

    /**
     * 控制台
     */
    return app.view.create({
        template: module.resovleUri('../templates/console.html'),
        el: {
            box: 'textarea'
        },
        onRender: function(context) {
            var self = this;
            var console = self.model.console;
            console.change.clear();
            console.change(function() {
                self.render();
            });
            //向下滚动
            self.el.box.prop('scrollTop', self.el.box.prop('scrollHeight'));
            utils.async(function() {
                self.el.box.prop('scrollTop', self.el.box.prop('scrollHeight'));
            });
        },
        /**
         * 控制台右健
         */
        onContextMenu: function(context) {
            //alert(0);
            var self = this;
            contextMenu.popup(context.pageX, context.pageY);
        }
    });
});