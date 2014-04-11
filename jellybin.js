"use strict"

var fs = require('fs');

module.exports = function(path, config){
	return new JellyBin(path, config);
}

function JellyBin(path, config){
	this._data = jsonLoadSync(path);
	this._path = path;

	this._error = null;

	var that = this;

	if(config.watch !== false){
		var watcher = fs.watch(path);
		watcher.on('change', function(event, filename){
			if(event === "rename"){
				watcher.close();
				watcher = fs.watch(path);
			} else if(event === "change"){
				try {
					that._data = jsonLoadSync(that._path);
					//if succese then reset error
					that._error = null;
				} catch(e) {
					that._error = e;
				}
			}
		}).on('error', function(err){
			this._error = err;
		});
	}
}

JellyBin.prototype.save = function save(data, callback){
	if(typeof data != "object") {
		return callback(new Error("data must be object"));
	}
	this._data = data;
	jsonSave(this._path, this._data, callback);
}
JellyBin.prototype.load = function load(callback){
	jsonLoad(this._path, function(err, data){
		if(err) return callback(err);
		this._data = data;
		callback(null, data);
	});
}
JellyBin.prototype.set = function put(key, value, callback){
	//trigger when reload fail
	if(this._error) throw this._error;

	this._data[key] = value;
	jsonSave(this._path, this._data, callback);
}
JellyBin.prototype.get = function get(key){
	//trigger when reload fail
	if(this._error) throw this._error;

	return this._data[key];
}
JellyBin.prototype.find = function find(query){
	//trigger when reload fail
	if(this._error) throw this._error;

	var result = {};
	
	var compareFunc = typeof query == "object" ? isCollect : isSame;

	for(var key in this._data){
		if(compareFunc(this._data[key], query)){
			result[key] = this._data[key];
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
	function isSame(element, query){
		return value === query;
	}
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
