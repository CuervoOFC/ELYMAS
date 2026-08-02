/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ 
ʚĭɞ codigo :: plugins/descargas/instagram.js
ʚĭɞ funcion :: Descargador de Instagram (Reels, Posts, Carruceles)
ʚĭɞ estado :: completo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const API_KEY = 'evogb-WzR3kPpa'

export default {
    command: ['instagram', 'ig', 'igdl', 'instagramdl'],

    async run(m, { conn, args }) {
        const text = args.join(' ')

        if (!text) {
            return m.reply(
                '╭─「 📸 *INSTAGRAM DOWNLOADER* 」\n' +
                '│\n' +
                '│ ❌ Ingresa el enlace de un Reel, Post o Video de Instagram.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:*\n' +
                '│ • `.ig https://www.instagram.com/reel/DbJODpEKZ2G/`\n' +
                '╰──────────────'
            )
        }

        const igRegex = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i
        if (!igRegex.test(text)) {
            return m.reply('❌ El enlace proporcionado no parece ser un enlace válido de Instagram.')
        }

        await m.reply('⏳ *Descargando contenido de Instagram...*')

        try {
            const apiUrl = `https://api.evogb.org/dl/instagram?url=${encodeURIComponent(text)}&key=${API_KEY}`
            const res = await fetch(apiUrl)
            
            if (!res.ok) {
                throw new Error(`La API respondió con estado ${res.status}`)
            }

            const json = await res.json()

            if (!json.status || !json.data || json.data.length === 0) {
                return m.reply('❌ No se pudo obtener el contenido. Asegúrate de que la publicación sea pública.')
            }

            const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
            const botData = getSubbotConfig(rawJid, config)
            const botName = botData.name || config.botName || 'Cuervo'

            const caption = `✨ *Contenido descargado con éxito*\n🤖 *Bot:* ${botName}`

            for (const item of json.data) {
                const mediaUrl = item.url
                const isVideo = item.type === 'video' || mediaUrl.includes('.mp4')

                if (isVideo) {
                    await conn.sendMessage(
                        m.chat,
                        { 
                            video: { url: mediaUrl }, 
                            caption: caption,
                            mimetype: 'video/mp4'
                        },
                        { quoted: m }
                    )
                } else {
                    await conn.sendMessage(
                        m.chat,
                        { 
                            image: { url: mediaUrl }, 
                            caption: caption 
                        },
                        { quoted: m }
                    )
                }
            }

        } catch (error) {
            console.error('❌ Error en instagram.js:', error)
            return m.reply(
                '❌ Hubo un error al procesar tu solicitud de Instagram.\n\n' +
                `📄 Detalle: ${error.message || error}`
            )
        }
    }
}
