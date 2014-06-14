define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var self = exports;
    var _domain = 'houfeng.net';
    var _state = null;

    self.setUrl = function(url) {
        _domain = url.replace('http://', '').replace('https://', '');
    };

    self.check = function(callback) {
        process.nextTick(function() {
            if (_state !== null) {
                if (callback) callback(_state);
                return;
            }
            require_node('dns').resolve(_domain, function(err) {
                _state = err ? false : true;
                if (callback) callback(_state);
            });
        });
    };
});