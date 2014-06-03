var assert = require("assert");
var jellybin = require('../jellybin');

var fs = require("fs");

describe("db", function(){
	var defaultData = {
		name : "jellybin",
		repo : "git@github.com:bluemir/jellybin",
		info : { 
			testtool : "mocha",
			other : "testing"
		}
	};
	describe("#create", function(){
		it("should return DB object", function(){
			var db = jellybin('test/db.json', {watch : false});

			assert.ok(db);
			assert.ok(db.json);
			//check function
			assert.ok(db.save);
			assert.ok(db.load);
			assert.ok(db.find);
			assert.ok(db.set);
			assert.ok(db.get);

			db.unwatch();
		});
		it("should throw error when select non-exsit file", function(){
			assert.throws(function(){
				var db = jellybin('test/non_exist.json');
			}, /ENOENT/);
		});
		it("should make file when enable create option", function(done){
			var db = jellybin('test/db-create-test.json',{create : true});
			fs.exists('test/db-create-test.json', function(exist){
				done(assert.ok(exist, "file dosen't exist"));
				db.unwatch();
			});
			//delete test json
			fs.unlink('test/db-create-test.json', function(){});
		});
	});
	describe("#find", function(){
		var db = jellybin("test/db.json", {watch : false});

		beforeEach(function (done){
			db.save(defaultData, done);
		});

		it("should find simple string", function(){
			var name = db.find("jellybin");
			assert.deepEqual({name : "jellybin"}, name);
		});

		it("should find object", function(){
			var obj = db.find({ testtool : "mocha" });
			assert.deepEqual({
				info : { 
					testtool : "mocha",
					other : "testing"
				}
			}, obj);
		});
		afterEach(function(){
			db.unwatch();
		});
	});
	describe("#get", function(){
		var db = jellybin("test/db.json", {watch :false});

		beforeEach(function (done){
			db.save(defaultData, done);
		});

		it("should return jellybin when try to get name", function(){
			var name = db.get("name");
			assert.equal("jellybin", name);
		});
		
		afterEach(function(){
			db.unwatch();
		});
	});
});


