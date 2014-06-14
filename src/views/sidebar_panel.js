define(function (require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");

    /**
     * 左侧栏面板
     */
    return app.view.create({
        template: module.resovleUri('../templates/sidebar_panel.html')
    });
});