define(function (require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");

    /**
     * 侧边样主菜单
     */
    return app.view.create({
        template: module.resovleUri('../templates/sidebar_menu.html'),
        toggleSidebar:function(context,name){
        	var self=this;
        	self.root.toggleSidebar(context,name,function(){});
            //self.render();
        }
    });
});