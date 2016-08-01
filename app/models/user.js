var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	openid:{type:String,required:'`Openid`Ê±ØîÊ'},
	createdAt:{type:Date},
	conversationCount:{type:Number,default:0}
});

mongoose.model('User',UserSchema);
