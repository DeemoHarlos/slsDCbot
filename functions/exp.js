const util = require('../util.js')
const config = require('../config.js')
const urlRegex = require('url-regex')

const userSchema = require('../schemas/user.js')
const channelSchema = require('../schemas/channel.js')
const { Client } = require('discord.js')

const expTable = [
	    60,    130,    210,    300,    400,    520,    660,    820,   1000,    1200,
	  1470,   1850,   2350,   2980,   3760,   4690,   5780,   7040,   8480,   10100,
	 11910,  13910,  16110,  18510,  21120,  23940,  26980,  30230,  33710,   37410,
	 41340,  45500,  49900,  54540,  59420,  64550,  69920,  75540,  81420,   87550,
	 93940, 100590, 107510, 114690, 122140, 129860, 137850, 146120, 154660,  163480,
	172590, 181980, 191650, 201610, 211860, 222400, 233240, 244370, 255800,  267530,
	279560, 291890, 304520, 317460, 330710, 344270, 358140, 372320, 386810,  401620,
	416750, 432190, 447960, 464050, 480460, 497200, 514260, 531650, 549370,  567420,
	585800, 604520, 623570, 642960, 662690, 682750, 703150, 723900, 744990,  766420,
	788200, 810330, 832810, 855630, 878810, 902340, 926220, 950460, 975050, 1000000
]
const expDelta = 25000

function level(exp) {
	let lv = 0
	for (expNeeded of expTable)
		if (exp >= expNeeded) lv++
	if (lv >= expTable.length)
		return Math.floor((exp - expTable[expTable.length-1])/expDelta) + expTable.length
	return lv
}

function levelExp(level) {
	if (level <= 0) return 0
	if (level <= expTable.length) return expTable[level-1]
	return expTable[expTable.length-1] + (level-expTable.length) * expDelta
}

function checkLevelup(msg, bot, user, a, b) {
	if(level(b) > level(a))
		msg.channel.send(`${user} has leveled up to LV ${level(b)} !`)
}

function addExp(msg, bot, db) {
	let Channel = db.model('Channel', channelSchema)
	Channel.findOne({channelId: msg.channel.id}, (err,doc)=>{
		if (err) util.debugSend('DB-error', `(addExp) Find Channels error: ${err}`, bot)
		let incr = doc ? doc.expRatio : config.expRate
		if (isNaN(incr) || incr <= 0) return
		let User = db.model('User', userSchema)
		User.findOneAndUpdate({ userId: msg.author.id }, { $inc: { exp: incr } },
			{ upsert: true, new: true }, (err,doc)=>{
			if (err) return util.debugSend('DB-error', `(addExp) Update Users error: ${err}`, bot)
			if (msg.channel.id === config.channels.debug)
				msg.channel.send(`${msg.author} has gained ${incr} exp, and has ${doc.exp} exp now.`)
			checkLevelup(msg, bot, msg.author, doc.exp-incr, doc.exp)
		})
	})
}

function addExpTo(msg, bot, db) {
	let words = msg.content.split(' ')
	var incr = Number(words[2])
	if (!msg.mentions.members.size || isNaN(incr)) {
		msg.channel.send(`Invalid arguments. Usage: \`${config.prefix}exp add [EXP] [member]\` where EXP is a positive integer.`)
	} else msg.mentions.members.tap(member=>{
		if (member.user.bot) msg.channel.send(`Cannot add exp to bot ${member}.`)
		else {
			let User = db.model('User', userSchema)
			User.findOneAndUpdate({userId: member.id}, {$inc: {exp: incr}},
				{upsert: true, new: true}, (err,doc)=>{
				if (err) msg.channel.send(`Update Users error: ${err}`)
				else {
					msg.channel.send(`${msg.author} has gained ${incr} exp, and has ${doc.exp} exp now.`)
					checkLevelup(msg, bot, member, doc.exp-incr, doc.exp)
				}
			})
		}
	})
}

function addExpToId(msg, bot, db) {
	let words = msg.content.split(' ')
	var incr = Number(words[2])
	var id = words[3]
	console.log(id)
	if (isNaN(incr)) {
		msg.channel.send(`Invalid arguments. Usage: \`${config.prefix}exp add [EXP] [member]\` where EXP is an integer.`)
	} else bot.guilds.resolve(config.guildId).members.fetch(id).then(member=>{
		if (member.user.bot) msg.channel.send(`Cannot add exp to bot ${member}.`)
		else {
			let User = db.model('User', userSchema)
			User.findOneAndUpdate({userId: member.id}, {$inc: {exp: incr}},
				{upsert: true, new: true}, (err,doc)=>{
				if (err) msg.channel.send(`Update Users error: ${err}`)
				else {
					msg.channel.send(`${id} has gained ${incr} exp, and has ${doc.exp} exp now.`)
					// checkLevelup(msg, bot, member, doc.exp-incr, doc.exp)
				}
			})
		}
	})
}

