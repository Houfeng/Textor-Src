define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var self = exports;
    //--
    var $ = require('mokit/jquery');
    var utils = require('mokit/utils');
    var path = require_node("path");
    var store = require('mokit/store');
    var gui = require_node('nw.gui', null);
    //--
    var dilogElements = {
        'file': $('<input type="file" class=".ui-file-dialog-hidden" />'),
        'folder': $('<input type="file" class=".ui-file-dialog-hidden" nwdirectory />'),
        'save': $('<input type="file" class=".ui-file-dialog-hidden" nwsaveas />')
    };

    //很有用的一个方法，暂时没有用到
    function clickInput(element) {
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click');
        element.dispatchEvent(event);
    };

    function setWorkFolder(path) {
        store.local.set('textor:workfolder', path);
    };

    function getWorkFolder() {
        return store.local.get('textor:workfolder') || gui.App.dataPath;
    };

    self.show = function(context, option) {
        process.nextTick(function() {
            option = option || {};
            option.type = option.type || 'file';
            option.workFolder = option.workFolder || getWorkFolder();
            var element = dilogElements[option.type];
            if (option.workFolder) {
                setWorkFolder(option.workFolder);
                element.attr('nwworkingdir', option.workFolder);
            }
            if (option.accept) {
                element.attr('accept', option.accept);
            }
            if (option.multiple) {
                element.attr('multiple', 'multiple');
            }
            if (option.defaultName) {
                element.attr('nwsaveas', option.defaultName);
            }
            element.one('change', function() {
                var val = element.val();
                if (val != '') {
                    if (option.callback) {
                        option.callback(val);
                    }
                    setWorkFolder(path.dirname(val));
                    element.val('');
                }
            }).click();
        });
    };
});