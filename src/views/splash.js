define(function (require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");

    /**
     * 欢迎界面
     */
    return app.view.create({
        template: module.resovleUri('../templates/splash.html')
    });
});