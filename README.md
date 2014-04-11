#JSON-DB

lightweight JSONDatabase with automatically syncing to disk.

If json file change, jellybin automatically reload json file.

##Usage

```
var jellybin = require("jellybin");

var db = jellybin("data.json");

db.set("jelly", { 
	name : "jelly",
	description : "A sweet, clear, semisolid, somewhat elastic spread or preserve made from fruit juice and sugar boiled to a thick consistency.",
	taste : "sweet"
}, function(err){
	console.log("save complete");
});

//get data
var data = db.get("jelly");

//find element with query
data = db.find({ taste : "sweet"});

//also save entire json
db.save({ 
	jelly : {
		name : "jelly"
	}
});

//and load it.
db.load(function(err, data){
	console.dir(data);
});

```
