// Get an instnce of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: String,
	password: String,
	friends: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
});

userSchema.methods.addFriend = function(friend, cb) {
	//this.friends.push(friend);
	//console.log(Object.getOwnPropertyNames(this.model('User')));
	console.log(friend);
	//this.save(cb);
}

//set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', userSchema);