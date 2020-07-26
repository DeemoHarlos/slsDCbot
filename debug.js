const util = require('./util.js')

const events = [
	'channelCreate',
	'channelDelete',
	'channelPinsUpdate',
	'channelUpdate',
	'debug',
	'emojiCreate',
	'emojiDelete',
	'emojiUpdate',
	'error',
	'guildBanAdd',
	'guildBanRemove',
	'guildCreate',
	'guildDelete',
	'guildIntegrationsUpdate',
	'guildMemberAdd',
	'guildMemberRemove',
	'guildMembersChunk',
	'guildMemberSpeaking',
	'guildMemberUpdate',
	'guildUnavailable',
	'guildUpdate',
	'invalidated',
	'inviteCreate',
	'inviteDelete',
	'message',
	'messageDelete',
	'messageDeleteBulk',
	'messageReactionAdd',
	'messageReactionRemove',
	'messageReactionRemoveAll',
	'messageReactionRemoveEmoji',
	'messageUpdate',
	'presenceUpdate',
	'rateLimit',
	'ready',
	'roleCreate',
	'roleDelete',
	'roleUpdate',
	'shardDisconnect',
	'shardError',
	'shardReady',
	'shardReconnecting',
	'shardResume',
	'typingStart',
	'userUpdate',
	'voiceStateUpdate',
	'warn',
	'webhookUpdate'
]

function debugLog(event, str) {
	console.log(`[ ${event} ]${str?`  ${str}`:''}`)
}

function debug(bot) {
	events.forEach(event=>{
		if (event === 'debug') {
			bot.on(event, info=>{ debugLog('debug', info) })
		} else if (event === 'error') {
			bot.on(event, ()=>{
				util.debugSend('DC-error', `${err.name}: ${err.message}`, bot)
			})
		} else bot.on(event, ()=>{ debugLog(event) })
	})
}

module.exports = debug