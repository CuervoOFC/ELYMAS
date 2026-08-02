/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/grupos/link.js
ʚĭɞ funcion :: Generar y enviar el link de invitacion del grupo
──────✧✦✧──────
*/

export default {
    command: ['link', 'linkgroup', 'enlace'],

    async run(m, { conn }) {
        if (!m.isGroup) {
            return m.reply('❌ Este comando solo se puede usar en grupos.')
        }

        let isBotAdmin = false
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const participants = groupMetadata.participants || []
            
            const botJid = conn.user?.jid || conn.user?.id || ''
            const cleanBotJid = botJid.split(':')[0] + '@s.whatsapp.net'

            const botParticipant = participants.find(p => p.id === cleanBotJid || p.id === botJid)
            if (botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')) {
                isBotAdmin = true
            }
        } catch (e) {
            console.error('Error obteniendo metadata en link.js:', e)
        }

        if (!isBotAdmin) {
            return m.reply('❌ No puedo darte el enlace porque **no soy administrador** del grupo.')
        }

        try {
            const code = await conn.groupInviteCode(m.chat)
            const link = `https://chat.whatsapp.com/${code}`

            return m.reply(
                `╭─「 🔗 *LINK DEL GRUPO* 」\n` +
                `│\n` +
                `│ 📌 ${link}\n` +
                `│\n` +
                `╰──────────────`
            )
        } catch (error) {
            console.error('❌ Error en link.js:', error)
            return m.reply('❌ Hubo un error al obtener el enlace del grupo.')
        }
    }
}
