"use strict";
/**
 * 左侧栏
 */
define(function (require,exports,module) {
    "require:nomunge,exports:nomunge,module:nomunge";

	var self=exports;
	var linq = require("mokit/linq");
	var utils = require("mokit/utils");

    self.width=300;
    self.menuWidth=40;
    self.state=null;
    self.speed=200;

	self.items=[{
		'id':'workspace',
		'text':'WORKSPACE'
	},{
		'id':'command',
		'text':'COMMAND'
	}];

	//当前选中项
	self.current=null;
	self.currentId=null;

	/**
	 * 选择一个侧边栏项
	 * @param  {String}   id       边栏id
	 * @param  {Function} callback 选中完成回调
	 * @return {Null}              无返回值
	 */
	self.pickMenu=function(id,callback){
	    self.currentId = id;
		self.current=linq.From(self.items).First(function(item){
		    return item.id == id;
		});
		self.state = {};
        self.state[id]=true;
		if(callback)callback();
	};

	/**
	 * 取消选择一个侧边栏项
	 * @param  {String}   id       边栏id
	 * @param  {Function} callback 取消完成回调
	 * @return {Null}              无运回值
	 */
	self.unPickMenu=function(id,callback){
		self.state = {};
        if(!utils.isNull(id)){
            self.state[id]=false;
		}
	};

});