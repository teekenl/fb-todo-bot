var express = require('express'),
    router = express.Router(),
    service = require('./service');

router.get('/',function(req,res){
    res.send('Welcome to Fb todo bot created by Ken Lau');
});

// API Gateway can put here
router.post('/storePhoto', function(req,res) {
    var downloadUrl = req.body.downloadUrl,
        newImageFilename = req.body.filename;
    // callback if the image url is exis
    if(downloadUrl && newImageFilename) {
        service.downloadFile(downloadUrl,function(imagePath){
            if(imagePath === null) {
                console.log("No photo exist");
                res.status(404).send("Photo is not received");
            }
            res.status(200).send(newImageFilename);
        });
    } else{
        res.status(404).send("No url or imageFilename is provided");
    }
});

router.get('/fetchPhoto', function(req, res) {
    var imageFilename = req.body.filename;
    if(imageFilename) {
        service.validateImagePath(imageFilename, function(imagePath){
            if(!imagePath) {
                console.log("The path is invalid");
                res.status(404).send("Invalid image's filename");
            }
            res.status(200).send(imagePath);
        });
    } else{
        res.status(404).send("No image's filename is provided");
    }
});


module.exports = router;
