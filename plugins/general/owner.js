/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/general/owner.js
ʚĭɞ ೃ funcion :: ver info del bot
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

export default {
    command: ['owner', 'dueño', 'creador'],

    async run(m, { conn }) {

        const rawJid =
            conn?.user?.jid ||
            conn?.user?.id ||
            conn?.subBotJid ||
            ''

        const botData = getSubbotConfig(rawJid, config)

        const botName =
            botData.name ||
            config.botName ||
            'Cuervo'

        const ownerName =
            botData.ownerName ||
            config.ownerName ||
            'TheDevil'

        const ownerNumber =
            botData.ownerNumber ||
            config.ownerNumber ||
            '886958381686'

        const mediaUrl = botData.mediaUrl
        const mediaType = botData.mediaType

        const texto = `
╭━━━━━━━━━━━━━━━━━━╮
┃ 👑 *OWNER BOT* 👑
╰━━━━━━━━━━━━━━━━━━╯

🤖 Bot: *${botName}*

👤 Nombre:
${ownerName}

📱 Número:
https://wa.me/${ownerNumber}
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
                    {
                        quoted: m
                    }
                )
            } else {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: mediaUrl },
                        caption: texto
                    },
                    {
                        quoted: m
                    }
                )
            }
        } else {
            await m.reply(texto)
        }
    }
}
