define(function (require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");

    /**
     * 欢迎界面
     */
    return app.view.create({
        template: module.resovleUri('../templates/state.html'),
        onRender:function(context){
        	var self=this;
            return;
        	self.root.editor.on('changeCursor', function(e) {
        		self.changeCursor(context,e);
			});
        },
        changeCursor:function(context,e){
        	var self=this;
        	//var cursor=self.root.editor.getCursor();
        	//console.log(JSON.stringify(cursor));
        }
    });
});