define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");
    var grid = require("mokit/grid");
    var $ = require('mokit/jquery');

    /**
     * 欢迎界面
     */
    return app.view.create({
        template: module.resovleUri('../templates/tab.html'),
        onRender: function(context) {
            var self = this;
            grid.use(self.ui);
        },
        el: {
            "tabItems": 'ul li',
            "tabSelectedItem": 'ul li.selected'
        },
        resize: function(context) {
            console.log('aaa');
        },
        next: function(context) {
            var self = this;
            var maxIndex = self.el.tabItems.length - 1;
            if (maxIndex < 1) return;
            var index = self.el.tabItems.index(self.el.tabSelectedItem[0]) + 1;
            if (index > maxIndex) index = 0;
            if (index < 0) index = maxIndex;
            $(self.el.tabItems[index]).click();
        },
        pre: function(context) {
            var self = this;
            var maxIndex = self.el.tabItems.length - 1;
            if (maxIndex < 1) return;
            var index = self.el.tabItems.index(self.el.tabSelectedItem[0]) - 1;
            if (index > maxIndex) index = 0;
            if (index < 0) index = maxIndex;
            $(self.el.tabItems[index]).click();
        }
    });
});