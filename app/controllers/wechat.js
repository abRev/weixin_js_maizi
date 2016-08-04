var express = require('express');
var router =express.Router();
var mongoose = require('mongoose');
var wechat = require('wechat');
var User = mongoose.model('User');
var request = require('request');
var cheerio = require('cheerio');


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

		if(message.MsgType !== 'text'){
			return res.reply('we can handle type of this message');
		}
		
		if(!message.Content){
			return res.reply("you should ask the question!!!");
		};
		/*
		if(message.Content ==  'tor'){
			request({
				url:'http://cililian.me/list/%E7%94%B0%E4%B8%AD%E7%9E%B3/1.html'
			},function(err,response,body){
				if(err){
					console.log(err);
				  return res.reply('have a err');
				}
				const $ = cheerio.load(body);
				const results = $('.dInfo');
				const result = $(results.get(0));
				const href = result.children('a').attr('href');
				res.reply(href+" : "+"<a href='"+href+"'>click</a>");
			});
		}else{
		*/
	

		request({
			url:'https://www.baidu.com/s?wd='+encodeURIComponent(message.Content),
			headers:{
				"User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
			}
		},function(err,response,body){
			if(err){
				return res.reply('there is a err when wen ask baidu!!!');
			}

			const $ = cheerio.load(body);
			const results = $('.result.c-container');
			
			if(results.length === 0){
				return res.reply('sorry!! We find 0 answer for your question!');
			}
			
			const result = $(results.get(0));
			const answer = result.find('.c-abstract').text();
			const href = $('.result.c-container').children('h3').children('a').attr('href');
			res.reply(answer?answer+"<a href='"+href+"'>click here</a>":'find a empty answer' );
		});
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

