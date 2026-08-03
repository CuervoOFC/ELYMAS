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
ʚĭɞ r funcion :: cambiar foto o video del bot 
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { saveSubbotConfig, validateSubbotOwner } from '../../lib/subbotconfig.js'

export default {
    command: ['setbotimage', 'setimagebot', 'setbotfoto', 'setfoto', 'setbotvideo', 'setvideo'],

    async run(m, { conn, text }) {
        const auth = validateSubbotOwner(m, conn)
        if (!auth.allowed) return m.reply(auth.reason)

        let mediaUrl = ''

        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
            mediaUrl = text.trim()
        } 
        else if (m.quoted && /image|video/.test(m.quoted.mtype || m.quoted.mediaType)) {
            return m.reply('⚠️ Por favor pasa un enlace directo de la imagen o video (Ej: de Imgur/Catbox) o usa una URL directa.')
        }

        if (!mediaUrl) {
            return m.reply(
                '❌ Debes ingresar una URL válida de imagen o vídeo.\n\n' +
                'Ejemplos:\n' +
                '`.setbotimage https://i.imgur.com/ejemplo.jpg`\n' +
                '`.setbotvideo https://files.catbox.moe/ejemplo.mp4`'
            )
        }

        const isVideo = /\.(mp4|mov|avi|mkv|webm|gif)($|\?)/i.test(mediaUrl)
        const mediaType = isVideo ? 'video' : 'image'

        const botJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid

        saveSubbotConfig(botJid, { 
            mediaUrl: mediaUrl,
            mediaType: mediaType,
            image: mediaUrl 
        })

        return m.reply(`✅ El contenido multimedia (${mediaType.toUpperCase()}) de este Subbot se ha actualizado correctamente.`)
    }
}
