define(function (require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");

    /**
     * 底部面板
     */
    return app.view.create({
        template: module.resovleUri('self/templates/footer_panel.html')
    });
});