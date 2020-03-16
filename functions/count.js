const util = require('../util.js')
const config = require('../config.js')

async function totalMessages(channel) {
	let total = 0
	let lastId = 0
	const max = 100
	let options = { limit: max }

	while (true) {
		if (lastId) options.before = lastId
		const messages = await channel.fetchMessages(options)
		total += messages.size
		lastId = messages.last().id
		if (messages.size < max) break
	}
	return total
}

// count message
function count(ch) {
	ch.send(`計算中...`)
	totalMessages(ch).then(count => {
		ch.send(`這個頻道有 ${count} 個訊息。`)
	})
}

module.exports = function(bot) {
	bot.on('message', msg => {
		util.tryCatch(()=>{
			// Ignore bot messages.
			if (msg.author.bot) return
			if (util.cmd(msg, 'count'))
				if (util.checkChannel(msg))
					count(msg.channel)
		}, bot)
	})
}