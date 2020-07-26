const config = require('./config.js')

var util = {}

util.random = function(arr) {
	let i = Math.floor(Math.random() * arr.length)
	return arr[i]
}

util.sleep = async function(ms) {
	await new Promise(resolve=>setTimeout(resolve, ms))
}

util.cmd = function(msg) {
	let str = msg.content
	if (!str || str.charAt(0) !== config.prefix) return undefined
	return str.slice(1).split('\n')[0].split(/ +/)
}

util.getLangStr = function(msg, strs) {
	roles = msg.member.roles.cache
	for (l of config.lang.reverse())
		if (roles.has(l.role) && strs[l.name])
			return strs[l.name]
	for (l of config.lang) if (strs[l.name]) return strs[l.name]
}

util.debugSend = async function(name, msg, botOrCh) {
	let str = `< ${name.toUpperCase()} > ${msg}`
	console.log(str)
	if (botOrCh && botOrCh.send) await botOrCh.send(str)
		.catch(err=>console.log(`Cannot send debug message: ` + err))
	else if (botOrCh && botOrCh.channels && botOrCh.channels.fetch) {
		let ch = await botOrCh.channels.fetch(config.channels.debug)
			.catch(err=>console.log(`Cannot send debug message: ` + err))
		if (!ch || !ch.send) return
		await ch.send(str).catch(err=>console.log(`Cannot send debug message: ` + err))
	} else console.log(`Cannot send debug message: argument error`)
}

util.catch = function(err, botOrCh) {
	msg = (typeof(err) === 'string') ? err : `${err.name}: ${err.message}`
	util.debugSend('error', msg, botOrCh)
}

util.checkAdmin = function(msg) {
	if (!msg.member.roles.cache.has(config.expRoles.find(r=>r.abbr==="admin").id)) {
		strs = {
			'EN': 'Only Admins can use this.',
			'ZH': '此功能僅限管理員使用。'
		}
		msg.channel.send(util.getLangStr(msg, strs))
		return false
	} else return true
}

util.checkChannel = function(msg) {
	chs = [config.channels.spam, config.channels.cmd, config.channels.debug]
	if (!chs.includes(msg.channel.id)) {
		strs = {
			'EN': 'You cannot use this in this channel.',
			'ZH': '此功能不可在此頻道使用。'
		}
		msg.channel.send(util.getLangStr(msg, strs))
		return false
	} else return true
}

util.checkMember = function(msg) {
	return !msg.author.bot && msg.guild
}

module.exports = util