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
	console.log(Object.getOwnPropertyNames(this.friends));
	
	// if (this.friends.indexOf(friend._id) > -1) {
	// 	return console.log('Already a friend');
	// }
	// else {
	// 	return console.log('Not a friend yet');
	// }

	if (friend) {
		var current = this;
		this.model('User').findOne({name: friend.name}, function(err, f) {
			if (err) {
				return console.log(err);
			}
			else {
				if (current.friends.indexOf(f._id) > -1) {
					return console.log('Already a friend');
				}
				else {
					return console.log('Not a friend yet');
				}
			}
		});
	}
	else {
		return console.log('Not a valid name');
	}
	//this.save(cb);
}

//set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', userSchema);