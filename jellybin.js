"use strict"

var fs = require('fs');

module.exports = function(path, config){
	return new JellyBin(path, config);
}

function JellyBin(path, config){
	config = config || {};

	try{
		this.json = jsonLoadSync(path);
		this._error = null;
	} catch(e){
		if(e.code == "ENOENT" && config.create == true){
			jsonSaveSync(path, {});
			this.json = {};
			this._error = null;
		} else {
			this._error = e;
			throw e;
		}
	}
	this._path = path;

	var that = this;

	if(config.watch !== false){
		var watcher = fs.watch(path);
		watcher.on('change', function(event, filename){
			if(event === "change"){
				try {
					that.json = jsonLoadSync(that._path);
					//if succese then reset error
					that._error = null;
				} catch(e) {
					that._error = e;
				}
			}
		}).on('error', function(err){
			that._error = err;
		});
		this._watcher = watcher;
	}
}

JellyBin.prototype.save = function save(data, callback){
	if(typeof data != "object") {
		return callback(new Error("data must be object"));
	}
	this.json = data;
	jsonSave(this._path, this.json, callback);
}
JellyBin.prototype.load = function load(callback){
	var that = this;
	jsonLoad(this._path, function(err, data){
		if(err) return callback(err);
		that.json = data;
		callback(null, data);
	});
}
JellyBin.prototype.set = function put(key, value, callback){
	//trigger when reload fail
	if(this._error) throw this._error;

	this.json[key] = value;
	jsonSave(this._path, this.json, callback);
}
JellyBin.prototype.get = function get(key){
	//trigger when reload fail
	if(this._error) throw this._error;

	return this.json[key];
}
JellyBin.prototype.find = function find(query){
	//trigger when reload fail
	if(this._error) throw this._error;

	var result = {};

	var compareFunc = typeof query == "object" ? isCollect : isSame;

	for(var key in this.json){
		if(compareFunc(this.json[key], query)){
			result[key] = this.json[key];
		}
	}
	return result;

	function isCollect(element, query){
		for(var key in query){
			if(element[key] !== query[key]){
				return false;
			}
		}
		return true;
	}
	function isSame(value, query){
		return value === query;
	}
}
JellyBin.prototype.unwatch = function(){
	if(this._watcher)
		this._watcher.close();
}

function jsonLoad(path, callback){
	fs.readFile(path, {encoding : "utf8"}, function(err, data){
		if(err) return callback(err);
		try{
			data = JSON.parse(data);
		} catch(e){
			return callback(e);
		}
		callback(null, data);
	});
}
function jsonLoadSync(path){
	return JSON.parse(fs.readFileSync(path, {encoding : "utf8"}));
}
function jsonSave(path, data, callback){
	fs.writeFile(path, JSON.stringify(data, null, 4), {encoding : "utf8"}, callback);
}
function jsonSaveSync(path, data){
	return fs.writeFileSync(path, JSON.stringify(data, null, 4), {encoding : "utf8"});
}
