/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/herramientas/ssweb.js
ʚĭɞ ೃ funcion :: captura de pantalla de sitios web via EvoGB API
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'

export default {
    command: ['ssweb', 'ss', 'webss', 'screenshot'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        let urlInput = args[0]?.trim()
        let device = args[1]?.toLowerCase() === 'mobile' ? 'mobile' : 'pc'

        if (!urlInput) {
            return m.reply(
                '╭─「 📸 *SSWEB SYSTEM* 」\n' +
                '│\n' +
                '│ ❌ Ingresa la URL a capturar.\n' +
                '│\n' +
                '│ 📌 *Ejemplos:*\n' +
                '│ • `.ssweb github.com`\n' +
                '│ • `.ssweb github.com mobile`\n' +
                '╰──────────────'
            )
        }

        if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
            urlInput = 'https://' + urlInput
        }

        await m.reply(`📸 *Tomando captura de pantalla (${device.toUpperCase()})...*`)

        try {
            const ssApiUrl = `https://api.evogb.org/tools/ssweb?url=${encodeURIComponent(urlInput)}&device=${device}&key=${EVO_KEY}`

            const captionText = 
                `╭━━━〔 📸 *WEB SCREENSHOT* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 🔗 *URL:* ${urlInput}\n` +
                `┃ 📱 *Dispositivo:* \`${device.toUpperCase()}\`\n` +
                `┃\n` +
                `🤖 Bot: *${botName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`

            return await conn.sendMessage(m.chat, {
                image: { url: ssApiUrl },
                caption: captionText
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en SSWeb:', error)
            return m.reply('❌ Ocurrió un error al tomar la captura de la página web.')
        }
    }
}
