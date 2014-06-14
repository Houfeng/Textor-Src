define(function (require,exports,module) {
    "require:nomunge,exports:nomunge,module:nomunge";
	var self = exports;

	var gui = require('self/utils/menu');
	var ExtensionManager = require('self/models/extension_manager');
	var $event = require('mokit/event');

	var editor = new gui.Menu();
	var finder = new gui.Menu();

	self.editor = editor;
	self.finder = finder;

	self.editor.onPopup = $event.create(self.editor,'onpopup');
	self.finder.onPopup = $event.create(self.finder,'onpopup');
	
});