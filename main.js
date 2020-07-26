const Discord = require('discord.js')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const util = require('./util.js')
const config = require('./config.js')

const bot = new Discord.Client()

process.on('unhandledRejection', err=>{
	let msg = ''
	if (err.name === 'DiscordAPIError')
		msg = `${err.name} ${err.method} ${err.path}\n${err.code} - ${err.message}`
	else msg = err.stack
	util.debugSend('error', msg, bot)
})

process.on('uncaughtException', err => {
  util.debugSend('error', err.stack, bot)
})

process.on('warning', warning=>{
  util.debugSend('warn', warning, bot)
})

process.on('SIGINT', async ()=>{
	await util.debugSend('info', `BOY 晚安~`, bot)
	process.exit()
})

process.on('SIGTERM', async ()=>{
	await util.debugSend('info', `BOY 晚安~`, bot)
	process.exit()
})

// connect to mongoDB when bot is ready
bot.once('ready', () => {
	console.log(`Logged in as ${bot.user.tag}!`)
	mongoose.set('useNewUrlParser', true)
	mongoose.set('useUnifiedTopology', true)
	mongoose.set('useFindAndModify', false)
	mongoose.set('useCreateIndex', true)
	mongoose.connect(process.env.DBURL, (err)=>{
		if (err) util.debugSend('DB-error', `MongoDB connection error: ${err}`, bot)
		else util.debugSend('DB-info', 'Connected to MongoDB successfully.', bot)
	})

	util.debugSend('info', `BOY 起床啦~`, bot)
})

bot.on('guildMemberRemove', member=>{
	channel = bot.guilds.resolve(config.guildId).systemChannelID
	bot.channels.fetch(channel).then(ch=>{
		ch.send(`${member.user.username} (${member.user}) 離開了 ${config.guildName}。`)
	})
})

require('./debug.js')(bot)

require('./functions/ping.js')(bot)
require('./functions/setrole.js')(bot, mongoose)
require('./functions/count.js')(bot)
require('./functions/clear.js')(bot)
require('./functions/exp.js')(bot, mongoose)
require('./functions/fb.js')(bot)

// login
bot.login(process.env.TOKEN)