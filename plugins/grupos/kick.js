/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/grupos/kick.js
ʚĭɞ funcion :: Eliminar a un participante del grupo
──────✧✦✧──────
*/

export default {
    command: ['kick', 'ban', 'eliminar', 'sacar'],

    async run(m, { conn, args }) {
        if (!m.isGroup) {
            return m.reply('❌ Este comando solo se puede usar en grupos.')
        }

        // Obtener la JID del usuario por: respuesta a mensaje, mención (@) o número en texto
        let targetJid = m.quoted?.sender 
            || m.mentionedJid?.[0] 
            || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null)

        if (!targetJid) {
            return m.reply('⚠️ Debes responder al mensaje de alguien, mencionarlo (@) o escribir su número.')
        }

        try {
            await conn.groupParticipantsUpdate(m.chat, [targetJid], 'remove')
            return m.reply(`✅ Usuario @${targetJid.split('@')[0]} eliminado con éxito.`, null, {
                mentions: [targetJid]
            })
        } catch (error) {
            console.error('❌ Error en kick.js:', error)
            return m.reply('❌ No se pudo eliminar al usuario. Asegúrate de que **soy administrador** del grupo.')
        }
    }
}
