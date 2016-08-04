var crypto = require('crypto');
var fs = require('fs');
var request = require('request');
function JSSDK(appId,appSecret){
	this.appId= appId;
	this.appSecret=appSecret;
}

JSSDK.prototype={
	getSignPackage:function(url){
		var jsapiTicket =this.getJsApiTicket(function(err,ticket){return ticket});
		var timestamp = Math.round(Date.now()/1000);
		var nonceStr = this.createNonceStr();
		
	
		var rowString = "jsapi_ticket="+jsapiTicket+"&noncestr="+nonceStr+"&timestamp="+timestamp+"&url="+url;
		var hash = crypto.createHash('sha1');
		var	sign = hash.update(rowString).digest('hex');

		return {
			appId:this.appId,
			nonceStr:nonceStr,
			timestamp:timestamp,
			url:url,
			signature:sign,
			rowString:rowString
		};
	},
	getJsApiTicket:function(done){
		var instance = this;
		var data = this.readCacheFile('.jsapiticket.json');
		var time = Math.round(Date.now()/1000);

		if(data.expireTime < time){
			instance.getAccessToken(function(error,accessToken){
				if(error){
					console.log(error);
					return done(error,null);
				}
				
				var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token="+accessToken;
				request.get(url,function(err,res,body){
					if(err){
						console.log("getJsApiTicket:" + err);
						return done(err,null);
					}

					try{
						var data = JSON.parse(body);
						instance.writeCacheFile('.jsapiticket.json',{
							expireTime:Math.round(Date.now()/1000 + 7200),
							jsapiTicket:data.ticket
						});
						done(null,data.ticket);		
					}catch(e){
						console.log(e);
						return done(e,null);
					}
				});
			});
		}else{
			done(null,data.jsapiTicket);
		}
	},
	getAccessToken:function(done){
		var instance = this;
		var filename = ".access_token.json";
		var data = this.readCacheFile(filename);
		var time = Math.round(Date.now()/1000);
		if(data.expireTime<time){
			var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+this.appId+"&secret="+this.appSecret;
			request.get(url,function(err,res,body){
				if(err){
					console.log(err);
					return done(err,null);
				}
				
				try{
					var data = JSON.parse(body);
					instance.writeCacheFile(filename,{
						expireTime:Math.round(Date.now()/1000 + 7200),
						accessToken:data.access_token
					});
					done(null,data.access_token);
				}catch(err){
					console.log(err);
					return done(err,null);
				}
			});
		}else{
			done(null,data.accessToken);
		}
	},
	createNonceStr:function(){
		var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var length = chars.length;
		var str="";
		for (let i=0;i<16;i++){
			str+= chars.substr(Math.round(Math.random()*length),1);
		}
		return str;
	},
	readCacheFile:function(filename){
		try{
			var data = fs.readFileSync(filename);
			return JSON.parse(data);
		}catch(e){
			console.log(filename+'  '+e);
		}
		return {};
	},
	writeCacheFile:function(filename,data){
		return fs.writeFileSync(filename,JSON.stringify(data));
	}
};

var sdk = new JSSDK('wx0d3fe90f46946b2b','8d8cd2ec36fa750cfdf7566e850ba03c');
module.exports = JSSDK;
