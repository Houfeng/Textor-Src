define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    var self = this;
    var console = require('./console');
    var child_process = require_node('child_process');
    var usrCfg = require('self/models/user_config').get();
    var utils = require('mokit/utils');
    var os = require_node('os');
    var platform = os.platform();
    var isWin = /^win/.test(platform);

    var envSpliter = isWin ? ';' : ':';

    //去重复
    var distinct = function(src) {
        var newList = [];
        var oldList = src.split(envSpliter);
        utils.each(oldList, function(i, item) {
            if (item && !utils.contains(newList, item)) {
                newList.push(item);
            }
        });
        var dest = newList.join(envSpliter);
        return dest;
    };

    //Textor 的用户环境变量，Textor 的用户变量优化及高于系统环境变量,Textor 变理将合并到 Process 变量上
    usrCfg.environment = usrCfg.environment || {};
    var user_env_path = usrCfg.environment.path;
    if (user_env_path) {
        user_env_path = utils.isArray(user_env_path) ? user_env_path.join(envSpliter) : user_env_path;
        process.env['PATH'] = user_env_path + envSpliter + process.env['PATH'];
        process.env['PATH'] = distinct(process.env['PATH']);
    }

    //alert(JSON.stringify(usrCfg));
    //alert(process.env['PATH']);
    //处理进程选项
    var handleOptions = function(options) {
        if (options.env) {
            //合并path
            if (options.env['PATH']) {
                //进程调用时的环境变量优先级高于 Textor 变量及系统变量，调用时变量仅在本次调用有效
                var temp_env_path = options.env['PATH'];
                temp_env_path = utils.isArray(temp_env_path) ? temp_env_path.join(envSpliter) : temp_env_path;
                options.env['PATH'] = temp_env_path + envSpliter + process.env['PATH'];
                options.env['PATH'] = distinct(options.env['PATH']);
            } else {
                options.env['PATH'] = process.env['PATH'];
            }
            //复制其它
            utils.each(process.env, function(key, value) {
                if (utils.isNull(options.env[key])) {
                    options.env[key] = usrCfg.environment[key] || process.env[key];
                }
            });
        } else {
            options.env = process.env;
        }
        //
        usrCfg.child_process = usrCfg.child_process || {};
        options.encoding = isWin ? 'windows-1252' : 'utf-8';
        options.encoding = usrCfg.child_process.encoding || options.encoding;
        options.maxBuffer = usrCfg.child_process.max_buffer || options.maxBuffer || (1024 * 1024 * 1024);
        return options;
    };

    return {
        env: process.env,
        spawn: function(cmd, args, options, io) {
            options = handleOptions(options || {});
            io = io || {};
            var process = child_process.spawn(cmd, args, options, io);
            process.buffer = io.buffer = {};
            // 捕获标准输出并将其打印到控制台
            process.stdout.on('data', function(data) {
                console.write(data);
                process.buffer.out = data;
                if (io.out) io.out(data);
            });
            // 捕获标准错误输出并将其打印到控制台
            process.stderr.on('data', function(data) {
                console.write(data);
                process.buffer.error = data;
                if (io.error) io.error(data);
            });
            // 注册子进程关闭事件
            process.on('exit', function(code, signal) {
                process.buffer.exitCode = code;
                if (io.exit) io.exit(code);
                //console.write('"' + cmd + '" exit, code "' + code + '".');
            });
            return process;
        },
        exec: function(cmd, options, callback, io) {
            options = handleOptions(options || {});
            io = io || {};
            var sysCmd = child_process.exec(cmd, options, callback);
            sysCmd.buffer = io.buffer = {};
            // 捕获标准输出并将其打印到控制台
            sysCmd.stdout.on('data', function(data) {
                console.write(data);
                sysCmd.buffer.out = data;
                if (io.out) io.out(data);
            });
            // 捕获标准错误输出并将其打印到控制台
            sysCmd.stderr.on('data', function(data) {
                console.write(data);
                sysCmd.buffer.error = data;
                if (io.error) io.error(data);
            });
            // 注册子进程关闭事件
            sysCmd.on('exit', function(code, signal) {
                sysCmd.buffer.exitCode = code;
                if (io.exit) io.exit(code);
                //console.write('"' + cmd + '" exit, code "' + code + '".\r\n');
            });
            return sysCmd;
        }
    };
});