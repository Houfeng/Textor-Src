define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var js = require('./javascript');
    var css = require('./css');
    var utils = require('mokit/utils');

    var words = {
        regexp: (/^[a-zA-Z\_\-]/),
        direct: [
            "doctype",
            "a",
            "abbr",
            "acronym",
            "address",
            "applet",
            "area",
            "article",
            "aside",
            "audio",
            "accept",
            "action",
            "align",
            "border",
            "b",
            "base",
            "basefont",
            "bdo",
            "big",
            "blockquote",
            "body",
            "br",
            "button",
            "canvas",
            "caption",
            "center",
            "cite",
            "code",
            "cols",
            "colgroup",
            "command",
            "cellpadding",
            "cellspacing",
            "colspan",
            "datalist",
            "data",
            "dd",
            "del",
            "details",
            "dfn",
            "dir",
            "div",
            "dl",
            "dt",
            "date",
            "datetime",
            "em",
            "embed",
            "fieldset",
            "figcaption",
            "figure",
            "font",
            "footer",
            "form",
            "frame",
            "frameset",
            "frameborder",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "head",
            "header",
            "hgroup",
            "hgroup",
            "html",
            "height",
            "i",
            "iframe",
            "img",
            "input",
            "ins",
            "keygen",
            "isindex",
            "kbd",
            "label",
            "legend",
            "li",
            "link",
            "lang",
            "language",
            "multiple",
            "map",
            "mark",
            "menu",
            "meta",
            "meter",
            "method",
            "nav",
            "noframes",
            "noscript",
            "object",
            "ol",
            "optgroup",
            "option",
            "output",
            "p",
            "param",
            "pre",
            "progress",
            "placeholder",
            "q",
            "rp",
            "rt",
            "ruby",
            "readonly",
            "s",
            "samp",
            "script",
            "section",
            "select",
            "small",
            "source",
            "span",
            "strike",
            "strong",
            "style",
            "sub",
            "summary",
            "sup",
            "type",
            "text",
            "table",
            "tbody",
            "td",
            "textarea",
            "tfoot",
            "th",
            "thead",
            "time",
            "title",
            "tr",
            "tt",
            "u",
            "ul",
            "var",
            "video",
            "xmp",
            "onabort",
            "onbeforeonload",
            "onblur",
            "onchange",
            "onclick",
            "oncontextmenu",
            "ondblclick",
            "ondrag",
            "ondragend",
            "ondragenter",
            "ondragleave",
            "ondragover",
            "ondragstart",
            "ondrop",
            "onerror",
            "onfocus",
            "onkeydown",
            "onkeypress",
            "onkeyup",
            "onload",
            "onmessage",
            "onmousedown",
            "onmousemove",
            "onmouseover",
            "onmouseout",
            "onmouseup",
            "onmousewheel",
            "onreset",
            "onresize",
            "onscroll",
            "onselect",
            "onsubmit",
            "onunload",
            "acceskey",
            "contentextmenu",
            "dir",
            "draggable",
            "id",
            "irrelevant",
            "lang",
            "ref",
            "rows",
            "registrationmark",
            "style",
            "submit",
            "tabindex",
            "template",
            "title",
            "contenteditable",
            "contextmenu",
            "draggable",
            "irrelevant",
            "ref",
            "registrationmark",
            "template",
            "value",
            "width",
            "wbr"
        ],
        member: {}
    };

    utils.each(css.direct, function(i, word) {
        words.direct.push(word);
    });

    //js 的字表里已有 css 的词表
    utils.each(js.direct, function(i, word) {
        words.direct.push(word);
    });

    utils.each(js.member, function(key, list) {
        words.member[key] = list;
    });

    return words;

});