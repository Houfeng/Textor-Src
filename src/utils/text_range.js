define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    function Range(element) {
        this.element = element;
        if (!element) {
            throw "Element Null";
        }
    };

    /*
    获取焦点
    */
    Range.prototype.focus = function() {
        var self = this;
        self.element.focus();
    };

    /*
    丢失焦点
    */
    Range.prototype.blur = function() {
        var self = this;
        self.element.blur();
    };

    /*
    选指定区间的文本
    */
    Range.prototype.setSelection = function(begin, end) {
        var self = this;
        if (isNaN(begin)) {
            self.setSelectionByText(begin);
            return;
        }
        if (document.selection) {
            var range = self.element.createTextRange();
            range.moveEnd('character', -self.element.value.length);
            range.moveEnd('character', end);
            range.moveStart('character', begin);
            range.select();
        } else {
            /*
            setSelectionRange 和 selectionStart、selectionEnd 的效果一样
            */
            self.element.setSelectionRange(begin, end);
            self.focus();
        }
    };

    /*
    选定指定文本
    */
    Range.prototype.setSelectionByText = function(txt) {
        var self = this;
        var begin = self.element.value.indexOf(txt);
        if (begin > -1) {
            var end = begin + txt.length;
            self.setSelection(begin, end);
        }
    };

    /*
    获取选中区域
    */
    Range.prototype.getSelection = function() {
        var self = this;
        var self = this;
        var selection = {};
        if (document.selection) {
            self.focus();
            var documentSelection = document.selection;
            var range = documentSelection.createRange();
            var stored_range = range.duplicate();
            stored_range.moveToElementText(self.element);
            stored_range.setEndPoint("EndToEnd", range);
            selection.begin = stored_range.text.length - range.text.length;
            selection.end = self.element.selectionStart + range.text.length;
        } else {
            selection.begin = self.element.selectionStart;
            selection.end = self.element.selectionEnd;
        }
        selection.text = self.element.value.substring(selection.begin, selection.end);
        return selection;
    };

    /*
     * 获取光标位置
     */
    Range.prototype.getPosition = function() {
        var self = this;
        return self.getSelection().begin;
    };

    /*
     * 设置光标位置
     */
    Range.prototype.setPosition = function(pos) {
        var self = this;
        self.setSelection(pos, pos);
    };

    Range.create = function(element) {
        return new Range(element);
    };

    module.exports = Range;
});