function setChannelExp(msg, bot, db) {
	var words = msg.content.split(' ')
	var r = Number(words[2])
	if (!msg.mentions.channels.size || !(r>=0 && r<1000)) {
		msg.channel.send(`Invalid arguments. Usage: \`${config.prefix}exp setRatio [ratio] [channels]\` where ratio is a non negative integer less than 1000`)
	} else msg.mentions.channels.each(ch => {
		let Channel = db.model('Channel', channelSchema)
		Channel.findOneAndUpdate({channelId: ch.id}, {expRatio: r},
			{upsert: true, new: true}, (err,doc)=>{
			if (err) msg.channel.send(`Update Channels error: ${err}`)
			else msg.channel.send(`Successfully changed exp ratio of channel ${ch} to ${doc.expRatio}。`)
		})
	})
}

function listChannelExp(msg, bot, db) {
	let Channel = db.model('Channel', channelSchema)
	Channel.find(async (err, docs)=>{
		if (err) msg.channel.send(`Find Channels error: ${err}`)
		else {
			var str = `**[ Channel Exp Ratio List ]**\nDefault : ${config.expRate}\n`
			for (e of docs) {
				str += `${await bot.channels.fetch(e.channelId)} : ${e.expRatio}\n`
			}
			msg.channel.send(str)
		}
	})
}

async function addHistoryExp(ch, ratio, updates, msg) {
	let lastId = 0
	const max = 100
	let total = 0
	let options = { limit: max }

	while (true) {
		if (lastId) options.before = lastId
		const messages = await ch.messages.fetch(options)
		if (!messages.size) break
		messages.each(msg=>{
			var incr = ratio
			if (msg.author.bot) return
			let update = updates.find(user=>user.id === msg.author.id)
			if (!update) {
				update = { id: msg.author.id, exp: incr }
				updates.push(update)
			} else update.exp += incr
		})
		total += messages.size
		lastId = messages.last().id
		if (messages.size < max) break
	}
	return total
}

async function initExp(msg, bot, db) {
	util.debugSend('warn', `Use this only after you have reset EXP.`, msg.channel)
	updates = []
	let guild = bot.guilds.resolve(config.guildId)
	await guild.members.fetch() // get all the members

	// role exp
	for (let r of config.expRoles) {
		let incr = r.exp
		let role = await guild.roles.fetch(r.id)
		util.debugSend('info', `Adding ${incr} EXP to all ${r.name}.`, msg.channel)
		role.members.each(member=>{
			if (member.user.bot) return
			let update = updates.find(user=>user.id === member.id)
			if (!update) {
				update = { id: member.id, exp: incr }
				updates.push(update)
			} else update.exp += incr
		})
	}

	util.debugSend('info', `Searching history messages...`, msg.channel)
	// history messages
	let Channel = db.model('Channel', channelSchema)
	for (let ch of guild.channels.cache.array()) {
		if (ch.type !== 'text'|| !ch.messages) continue
		let channel = await Channel.findOne({ channelId: ch.id }).exec().catch(err=>{
			util.debugSend('DB-error', `(addHistoryExp) Find Channels error: ${err}`, msg.channel)
		})
		let ratio = (channel && !isNaN(channel.expRatio)) ? channel.expRatio : config.expRate
		if (!ratio) continue
		let total = await addHistoryExp(ch, config.expRate, updates, msg)
		util.debugSend('info', `History exp added for channel ${ch} with ${total} messages.`, msg.channel)
	}
	util.debugSend('info', `History messages exp added.`, msg.channel)

	util.debugSend('info', `Updating to Database...`, msg.channel)
	// update to db
	let User = db.model('User', userSchema)
	for (let update of updates) {
		await User.findOneAndUpdate({ userId: update.id }, { $inc: { exp: update.exp } },
			{ upsert: true, new: true }).exec().catch(err=>{
			util.debugSend('DB-error', `(addHistoryExp) Update Users error: ${err}`, msg.channel)
		})
	}
	util.debugSend('info', `Updating to Database succeeded.\nExp initialization complete!`, msg.channel)
}

function initReset(msg, bot, db) {
	let User = db.model('User', userSchema)
	User.collection.drop((err,res)=>{
		if (err) msg.channel.send(`Drop Users error: ${err}`)
		else msg.channel.send(`Exp has reset.`)
	})
}

function resetRatio(msg, bot, db) {
	let Channels = db.model('Channel', channelSchema)
	Channels.collection.drop((err,res)=>{
		if (err) msg.channel.send(`Drop Channels error: ${err}`)
		else msg.channel.send(`Exp ratio has reset.`)
	})
}

