var google = require('googleapis');
var mime = require('mime');
var fs = require('fs');
var OAuth2Client = google.auth.OAuth2;

//this backend will be used if *all* of these env 'vars' are present
exports.vars = ["CLIENT_ID", "CLIENT_SECRET", "REDIRECT_URL", "REFRESH_TOKEN"];

//if these 'vars' are present, 'init' will be called on module load
exports.init = function(config) {
	var CLIENT_ID = config.CLIENT_ID;
	var CLIENT_SECRET = config.CLIENT_SECRET;
	var REDIRECT_URL = config.REDIRECT_URL;
	var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
	
	oauth2Client.setCredentials({
		refresh_token: config.REFRESH_TOKEN
	});
	
	oauth2Client.refreshAccessToken(function(err, tokens) {
		if(err) {
			console.log("Google drive login failed: %s", err);
			callback("Google drive login failed: %s", err);
			process.exit(1);
		}
    console.log("Google drive login success");
    callback("Google drive login success");
	});
	var drive = google.drive({ version: 'v2', auth: oauth2Client });
};


exports.upload = function(torrentFile, callback) {
callback(torrentFile.path);
var dirs = torrentFile.path.split("/");
var name = dirs.pop();
var dir = null;
var root = "0B67JfCWuHsqiflZQZ19jcW9uaXppVlh6aFFPLVA5ak5TTWtFY1huamRfcHhYTFpZd25zZ2c";

//call back when all dirs made
mkdirp(dirs, root, function(err, dir) {
	if(err)
		return callback(err);
	upload(dir);
});

function mkdirp(dirs, parent, cb) {
	var d = dirs.shift();
	drive.files.insert({
	  resource: {
		title: d,
		mimeType: 'application/vnd.google-apps.folder',
		parents: [{
		"kind": "drive#fileLink",
		"id": parent
	  }]
	}
	}, function(err, response) {
	if(err)
        return cb(err);
	if(dirs.length > 0) //dont callback yet!
        mkdirp(dirs, response.id, cb);
	else
        cb(null, response.id);
	});
}
	
function upload(dir) {
    var stream = torrentFile.createReadStream();
	var mtype = mime.lookup(torrentFile.path);

	drive.files.insert({
	  resource: {
		title: name,
		mimeType: mtype,
		parents: [{
		"kind": "drive#fileLink",
		"id": dir
	  }]
	  },
	  media: {
		mimeType: mtype,
		body: stream
	  }
	}, function(err, response) {
			if(err)
				callback(err);
			console.log("uploaded: ", response.id);
			callback("uploaded: "+ response.id);
			callback(null);
	});
}
}

//list will be called to list all stored files
exports.list = function(callback) {
	callback(null, {
		//original path to file (torrentFile.path)
		"Magesh": {
			length: 0, //total length of file in bytes
			url: "https://www.google.com" //public url to file
		},
		"Preethi": {
			length: 0, //total length of file in bytes
			url: "https://www.google.com" //public url to file
		}
	});
};

//removes a file at the given path (will be torrentFile.path)
exports.remove = function(path, callback) {
	callback(null);
};