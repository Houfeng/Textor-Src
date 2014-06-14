define(function (require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var app = require("mokit/app");
    var utils = require("mokit/utils");

    /**
     * 欢迎界面
     */
    return app.view.create({
        template: module.resovleUri('../templates/command_list.html'),
        onInit:function(context){
            var self=this;
        },
        onRender:function(context){
            var self=this;
        },
        highlight:function(context,cmd,input){
        	return cmd.replace(input,"<span class='input'>"+input+"</span>")
        }
    });
});