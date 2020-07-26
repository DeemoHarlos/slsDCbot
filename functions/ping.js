const util = require('../util.js')
const config = require('../config.js')

const note = ['C','D','E','F','G','A','B']
const noteName = ['Do','Re','Mi','Fa','So','La','Si']

function ping(msg) {
	if (note.includes(msg.content))
		msg.channel.send(util.random(note))
	if (noteName.includes(msg.content))
		msg.channel.send(util.random(noteName))
}

module.exports = function(bot) {
	bot.on('message', msg => {
		if (!util.checkMember(msg)) return
		// use is instead of checkChannel to avoid report
		if ([config.channels.spam, config.channels.cmd, config.channels.debug]
			.includes(msg.channel.id)) ping(msg, bot)
	})
}