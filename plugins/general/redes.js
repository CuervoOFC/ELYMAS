/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ r
ʚĭɞ ೃ codigo :: plugins/general/redes.js
ʚĭɞ ೃ funcion :: Muestra enlaces oficiales del creador y comunidad
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

export default {
    command: ['redes', 'comunidad', 'soporte'],

    async run(m, { conn }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const botName = botData.name || config.botName || 'Elymas-Bot'
        const mediaUrl = botData.mediaUrl
        const mediaType = botData.mediaType

        const texto = `
╭━━━━━━━━━━━━━━━━━━━━╮
┃ 🌐 *COMUNIDAD OFICIAL* 🌐
╰━━━━━━━━━━━━━━━━━━━━╯

🤖 Bot: *${botName}*

👑 *Creador Oficial:*
https://wa.me/818021404021 *(The Devil)*

🛠️ *Soporte Oficial:*
https://wa.me/79887221906 *(CuervoOFC)*

👥 *Grupo Oficial Elymas:*
https://chat.whatsapp.com/IehaeGCe6KlCQuIkImVg7J

📢 *Canal Oficial CuervoOFC:*
https://whatsapp.com/channel/0029VaMi8cn9cDDQaoeY7P3u
`.trim()

        if (mediaUrl) {
            if (mediaType === 'video') {
                await conn.sendMessage(
                    m.chat,
                    {
                        video: { url: mediaUrl },
                        caption: texto,
                        ptv: true
                    },
                    { quoted: m }
                )
            } else {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: mediaUrl },
                        caption: texto
                    },
                    { quoted: m }
                )
            }
        } else {
            await m.reply(texto)
        }
    }
}
