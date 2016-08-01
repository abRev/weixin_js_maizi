var express = require('express');
var router =express.Router();
var mongoose = require('mongoose');
var wechat = require('wechat');

module.exports = function(app){
	app.use('/wechat',router);
};

var config = {
  token: 'qbtest',
  appid: 'wx0d3fe90f46946b2b'
};

const handleWechatRequest = wechat(config,function(req,res,next){
	var message = req.weixin;
	console.log(message);

	res.reply('hello');
})

router.get('/conversation',handleWechatRequest);
router.post('/conversation',handleWechatRequest);

