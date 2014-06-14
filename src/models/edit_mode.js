define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = exports;
    var utils = require("mokit/utils");

    /**
     * 取文件扩展名
     * @param  {String} name 文件名
     * @return {String}      扩展名
     */
    var getExtName = function(name) {
        if (utils.isNull(name)) return;
        var lastIndex = name.lastIndexOf('.');
        return name.substr(lastIndex + 1);
    };

    self.modes = {
        'js': 'javascript',
        'json': 'json',
        'coffee': 'coffee',
        'jade': 'jade',
        'htm': 'html',
        'html': 'html',
        'css': 'css',
        'less': 'less',
        'sass': 'sass',
        'xml': 'xml',
        'plist': 'xml',
        'haml': 'haml',
        'c': 'c_cpp',
        'cpp': 'c_cpp',
        'cs': 'csharp',
        'java': 'java',
        'jsp': 'jsp',
        'scala': 'scala',
        'php': 'php',
        'py': 'python',
        'rb': 'ruby',
        'ruby': 'ruby',
        'rhtml': 'rhtml',
        'sql': 'sql',
        'mysql': 'mysql',
        'md': 'markdown',
        'lua': 'lua',
        'go': 'golang',
        'groovy': 'groovy',
        'dart': 'dart',
        'haskell': 'haskell',
        'ada': 'ada',
        'd': 'd',
        'erlang': 'erlang',
        'lisp': 'lisp',
        'yml': 'yaml',
        'yaml': 'yaml',
        'svg': 'svg',
        'tcl': 'tcl',
        'ini': 'ini',
        'scheme': 'scheme',
        'sh': 'sh',
        'txt': 'plain_text',
        'text': 'plain_text'
    };

    /**
     * 取编辑器模式
     * @param  {String} name 文件名
     * @return {String}      模式名称
     */
    self.getMode = function(name) {
        var modes = self.modes;
        var extName = getExtName(name) || 'txt';
        return modes[extName] || modes['txt'];
    };

});