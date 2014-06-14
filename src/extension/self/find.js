define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;

    self.onReady = function(context) {
        context.footer.items.push({
            'id': 'find',
            'text': context.lang.find.toUpperCase(),
            'uri': module.resovleUri('./find_ui/find')
        });
        var command = context.command;
        var cmdKey = context.cmdKey;
        command.add([{
            name: 'edit:find',
            key: cmdKey + '+f',
            exec: function() {
                context.view.openFooter(context, 'find');
            }
        }]);
    };
});