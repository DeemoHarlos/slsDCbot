const util = require('./util.js')
const config = require('./config.js')

const note = ['C','D','E','F','G','A','B']
const noteName = ['Do','Re','Mi','Fa','So','La','Si']

function ping(msg) {
	if (util.is(msg.content, note))
		msg.channel.send(util.random(note))
	if (util.is(msg.content, noteName))
		msg.channel.send(util.random(noteName))
}

module.exports = function(bot) {
	bot.on('message', msg => {
		util.tryCatch(()=>{
			// Ignore bot messages.
			if (msg.author.bot) return
			// use is instead of checkChannel to avoid report
			if (util.is(msg.channel.id, config.availChannels))
				ping(msg)
		}, bot)
	})
}