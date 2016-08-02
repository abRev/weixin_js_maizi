var express = require('express');
var router =express.Router();
var mongoose = require('mongoose');
var wechat = require('wechat');
var User = mongoose.model('User');

module.exports = function(app){
	app.use('/wechat',router);
};

var config = {
  token: 'qbtest',
  appid: 'wx0d3fe90f46946b2b'
};

const handleWechatRequest = wechat(config,function(req,res,next){
	var message = req.weixin;
	console.log(message,req.query);
	
	if(message.MsgType=='event' && message.Event=="subscribe"){
		res.reply('欢迎关注我！');
	}else if(message.MsType=='event' && message.Event=='unsubscribe'){
		next();
	}else{
	
		res.reply("woca ");
	}
});

var handleUserSync = function(req,res,next){
	if(!req.query.openid){
		return next();
	}
	
	var openid = req.query.openid;
	User.findOne({"openid":openid}).exec(function(err,user){
		if(err){
			return next(err);
		}
		if(user){
			req.user = user;
			return next();
		}

		var newUser = new User({
			openid:openid,
			createAt:new Date(),
			conversationCount:0
		});
		
		newUser.save(function(err,createUser){
			if(err){
				return next(err);
			}
			req.user=createUser;
			next();
		})
	})
	
}

router.get('/conversation',handleWechatRequest);
router.post('/conversation',handleUserSync,handleWechatRequest);

