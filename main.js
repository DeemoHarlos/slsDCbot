const Discord = require('discord.js')
const mongoose = require('mongoose')

const auth = require('./auth.json')
const util = require('./util.js')
const config = require('./config.js')

const bot = new Discord.Client()

// connect to mongoDB when bot is ready
bot.on('ready', () => {
	console.log(`Logged in as ${bot.user.tag}!`)
	mongoose.set('useNewUrlParser', true)
	mongoose.set('useUnifiedTopology', true)
	mongoose.set('useFindAndModify', false)
	mongoose.set('useCreateIndex', true)
	mongoose.connect(auth.dbUrl, (err)=>{
		if (err) console.error(`MongoDB connection error: ${err}`)
		else console.log('Connected to MongoDB successfully.')
	})
});

require('./debug.js')(bot)
require('./ping.js')(bot)

require('./functions/allow.js')(bot, mongoose)
require('./functions/count.js')(bot)
require('./functions/clear.js')(bot)
require('./functions/exp.js')(bot, mongoose)

// login
bot.login(auth.token)