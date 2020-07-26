const util = require('../util.js')
const config = require('../config.js')

function clear(ch, num) {
	if (isNaN(num)) num = 20
	if (num < 0) num = 5
	if (num > 100) num = 100
	ch.messages.fetch({ limit: num }).then(messages=>{
		ch.bulkDelete(messages).catch(async err=>{
			for (message of messages.array()) {
				message.delete()
				await util.sleep(2000)
			}
		})
	})
}

module.exports = function(bot) {
	bot.on('message', msg => {
		// Ignore bot messages.
		if (msg.author.bot) return
		// clear, only for debug channel
		if ([config.channels.debug].includes(msg.channel.id)) {
			let cmd = util.cmd(msg)
			if (!cmd) return
			if (cmd[0] === 'clear') clear(msg.channel, cmd[1])
		}
	})
}