/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/herramientas/hostinfo.js
ʚĭɞ ೃ funcion :: consulta de hosting/domain con captura de pantalla via EvoGB API
──────✧✦✧──────
*/

import axios from 'axios'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'

export default {
    command: ['hostinfo', 'host', 'domaininfo'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        let urlInput = args[0]?.trim()

        if (!urlInput) {
            return m.reply(
                '╭─「 🌐 *HOST INFO & SSWEB* 」\n' +
                '│\n' +
                '│ ❌ Ingresa la URL o dominio a analizar.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:* `.hostinfo google.com`\n' +
                '╰──────────────'
            )
        }

        if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
            urlInput = 'https://' + urlInput
        }

        await m.reply('🔍 *Analizando hosting y capturando sitio web...*')

        try {
            const hostApiUrl = `https://api.evogb.org/tools/hostinfo?domain=${encodeURIComponent(urlInput)}&key=${EVO_KEY}`
            const ssApiUrl = `https://api.evogb.org/tools/ssweb?url=${encodeURIComponent(urlInput)}&device=pc&key=${EVO_KEY}`

            const [hostRes] = await Promise.all([
                axios.get(hostApiUrl, { timeout: 15000 }).catch(() => null)
            ])

            if (!hostRes?.data?.status || !hostRes?.data?.info?.length) {
                return m.reply('❌ No se pudo obtener la información del host para el dominio especificado.')
            }

            const info = hostRes.data.info[0]

            const captionText = 
                `╭━━━〔 🌐 *HOSTING & DOMAIN INFO* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 🔗 *Dominio:* ${urlInput}\n` +
                `┃ 🖥️ *IP:* \`${info.ip || 'N/A'}\`\n` +
                `┃ 🏢 *Organización:* ${info.organisation || 'N/A'}\n` +
                `┃ 🌐 *ISP:* ${info.isp || 'N/A'}\n` +
                `┃ 📍 *Región:* ${info.region || 'N/A'}\n` +
                `┃ 🏙️ *Ciudad:* ${info.city || 'N/A'}\n` +
                `┃ 🕒 *Zona Horaria:* ${info.tzone || 'N/A'}\n` +
                `┃ 📮 *Código Postal:* ${info.pcode || 'N/A'}\n` +
                `┃\n` +
                `🤖 Bot: *${botName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`

            return await conn.sendMessage(m.chat, {
                image: { url: ssApiUrl },
                caption: captionText
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en HostInfo:', error)
            return m.reply('❌ Ocurrió un error al procesar la solicitud de HostInfo.')
        }
    }
}
