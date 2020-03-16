const prefix     = '?'
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