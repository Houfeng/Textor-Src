"use strict";
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    require("./autocomplete.css");
    var $ = require('mokit/jquery');
    var utils = require('mokit/utils');
    var console = require('self/models/console');
    var tp = require('mokit/tp');
    var tplContent = require("mokit/ems-text!./autocomplete.html");
    var tpl = tp.compile(tplContent);
    var $doc = $(document);

    //创建一个自动提示对象实例
    function AutoComplete(option) {
        var self = this;
        self.setOption(option);
        //autocomplete的类型，分为普通输入，和点语法出现的autocomplete list。
        self.searchType = 'normal';
        //创建对话框
        self.createDialog();
        //在 paste 时隐藏提示框
        self.editor.on("paste", function(event) {
            return self.onPaste(event);
        });
        //在输入内容改变时
        self.editor.on('change', function(event) {
            return self.onChange(event);
        });
        //处理回车及上下选择
        self.editor.commands.on("exec", function(event) {
            return self.onExec(event);
        });
        //处理已输入 word
        utils.async(function() {
            self.inputWords = self.getInputWords();
        }, 500);
    }

    AutoComplete.prototype.setOption = function(option) {
        var self = this;
        self.option = option || self.option || {};
        //通过 clone 使每一个编辑器提示列表独立 
        self.words = self.option.words || self.words || {};
        self.words.direct = self.words.direct || [];
        self.words.member = self.words.member || [];
        self.words.regexp = self.words.regexp || (/[a-zA-Z0-9\_\$]/);
        self.showNumber = self.option.showNumber || self.showNumber || 20;
        self.holder = $(document.body);
        self.editor = self.option.editor || self.editor;
        self.shiftLeft = self.option.shiftLeft || self.shiftLeft || 0;
        self.shiftTop = self.option.shiftTop || self.shiftTop || 0;
    };

    AutoComplete.prototype.removeWordLeft = function() {
        var self = this;
        //默认的 removeWordLeft 只能移除“字母、数字、下划线” 单词
        //self.editor.removeWordLeft(); 
        self.editor.selection.selectLeft();
        var _char = self.editor.getSelectedText();
        if (_char && self.words.regexp.test(_char)) {
            self.editor.remove();
            self.removeWordLeft();
        } else {
            self.editor.selection.selectRight();
        }
    };

    //创建提示框
    AutoComplete.prototype.createDialog = function() {
        var self = this;
        var editor = self.editor;
        self.dialog = $('.autocomplete');
        if (!self.dialog || self.dialog.length < 1) {
            self.dialog = $("<div class='autocomplete'></div>").appendTo(self.holder);
        }
        self.dialog.mousedown(function(e) {
            var target = e.target;
            var tagName = target.tagName.toLowerCase();
            if (tagName == "strong") {
                target = target.parentNode;
            }
            self.selectedItem(target);
            var text = $.trim($(target).text());
            if (self.searchType != "dot") {
                //editor.removeWordLeft();
                self.removeWordLeft();
            }
            self.editor.insert(text);
            self.dialog.hide();
            self.editor.autocompleteState = false; //自动提示框已隐藏 
            e.preventDefault();
            return false;
        }).mouseover(function(e) {
            //暂不使用鼠标选择
            /*
            var target = e.target;
            var tagName = target.tagName.toLowerCase();
            if (tagName === "strong") {
                target = target.parentNode;
            }
            self.selectedItem(target);
            */
        }).mousemove(function(e) {
            //暂不自动滚动
            /*
            var $this = $(this),
                tPos = $this.offset(),
                mousePosY = e.pageY - tPos.top,
                scrollTop = 0;
            if (mousePosY >= 10) {
                scrollTop = (self.dialog.find("ul").height() * mousePosY) / self.dialog.height();
            } else if (mousePosY < 10) {
                scrollTop = 0;
            }
            self.dialog.scrollTop(scrollTop);
            */
        });
        $doc.mousedown(function(e) {
            self.dialog.hide();
            self.editor.autocompleteState = false; //自动提示框已隐藏 
        });
    };

    AutoComplete.prototype.onChange = function(e) {
        var self = this;
        var position = self.editor.getCursorPosition();
        var token = self.editor.session.getTokenAt(position.row, position.column);
        var text = e.data.text;
        var action = e.data.action;
        var prevTokenValue;
        //之前的 if 条件 !token || !token.value || !self.editor.getValue() || token.type.indexOf("comment") !== -1 || token.type === "string"
        if (!token || !token.value) {
            self.dialog.hide();
            self.editor.autocompleteState = false; //自动提示框已隐藏 
            return;
        }
        var tokenValue = token.value;
        self.searchType = "normal";
        //如果输入内容符合 token 的规则
        if (!self.words.regexp.test(text)) {
            if (action === "insertText") {
                if (text === ".") {
                    //console.log("houfeng1");
                    prevTokenValue = self.editor.session.getTokenAt(position.row, position.column - 1).value;
                } else {
                    //console.log("houfeng2");
                    self.dialog.hide();
                    self.editor.autocompleteState = false; //自动提示框已隐藏 
                    return;
                }
            }
        } else { //如果输入内容不符合 token 的规则
            if (action === "removeText") {
                if (tokenValue === ".") {
                    prevTokenValue = self.editor.session.getTokenAt(position.row, position.column - 1).value;
                }
            } else {
                //console.log("houfeng3");
            }
        }
        //console.log(tokenValue + "," + text + "," + prevTokenValue + "," + action);
        //如果是点语法中获取到了前一个token的内容,
        //则判断该token.value下是否有自有属性和方法
        if (prevTokenValue) {
            self.bindList("dot", prevTokenValue, action);
            self.searchType = "dot";
            return;
        }
        if (tokenValue.length === 1 && !self.words.regexp.test(tokenValue)) {
            if (action === "insertText") {
                tokenValue = text;
            } else if (action === "removeText") {
                self.dialog.hide();
                self.editor.autocompleteState = false; //自动提示框已隐藏 
                return;
            }
        }
        self.bindList("normal", tokenValue, action);
    };

    AutoComplete.prototype.onExec = function(e) {
        var self = this;
        if (e.command.bindKey) {
            var bindKey = e.command.bindKey.mac || e.command.bindKey.win;
            var method = "navigate";
            var direction;
            //if((/^Delete/).test(bindKey)){ return; }
            if ((/^((Left)|(Right))/).test(bindKey)) {
                self.dialog.hide();
                self.editor.autocompleteState = false; //自动提示框已隐藏 
                return true;
            } else if ((/^((Down)|(Up))/).test(bindKey)) {
                direction = RegExp.$1;
                method = (direction == "Down") ? "next" : "prev";
                if (self.dialog.css("display") === "block") {
                    var $selectedItem = self.dialog.find("li.selected");
                    var $elem = $selectedItem[method]();
                    if ($elem.size()) {
                        self.selectedItem($elem);
                        //处理dialog滚动的逻辑
                        var dialogHeight = self.dialog.outerHeight();
                        var dialogScrollTop = self.dialog.scrollTop();
                        var itemHeight = $elem.outerHeight();
                        if (direction == "Down") {
                            if (itemHeight * (parseInt($elem.data("index") + 1)) > (dialogHeight + dialogScrollTop)) {
                                self.dialog.scrollTop(dialogScrollTop + itemHeight);
                            }
                        } else {
                            if (itemHeight * (parseInt($elem.data("index"))) < (dialogScrollTop)) {
                                self.dialog.scrollTop(dialogScrollTop - itemHeight);
                            }
                        }
                    }
                    e.preventDefault();
                }
            }
        }

        //判断是否"输入"的是"回车"或是按下了"tab";
        if ((e.args == "\n" && e.command.name === "insertstring") || e.command.name === "indent") {
            //console.log('输入:'+e.args);
            if (self.dialog.css("display") === "block") {
                var text = $.trim(self.dialog.find("li.selected").text());
                if (!utils.isNull(text) && text !== '') {
                    if (self.searchType != "dot") {
                        //self.editor.removeWordLeft();
                        self.removeWordLeft();
                    }
                    self.editor.insert(text);
                    self.dialog.hide();
                    self.editor.autocompleteState = false; //自动提示框已隐藏 
                    e.preventDefault();
                    return false;
                }
            }
            //在回车时处理用户输入的单词
            if (e.args == "\n") {
                self.words.input = self.getInputWords();
            }
        }
        //console.log("editor exec: " + e.command.name);
    };

    AutoComplete.prototype.onPaste = function(e) {
        var self = this;
        self.dialog.hide();
        self.editor.autocompleteState = false; //自动提示框已隐藏 
        self.words.input = self.getInputWords();
    };

    AutoComplete.prototype.getInputWords = function(e) {
        var self = this;
        var words = [];
        /*
        $(".ace_identifier,.ace_tag,.ace_attribute-name,.ace_variable,.ace_support").each(function(index, item) {
            words.push($(item).text().replace(':', '').replace('.', '').replace(';', '').replace('#', ''));
        });
        */
        var lineLength = self.editor.session.getLength();
        for (var i = 0; i < lineLength; i++) {
            var tokens = self.editor.session.getTokens(i);
            utils.each(tokens, function(j, token) {
                var value = utils.trim((token ? token.value : '') || '');
                if (value && self.words.regexp.test(value) && !utils.contains(words, value)) {
                    words.push(value);
                }
            });
        }
        return words;
    };

    //查找要提示的内容
    AutoComplete.prototype.search = function(type, sugString) {
        var self = this;
        if (utils.isNull(sugString)) return;
        sugString = $.trim(sugString.replace(':', '').replace('.', '').replace(';', '').replace('#', ''));
        if (!self.words.regexp.test(sugString)) {
            return;
        }
        var rtn = [],
            reg;
        try {
            reg = new RegExp("^" + sugString, "i");
        } catch (e) {
            return;
        }
        //
        if (type == "normal") {
            //处理直接的单词
            utils.each(self.words.direct, function(index, item) {
                if (rtn.length >= self.showNumber) return true;
                if (item && item.length > 1 && reg.test(item) && sugString != item && !utils.contains(rtn, item)) {
                    //rtn.push(item.replace(sugString,"<b>" + sugString + "</b>"));
                    rtn.push(item);
                }
            });
            //处理输入过的词
            utils.each(self.inputWords, function(index, item) {
                if (rtn.length >= self.showNumber) return true;
                if (item && item.length > 1 && reg.test(item) && sugString != item && !utils.contains(rtn, item)) {
                    //rtn.push(item.replace(sugString,"<b>" + sugString + "</b>"));
                    rtn.push(item);
                }
            });
        } else if (type == "dot") {
            var dic = self.words.member[sugString];
            if (utils.isNull(dic)) return;
            //处理对象成员
            utils.each(dic, function(index, item) {
                if (rtn.length >= self.showNumber) return true;
                if (item && item.length > 1 && !utils.contains(rtn, item)) {
                    rtn.push(item);
                }
            });
        }
        //
        return rtn;
    };

    //这里可能需要根据字体大小设置，相应的调整下left的距离
    AutoComplete.prototype.updatePosition = function(action) {
        var self = this;
        var editor = self.editor;
        var editorContainer = $(editor.container);
        var textarea = editorContainer.find("textarea");
        var textareaOffset = textarea.offset();
        var textareaWidth = textarea.outerWidth();
        var textareaHeight = textarea.outerHeight();
        // (action == "removeText") ? -2 : 5;
        var left = textareaOffset.left + ((action == "removeText") ? -textareaWidth : textareaWidth) + 2;
        var top = textareaOffset.top + textareaHeight + 2;
        // 边界处理开始
        var holderWidth = self.holder.outerWidth();
        var holderHeight = self.holder.outerHeight();
        var dialogWidth = self.dialog.outerWidth() + 5;
        var dialogHeight = self.dialog.outerHeight();
        //console.log(dialogWidth);
        if (left >= holderWidth - dialogWidth) {
            left = holderWidth - dialogWidth;
        }
        if (top >= holderHeight - dialogHeight) {
            top = top - dialogHeight - textareaHeight - 5;
        }
        // 边界处理结束
        //设置dialog位置
        self.dialog.css({
            left: left + "px",
            top: top + "px"
        });
    };

    AutoComplete.prototype.bindList = function(type, value, action) {
        var self = this;
        value = utils.trim(value);
        if (!self.words.regexp.test(value)) {
            self.dialog.hide();
            self.editor.autocompleteState = false; //自动提示框已隐藏 
            return;
        }
        var words = self.search(type, value);
        var htmlBuffer = tpl(words);
        if (htmlBuffer) {
            self.dialog.html(htmlBuffer).show().scrollTop(0);
            self.updatePosition(action);
            self.editor.autocompleteState = true; //自动提示框已显示 
        } else {
            self.dialog.hide();
            self.editor.autocompleteState = false; //自动提示框已隐藏 
        }
    };

    AutoComplete.prototype.selectedItem = function(elem) {
        var self = this;
        self.dialog.find("li").each(function(index, item) {
            $(item).removeClass('selected');
        });
        $(elem).addClass('selected');
    };

    return AutoComplete;

});