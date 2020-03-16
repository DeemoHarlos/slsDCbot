const config = require('./config.js')

module.exports = {
	is: function(target, arr) {
		let flag = false
		arr.forEach((e,i,a)=>{
			if (target === e) flag = true
		})
		return flag
	},
	not: function(target, arr) {
		let flag = true
		arr.forEach((e,i,a)=>{
			if (target === e) flag = false
		})
		return flag
	},
	random: function(arr) {
		let i = Math.floor(Math.random() * arr.length)
		return arr[i]
	},
	cmd: function(msg, cmd) {
		let cmd2 = config.prefix+cmd+' '
		let cmd3 = config.prefix+cmd+'\n'
		return (msg.content === config.prefix+cmd) ||
		       (msg.content.slice(0, cmd2.length) === cmd2) ||
		       (msg.content.slice(0, cmd3.length) === cmd3)
	},
	debugSend: function(err, ch) {
		if (ch) ch.send(err)
		console.log(err)
	},
	tryCatch: function(func, bot) {
		try {
			func()
		} catch (err) {
			let errorMsg = `[ ERROR ] ${err.name}: ${err.message}`
			console.log(errorMsg)
			if (bot && bot.channels && bot.channels.get && bot.channels.get(config.dbgChannel))
			bot.channels.get(config.dbgChannel).send(errorMsg)
		}
	},
	checkAdmin: function(msg) {
		if (!msg.member.roles.has(config.adminRole)) {
			msg.channel.send('此功能僅限管理原使用。')
			return false
		} else return true
	},
	checkChannel: function(msg) {
		if (!this.is(msg.channel.id, config.availChannels)) {
			msg.channel.send('此功能不可在此頻道使用。')
			return false
		} else return true
	},
	checkMember: function(msg) {
		return !msg.author.bot && msg.guild
	}
}