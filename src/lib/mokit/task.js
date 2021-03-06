/**
 * Task 模块，提供基础的任务功能;
 * @class Task
 * @static
 * @module mokit
 */
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    "use strict";

    var $class = require("class");
    var utils = require("utils");

    var Task = $class.create({
        "taskList": [],
        "taskCount": 0,
        "initialize": function(fns) {
            var self = this;
            self.addMult(fns);
        },
        "addMult": function(fns) {
            var self = this;
            utils.each(fns, function(key, fn) {
                self.addOne(key, fn);
            });
            return self;
        },
        "addOne": function(name, fn) {
            var self = this;
            if (!name && !fn) return this;
            if (name && !fn) {
                fn = name;
                name = self.taskList.length;
            }
            self.taskList.push({
                "name": name,
                "func": fn
            });
            self.taskCount = self.taskList.length;
            self.result.length = self.taskCount;
            return self;
        },
        /**
         * 向当前对象添加任务 function
         * @method add
         * @param function 或 function 数组，function 可以接收一个 done 参数，用以通知当前任务完成
         * @return {Task} 当前队列实例
         * @static
         */
        "add": function(a, b) {
            var self = this;
            if (utils.isString(a) || utils.isFunction(a)) {
                return self.addOne(a, b);
            } else {
                return self.addMult(a);
            }
        },
        "reset": function() {
            var self = this;
            self.taskCount = self.taskList.length;
            self.result.length = self.taskCount;
            self.executed = false;
        },
        "result": {},
        "executed": false,
        "execute": function(done, isSeq) {
            var self = this;
            if (self.taskCount < 1 && done && !self.executed) {
                done(self.result);
                self.executed = true;
                return;
            }
            if (self.taskList && self.taskList.length > 0) {
                var task = self.taskList.shift();
                if (utils.isNull(task) || utils.isNull(task.name) || utils.isNull(task.func)) {
                    self.taskCount--;
                    return;
                };
                task.func(function(rs) {
                    self.result[task.name] = rs;
                    self.taskCount--;
                    if (self.once) self.once(task.name, rs);
                    if (self.taskCount < 1 && done) {
                        done(self.result);
                        self.executed = true;
                        return;
                    }
                    if (!self.executed && isSeq) {
                        self.execute(done, isSeq);
                    }
                });
                if (!self.executed && !isSeq) {
                    self.execute(done, isSeq);
                }
            }
            return self;
        },
        "one": function(done) {
            this.once = done;
            return this;
        },
        /**
         * 顺序执行当前对列
         * @method seq
         * @param 完成时的回调
         * @return {Task} 当前队列实例
         * @static
         */
        "seq": function(done) {
            return this.execute(done, true);
        },
        /**
         * 并行执行当前对列
         * @method end
         * @param 完成时的回调
         * @return {Task} 当前队列实例
         * @static
         */
        "end": function(done, isSeq) {
            return this.execute(done, isSeq);
        }
    });

    /**
     * 创建一个任务队列
     * @method create
     * @param 任务 function 或 function 数组，可以省略参数创建一个空队列，function 可以接收一个 done 参数，用以通知当前任务完成。
     * @return {Task} 新队列实例
     * @static
     */
    exports.create = function(tasks) {
        return new Task(tasks);
    };

});