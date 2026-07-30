/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/general/menu.js
ʚĭɞ ೃ funcion :: menu general del bot
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

export default {
    command: ['menu', 'menú', 'help', 'inicio'],

    async run(m, { conn }) {
        const nombre = m.pushName || 'Usuario'

        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''

        const botData = getSubbotConfig(rawJid, config)

        const botName = botData.name || config.botName || 'Cuervo'
        const ownerName = botData.ownerName || config.ownerName || 'TheDevil'
        const botImage = botData.image

        const texto = `
╭━━━━━━━━━━━━━━━━━━╮
┃ *${botName.toUpperCase()}*
╰━━━━━━━━━━━━━━━━━━╯

👋 Hola, *${nombre}*

╭─〔 🤖 INFORMACIÓN 〕
│ ⚡ Bot: ${botName}
│ 👑 Owner: ${ownerName}
│ 🔧 Versión: ${config.version || '1.0.0'}
╰──────────────

╭─〔 ⚙️ GENERALES 〕
│ 🏓 ping
│ 📖 ayuda
│ 📋 menu
╰──────────────

╭─〔 🤖 SUBBOTS 〕
│ 🔗 jadibot
│ 🔑 code
│ 🤖 bots
│ 🛑 stopbot
│ ✏️ setbotname
│ ✏️ setowner
│ 🖼️ setbotimage
╰──────────────

╭─〔 👑 OWNER 〕
│ ➕ addowner
│ ➖ delowner
│ 🔄 restart
╰──────────────

╭─〔 💰 ECONOMÍA 〕
│ 💰 balance
│ 🎁 daily
│ 💼 work
╰──────────────

 *${botName.toUpperCase()}*
`

        if (botImage) {
            await conn.sendMessage(m.chat, {
                image: { url: botImage },
                caption: texto
            }, { quoted: m })
        } else {
            await m.reply(texto)
        }
    }
}
