define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require('mokit/app');
    var SplashView = require('../views/splash');
    var ExtensionManager = require('../models/extension_manager');
    var utils = require('mokit/utils')

    /**
     * 启动界面控制器
     */
    return app.controller.create({
        /**
         * 默认 action
         */
        index: function(context) {
            var self = this;
            self.setView(new SplashView({
                model: {}
            }));
        }
    });
});