function showExp(msg, bot, db) {
	let target = msg.mentions.members.size ? msg.mentions.members.first() : msg.member
	let User = db.model('User', userSchema)
	User.find((err, docs)=>{
		if (err) msg.channel.send(`Find Users error: ${err}`)
		else {
			//set rank
			docs.sort((a,b)=>(b.exp - a.exp))
			var rank = 0
			var exp = -1
			docs.forEach((e,i,a)=>{
				if (exp === e.exp) e.rank = rank
				else {
					rank = i + 1
					exp = e.exp
					e.rank = rank
				}
			})
			let doc = docs.find(e=>e.userId === target.id)
			doc = doc || {exp: 0, rank: docs.length + 1}
			let str = `${target}\n`
			str += `[ **LV ${level(doc.exp)}** ]     `
			str += `**RANK ${doc.rank <= 3 ? `:small_orange_diamond:` : `:white_small_square:`}#${doc.rank}**     `
			str += `EXP \`${`${doc.exp}`.padStart(8, ' ')}\`\n`
			let  curLevelExp = levelExp(level(doc.exp)  )
			let nextLevelExp = levelExp(level(doc.exp)+1)
			str += `Level Progress : \`${`${doc.exp - curLevelExp}`.padStart(8, ' ')} / `
			str += `${`${nextLevelExp - curLevelExp}`.padStart(8, ' ')}  `
			str += `( ${((doc.exp - curLevelExp) / (nextLevelExp - curLevelExp) * 100).toFixed(2).padStart(5, ' ')}% )\``
			msg.channel.send(str)
		}
	})
}

function showTop(msg, bot, db) {
	var page = Number(msg.content.split(' ')[2]) || 1
	let User = db.model('User', userSchema)
	User.find(async (err, docs)=>{
		if (err) msg.channel.send(`Find Users error: ${err}`)
		else {
			var str = `**[ Member Rank ]** PAGE ${page}/${Math.ceil(docs.length/10)}\n`
			let guild = bot.guilds.resolve(config.guildId)
			let start = (page - 1) * 10 + 0
			docs.sort((a,b)=>(b.exp - a.exp))
			//set rank
			var rank = 0
			var exp = -1
			docs.forEach((e,i,a)=>{
				if (exp === e.exp) e.rank = rank
				else {
					rank = i + 1
					exp = e.exp
					e.rank = rank
				}
			})
			let sliced = docs.slice(start,start + 10)
			if (sliced.length) {
				for (e of sliced) {
					let member = await guild.members.fetch(e.userId).catch(()=>{})
					let substr = `${e.rank <= 3 ? `:small_orange_diamond:` : `:white_small_square:`}`
					substr += `**#${e.rank}**   `
					substr += `[ **LV ${level(e.exp)}** ]  `
					if (member)
						substr += `${member.nickname ? member.nickname : member.user.username}`
					else {
						try {
							let user = await bot.users.fetch(e.userId)
							substr += `${user.username} *(Left)*`
						} catch {
							substr += '*(Deleted)*'
						}
					}
					str += substr + '\n'
				}
				msg.channel.send(str)
			} else msg.channel.send(`Out of range. Total page number is ${Math.ceil(docs.length/10)}`)
		}
	})
}

module.exports = function(bot, db) {
	bot.on('message', msg => {
		// Ignore bot messages and non-guild messages.
		if (!util.checkMember(msg)) return

		// add exp auto
		if (msg.channel.type === 'text') addExp(msg, bot, db)

		let cmd = util.cmd(msg)
		if (!cmd) return
		if (cmd[0] === 'exp') {
			// set channel exp ratio
			if (cmd[1] === 'setRatio')
				if (util.checkAdmin(msg) && util.checkChannel(msg))
					setChannelExp(msg, bot, db)

			// list exp ratio
			if (cmd[1] === 'showRatio')
				if (util.checkChannel(msg))
					listChannelExp(msg, bot, db)

			// init exp
			if (cmd[1] === 'init')
				if (util.checkAdmin(msg) && util.checkChannel(msg))
					initExp(msg, bot, db)

			// reset exp
			if (cmd[1] === 'reset')
				if (util.checkAdmin(msg) && util.checkChannel(msg))
					initReset(msg, bot, db)

			// reset exp
			if (cmd[1] === 'resetRatio')
				if (util.checkAdmin(msg) && util.checkChannel(msg))
					resetRatio(msg, bot, db)

			// add exp manual
			if (cmd[1] === 'add')
				if (util.checkAdmin(msg) && util.checkChannel(msg))
					addExpTo(msg, bot, db)

			// add exp manual2
			if (cmd[1] === 'addById')
				if (util.checkAdmin(msg) && util.checkChannel(msg))
					addExpToId(msg, bot, db)

			// show exp
			if (cmd[1] === 'show')
				if (util.checkChannel(msg))
					showExp(msg, bot, db)

			// show top users
			if (cmd[1] === 'top')
				if (util.checkChannel(msg))
					showTop(msg, bot, db)
		}
	})
}