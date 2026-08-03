/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot
━━━━━ ☾☽ ━━━━━
ʚĭɞ 💤 CODIGO JAVASCRIPT ʚĭɞ 💤
ʚĭɞ crumb codigo :: plugins/grupos/link.js
ʚĭɞ 💤 funcion :: Generar y enviar el link de invitacion del grupo
──────✧✦✧──────
*/

export default {
    command: ['link', 'linkgroup', 'enlace'],

    async run(m, { conn }) {
        if (!m.isGroup) {
            return m.reply('❌ Este comando solo se puede usar en grupos.')
        }

        try {
            // Se obtiene la metadata del grupo
            const groupMetadata = await conn.groupMetadata(m.chat)
            
            // Solicitar código de invitación directamente
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
            return m.reply('❌ No puedo darte el enlace porque **no soy administrador** del grupo.')
        }
    }
}
