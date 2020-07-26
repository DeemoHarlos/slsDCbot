const util = require('../util.js')
const config = require('../config.js')

const userSchema = require('../schemas/user.js')

function setrole(msg, args, bot, db) {
	if (!msg.mentions.members.size)
		return msg.channel.send(`No member found. Probably not in cache?`)
	let role = config.expRoles.find(role=>role.abbr === args[0])
	if (!role) return msg.channel.send(`No available role indicated.`)
	msg.mentions.members.each(member=>{
		if (member.user.bot)
			return msg.channel.send(`Bots are not accepted.`)
		if (member.roles.cache.has(role.id))
			return msg.channel.send(`${member} is already ${role.name}.`)
		member.roles.add(role.id)
			.catch(err=>util.catch(`(setrole) ` + err, msg.channel))
		msg.channel.send(`${member} has gained ${role.name} role.`)
		let User = db.model('User', userSchema)
		User.findOneAndUpdate({ userId: member.id }, { $inc: { exp: role.exp } },
			{ upsert: true }, err=>{
			if (err) return msg.channel.send(`Update Users error: ${err}`)
			return msg.channel.send(`${member} has gained ${role.exp} exp.`)
		})
	})
}

function welcome(msg, args, bot, db) {
	if (!msg.mentions.members.size)
		return msg.channel.send(`No member found. Probably not in cache?`)
	let role = config.expRoles.find(role=>role.welcome)
	let lang = config.lang.find(l=>l.name === args[0])
	if (!role) return msg.channel.send(`No welcome role found.`)
	if (!lang) msg.channel.send(`No language indicated.`)
	msg.mentions.members.each(member=>{
		if (member.user.bot)
			return msg.channel.send(`Bots are not accepted.`)
		if (member.roles.cache.has(role.id))
			return msg.channel.send(`${member} is already ${role.name}.`)
		member.roles.add(role.id)
			.catch(err=>util.catch(`(welcome) ` + err, msg.channel))
		if (lang) member.roles.add(lang.role)
		let User = db.model('User', userSchema)
		User.findOneAndUpdate({ userId: member.id }, { $inc: { exp: role.exp } },
			{ upsert: true }, err=>{
			if (err) return msg.channel.send(`Update Users error: ${err}`)
			return msg.channel.send(`${member} has gained ${role.exp} exp.`)
		})
		// Send welcome message
		let strs = {
			'EN': `Congrats! ${member} has become a ${role.name}!`,
			'ZH': `恭喜 ${member} 成為了 ${role.name}！`
		}
		let str = lang ? strs[lang.name] : strs['EN']
		bot.channels.fetch(lang.channel.general).then(ch=>ch.send(str))
	})
}

module.exports = function(bot, db) {
	bot.on('message', msg => {
		if (!util.checkMember(msg)) return
		let cmd = util.cmd(msg)
		if (!cmd) return
		if (cmd[0] === 'setrole')
			if (util.checkAdmin(msg) && util.checkChannel(msg))
				setrole(msg, cmd.slice(1), bot, db)
		if (cmd[0] === 'welcome')
			if (util.checkAdmin(msg) && util.checkChannel(msg))
				welcome(msg, cmd.slice(1), bot, db)
	})
}