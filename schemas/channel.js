const mongoose = require('mongoose')

// Schemas
module.exports = new mongoose.Schema({
	channelId: {
		type: String,
		required: true,
		unique: true
	},
	expRatio: {
		type: Number,
		required: true,
		set: v => Math.round(v)
	}
})