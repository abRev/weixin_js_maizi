var express = require('express');
var router =express.Router();
var mongoose = require('mongoose');
var wechat = require('wechat');
var User = mongoose.model('User');
var Conversation = mongoose.model('Conversation');
var request = require('request');
var cheerio = require('cheerio');


module.exports = function(app){
	app.use('/wechat',router);
};

router.get('/history/:userid',function(req,res,next){
	if(!req.params.userid){
		return next(new Error('非法请求 缺少userid'));
	}
	User.findOne({_id:req.params.userid}).exec(function(err,user){
		if(err){
			return next(err);
		}
		Conversation.find({user}).exec(function(errCon,conversations){
			if(errCon){
				return next(errCon);
			}
			res.jsonp(conversations);
		});
	});
});

var config = {
  token: 'qbtest',
  appid: 'wx0d3fe90f46946b2b'
};

const baseUrl = 'www.fullab.top';

const wechatHandleTextMessage = function(req,res,next){
		var message = req.weixin;
		
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
			
			//保存到conversation中
			var conversation = new Conversation({
				user:req.user,
				question:message.Content,
				answer:answer+"<a href='"+href+"'>click here</a>",
				createAt:new Date()
			});
	/*		Conversation.find({question:message.Content},function(err,conversations){
				if(err){
					console.log(err);
				}else
				{
					console.log("====>>"+message.Content+" === "+ conversations);
					if(conversations){
				
					}else{
		*/			
						conversation.save(function(errCon){
							if(errCon){
								console.log(errCon);
							}else{
								req.user.conversationCount = req.user.conversationCount+1;
								req.user.save(function(errUser){
									if(errUser){
										console.log(errUser)
									}
								});
							}
						});
/*
					}
				}
			});
*/
		});
}

const wechatHandleEventMessage = function(req,res,next){

	var message = req.weixin;
	var Event = message.Event;
	var eventKey = message.EventKey;
	
	if( Event=="subscribe"){
		res.reply('欢迎关注我！');
	}else if(Event=='unsubscribe'){
		return next();
	}else if(Event == 'CLICK' && eventKey == 'conversation-history'){
		res.reply(baseUrl + '/wechat/history/' + req.user._id.toString() );
	}else if(Event == 'ClICK' && eventKey == 'conversation-random'){
		
	}
}

const handleWechatRequest = wechat(config,function(req,res,next){
	var message = req.weixin;	

	console.log(message,req.query);
	
	if(message.MsgType == 'text'){
		wechatHandleTextMessage(req,res,next);
	}else if(message.MsgType == 'event'){
		wechatHandleEventMessage(req,res,next);
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

