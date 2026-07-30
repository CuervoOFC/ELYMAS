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

        const botImage = botData.image

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
        
        if (botImage) {
            await conn.sendMessage(
                m.chat,
                {
                    image: {
                        url: botImage
                    },
                    caption: texto
                },
                {
                    quoted: m
                }
            )
        } else {
            await m.reply(texto)
        }
    }
}
