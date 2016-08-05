var mongoose = require('mongoose');
require('./app/models/conversation');

mongoose.connect('mongodb://localhost/projects-development');
var Conversation = mongoose.model('Conversation');
Conversation.find({question:"哈哈"},function(err,cons){
	if(err){
		console.log(err);
	}
	console.log(cons);
})
