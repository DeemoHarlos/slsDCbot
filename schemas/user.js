const mongoose = require('mongoose')

// Schemas
module.exports = new mongoose.Schema({
	userId: {
		type: String,
		required: true,
		unique: true
	},
	exp: {
		type: Number,
		required: true,
		set: v => Math.round(v)
	}
})