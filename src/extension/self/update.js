define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;
    var utils = require('mokit/utils');
    var ajax = require('mokit/ajax');
    var store = require('mokit/store');
    var config = require('mokit/ems-json!self/package.json');
    var lang = require('mokit/language');

    var updateUrl = config.site + "/update.json";
    var releaseNoteUrl = config.site + "/release-notes.html";

    //提示更新
    function alertUpdate(context, info) {
        context.view.alert.show(context, {
            title: lang.update,
            text: lang.find_new_version.replace('{0}', info.version),
            buttons: [lang.no_update, lang.release_note, lang.update_now],
            callback: function(rs) {
                if (rs.state == 2) {
                    context.shell.openExternal(config.site);
                } else if (rs.state == 1) {
                    context.shell.openExternal(releaseNoteUrl);
                    //如果用户查看更新日志，为了保存提示不关闭，采用再弹出的方式
                    alertUpdate(context, info);
                }
            }
        });
    };

    //检查更新
    function checkUpdate(context) {
        utils.async(function() {
            context.network.check(function(_state) {
                if (!_state) return;
                require('mokit/ems-json!' + updateUrl, function(info) {
                    if (utils.isNull(info) || config.version === info.version) {
                        return;
                    }
                    alertUpdate(context, info);
                });
            });
        }, 500);
    }

    self.onRender = function(context) {
        lang = lang.current();
        var command = context.command;
        var cmdKey = context.cmdKey;
        checkUpdate(context);
        command.add([{
            name: 'sys:update',
            exec: function() {
                checkUpdate(context);
            }
        }]);
    };

});