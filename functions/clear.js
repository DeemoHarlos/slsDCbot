const util = require('../util.js')
const config = require('../config.js')

function clear(msg, bot) {
	let dbg = bot.channels.get(config.dbgChannel)
	dbg.send(`刪除中...`).then(msg => {
		async function deleteMessages(channel) {
			let total = 0
			const max = 100
			let options = { limit: max, before: msg.id }

			while (true) {
				const messages = await channel.fetchMessages(options)
				var size = messages.size
				await dbg.bulkDelete(messages)
				total += size
				if (size < max) break
			}
			return total
		}
		deleteMessages(dbg).then(count => {
			dbg.send(`已刪除 ${count} 個訊息。`)
		})
	})
}

module.exports = function(bot) {
	bot.on('message', msg => {
		util.tryCatch(()=>{
			// Ignore bot messages.
			if (msg.author.bot) return
			// clear, only for debug channel
			if (util.is(msg.channel.id, [config.dbgChannel])) {
				if (util.cmd(msg, 'clear')) clear(msg, bot)
			}
		}, bot)
	})
}