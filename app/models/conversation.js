var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var ConversationSchema = new Schema({
			user:{type:Schema.ObjectId,ref:'User'},
			question:{type:String},
			answer:{type:String,default:''},
			createAt:{type:Date}
		});

mongoose.model('Conversation',ConversationSchema);
