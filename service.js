var fs = require('fs'),
    path = require('path'),
    download = require('download-file'),
    options = {
        directory: "./images"
    },
    fetchImagePath = path.join(__dirname,'/images/');


// Object to generate the image filename
var generateFilename = {
    count: 0,
    getFilename: function() {
        this.count++;
        return "Photo-" + this.count;
    }
};

module.exports = {
    downloadFile: function(url,filename,callback){
        options.filename = filename ? filename : "photo" + generateFilename.getFilename();
        download(url, options, function(err){
            if(err) console.log(err);
            var imagePath = path.join(__dirname,'/images/'+options.filename);
            console.log(imagePath);
            callback(imagePath);
        })
   },
   validateImagePath: function(filename, callback) {
        var imagePath = fetchImagePath + filename;
        fs.exists(imagePath, function(exist) {
            if(!exist) console.log("The image is not located in the path");
            callback(imagePath);
        })
   }
};

