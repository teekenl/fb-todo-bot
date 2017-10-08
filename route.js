var express = require('express');
var router = express.Router();

router.get('/',function(req,res){
    res.send('Welcome to Fb todo bot created by Ken Lau');
});

module.exports = router;
