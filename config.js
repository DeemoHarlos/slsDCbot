const prefix     = '!'
const guildId    = '556850341971230772'
//const spmChannel = '676067274666410034'
const cmdChannel = '566602429118808079'
const dbgChannel = '688917430298607636'
const generalChannel = '556851195248115734'
const adminRole  = '556851386860699668'
const fanRole    = '688925818117816321'

module.exports = {
	prefix: prefix,
	guildId: guildId,
//	spmChannel: spmChannel,
	cmdChannel: cmdChannel,
	dbgChannel: dbgChannel,
	availChannels: [/*spmChannel, */cmdChannel, dbgChannel],
	generalChannel: generalChannel,
	adminRole: adminRole,
	fanRole: fanRole,
	fanRoleExp: 20000
}

module.exports = {
	prefix: process.env.NODE_ENV === 'production' ? '!' : '?',
	guildId: '556850341971230772',
	guildName: 'SLSMusic 粉絲社群',
	expRate: 10,
	channels: {
		spam:  '699747150283931659',
		cmd:   '566602429118808079',
		debug: '688917430298607636',
		general:'556851195248115734'
	},
	expRoles: [{
		name: 'Admin 管理員',
		abbr: 'admin',
		id: '556851386860699668',
		exp: 0
	},{
		name: 'SLSMusic 粉絲',
		abbr: 'fan',
		id: '688925818117816321',
		exp: 600,
		welcome: true
	}],
	lang: [{
		name: 'EN',
		role: '736842537779724308',
		channel: {
			general: '566600962756706304'
		}
	},{
		name: 'ZH',
		role: '736842470553288746',
		channel: {
			general: '556851195248115734'
		}
	}],
	fanpages: [{
		name: 'SLSMusic',
		id: 'slsmusictt',
		channel: '556858594482454528',
		pinRole: '688925818117816321'
	}]
}