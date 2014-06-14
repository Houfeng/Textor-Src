define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";

    var $ = require('mokit/jquery');
    var utils = require('mokit/utils');
    var gui = require_node('nw.gui');
    var win = gui.Window.get();
    var console = require('self/models/console');

    var doc = $(document);
    var holder = $(document.body);

    function Menu() {
        var menu = this;
        menu.items = [];
        menu.append = function(menuItem) {
            menuItem.menu = menu;
            menu.items.push(menuItem);
        };
        menu.items.append = menu.append;
        menu.render = function() {
            menu.ui = $('<ul class="menu"></ul>');
            utils.each(menu.items, function(i, item) {
                item.root = menu.root;
                menu.ui.append(item.render());
            });
            return menu.ui;
        };
        menu.popup = function(x, y) {
            menu.root = menu;
            if (menu.ui) menu.ui.remove();
            menu.render();
            holder.append(menu.ui);
            var holderWidth = holder.outerWidth();
            var menuWidth = menu.ui.outerWidth();
            var holderHeight = holder.outerHeight();
            var menuHeight = menu.ui.outerHeight();
            if (holderWidth - x < menuWidth) {
                x = x - menuWidth;
            }
            if (holderHeight - y < menuHeight) {
                y = y - menuHeight;
            }
            if (y < 2) y = 2; //防止菜单上部出窗口
            menu.ui.css('left', x).css('top', y);
            menu.show();
            win.focus();
        };
        menu.show = function() {
            if (menu.ui) {
                doc.on('mousedown', menu.hide);
                menu.ui.show();
            }
        };
        menu.hide = function() {
            if (menu.ui) {
                doc.off('mousedown', menu.hide);
                menu.ui.hide();
            }
        };
    };

    function MenuItem(option) {
        var item = this;
        option = option || {};
        item.label = option.label || 'Menu Item';
        item.submenu = option.submenu;
        item.click = option.click;
        item.type = option.type || 'item';
        item.icon = option.icon || '';
        item.tooltip = option.tooltip || '';
        item.checked = option.checked;
        item.enabled = utils.isNull(option.enabled) ? true : option.enabled;
        item.render = function() {
            var uiBuffer = '<li class="' + item.type + ' ' + (item.enabled ? '' : 'disabled') + '" title="' + item.tooltip + '">';
            uiBuffer += '<i class="icon ' + item.icon + '"></i><lable>' + item.label + '</lable></li>';
            item.ui = $(uiBuffer);
            if (item.type != 'separator' && item.enabled) {
                item.ui.on('mousedown', function() {
                    return false;
                });
                item.ui.on('click', function(event) {
                    item.root.hide();
                    if (item.click && item.enabled) {
                        utils.async(function() {
                            item.click(event);
                        });
                    }
                    return false;
                });
            }
            if (item.submenu) {
                item.submenu.root = item.root;
                item.submenu.parent = item.menu;
                item.ui.append(item.submenu.render());
                item.ui.append('<i class="arrow icon-caret-right"></i>');
                item.ui.hover(function() {
                    if (item.enabled) {
                        item.submenu.show();
                        var holderWidth = holder.outerWidth();
                        var menuWidth = item.submenu.ui.outerWidth();
                        var holderHeight = holder.outerHeight();
                        var menuHeight = item.submenu.ui.outerHeight();
                        var offset = item.submenu.ui.offset();
                        //console.log(offset.top);
                        if ((offset.top + menuHeight) > holderHeight) {
                            item.submenu.ui.css('top', 'auto');
                            item.submenu.ui.css('bottom', 0);
                        }
                        if ((offset.left + menuWidth) > holderWidth) {
                            item.submenu.ui.css('left', 0 - menuWidth);
                        }
                        offset = item.submenu.ui.offset();
                        if (offset.top < 2) {
                            item.submenu.ui.css('top', 2);
                        }
                    }
                    return false;
                }, function() {
                    if (item.enabled) item.submenu.hide();
                    return false;
                });
            }
            return item.ui;
        };
        item.show = function() {
            if (item.ui) {
                item.ui.show();
            }
        };
        item.hide = function() {
            if (item.ui) {
                item.ui.hide();
            }
        };
    };

    exports.Menu = Menu;
    exports.MenuItem = MenuItem;

});