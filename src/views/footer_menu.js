define(function (require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");

    /**
     * 底部菜单
     */
    return app.view.create({
        template: module.resovleUri('self/templates/footer_menu.html'),
        toggleFooter:function(context,name){
        	var self=this;
        	self.root.toggleFooter(context,name,function(){});
            //self.render();
        },
        openFooter:function(context,name){
            var self = this;
            self.root.openFooter(context,name,function(){});
        },
        closeFooter:function(context,name){
            var self = this;
            self.root.closeFooter(context,name,function(){});
        }
    });
});