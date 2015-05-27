define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;

    var gui = require_node('nw.gui');
    var ExtensionManager = require('self/models/extension_manager');
    var $event = require('mokit/event');

    self.Menu = gui.Menu;
    self.MenuItem = gui.MenuItem;

    self.editor = new self.Menu();
    self.finder = new self.Menu();

    $event.use(self.editor);
    $event.use(self.finder);

    var mb = new gui.Menu({
        type: "menubar"
    });
    if(mb && mb.createMacBuiltin){
        mb.createMacBuiltin("Textor", {
            hideWindow: true
        });
        gui.Window.get().menu = mb;
    }

});