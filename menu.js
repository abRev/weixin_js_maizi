const request = require('request');
const jssdk = require('./libs/jssdk.js');
const schedule = require('node-schedule');
const menuItems = {
	"button":[
		{
			"type":"click",
			"name":"问答历史",
			"key":"conversation-history"
		},
		{
			"type":"click",
			"name":"随机问答",
			"key":"conversation-random"
		}
	]
};
function doMenuSync(){
	jssdk.getAccessToken(function(err,token){
		if(err){
			console.log(err);
		}
	
		request.get("https://api.weixin.qq.com/cgi-bin/menu/delete?access_token="+token,function(errGet,res,body){
			if(errGet){
				console.log(e);
			}
			console.log("订单删除成功",body);
			
			request.post({url:"https://api.weixin.qq.com/cgi-bin/menu/create?access_token="+token,json:menuItems},function(errPost,_res,_body){
				if(errPost){
						cosole.log('菜单创建失败');
				}else{
					console.log('菜单创建成功',_body);
				}	
			})
		})
	})
}

schedule.scheduleJob({second:0,minute:0},function(){
	console.log('执行菜单脚本');
	doMenuSync();
})
