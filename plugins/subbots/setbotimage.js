/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/subbots/setbotimage.js
ʚĭɞ ೃ funcion :: cambiar foto del bot 
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import { saveSubbotConfig, validateSubbotOwner } from '../../lib/subbotconfig.js'

export default {
    command: ['setbotimage', 'setimagebot', 'setbotfoto', 'setfoto'],

    async run(m, { conn, text }) {
        const auth = validateSubbotOwner(m, conn)
        if (!auth.allowed) return m.reply(auth.reason)

        let imageUrl = ''

        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
            imageUrl = text.trim()
        } 
        else if (m.quoted && /image/.test(m.quoted.mtype || m.quoted.mediaType)) {
            return m.reply('⚠️ Por favor pasa un enlace directo de imagen (Ej: de Imgur/Catbox) o usa una URL directa.')
        }

        if (!imageUrl) {
            return m.reply(
                '❌ Debes ingresar una URL válida de imagen.\n\n' +
                'Ejemplo:\n' +
                '`.setbotimage https://i.imgur.com/ejemplo.jpg`'
            )
        }

        const botJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid

        saveSubbotConfig(botJid, { image: imageUrl })

        return m.reply(`✅ La imagen de este Subbot se ha actualizado correctamente.`)
    }
}
