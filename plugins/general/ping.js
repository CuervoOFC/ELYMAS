/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/general/ping.js
ʚĭɞ ೃ funcion :: revisar velocidad del bot
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

export default {
    command: ['ping', 'p'],

    async run(m, { conn }) {

        const rawJid =
            conn?.user?.jid ||
            conn?.user?.id ||
            conn?.subBotJid ||
            ''

        const botData = getSubbotConfig(rawJid, config)

        const botName = botData.name || config.botName || 'Cuervo'

        const start = Date.now()

        await m.reply('🏓 Calculando ping...')

        const end = Date.now()

        const ping = end - start

        await m.reply(
            `🏓 *PONG!*\n\n` +
            `⚡ Velocidad: *${ping}ms*\n` +
            `🤖 Bot: *${botName}*`
        )
    }
}
