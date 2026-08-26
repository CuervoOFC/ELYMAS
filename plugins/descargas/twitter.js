/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/descargas/twitter.js
ʚĭɞ ೃ funcion :: Descargar fotos, GIFs y videos de Twitter/X 
──────✧✦✧──────
*/

import fetch from 'node-fetch'

const API_KEY = 'CuervoOFC'

async function uploadToEvogb(targetUrl) {
    try {
        const uploadApi = `https://api.evogb.org/tools/upload?server=evogb&method=url&url=${encodeURIComponent(targetUrl)}&author=EvogbApi&urlMode=default&charType=alphanumeric&expireValue=0&undefined=on&expireUnit=day&unlockDurationValue=7&unlockDurationUnit=day&key=${API_KEY}`
        const res = await fetch(uploadApi)
        const json = await res.json()
        if (json.status && json.url) {
            return json.url
        }
        return targetUrl
    } catch {
        return targetUrl
    }
}

export default {
    command: ['twitter', 'tw', 'x', 'xdl', 'twdl'],

    async run(m, { conn, args, usedPrefix, command }) {
        const url = args[0]

        if (!url) {
            return m.reply(
                `⚠️ *¡Falta el enlace de Twitter / X!*\n\n` +
                `📌 *Uso:* \`${usedPrefix + command} <enlace>\`\n` +
                `💡 *Ejemplo:* \`${usedPrefix + command} https://x.com/usuario/status/123456789\``
            )
        }

        if (!/x\.com|twitter\.com/i.test(url)) {
            return m.reply('❌ *El enlace proporcionado no pertenece a Twitter / X.*')
        }

        await m.reply('⏳ *Descargando y procesando el archivo...*')

        try {
            const apiUrl = `https://api.evogb.org/dl/twitter?url=${encodeURIComponent(url)}&key=${API_KEY}`
            const res = await fetch(apiUrl)
            const json = await res.json()

            if (!json.status || !json.data || !json.data.result || json.data.result.length === 0) {
                return m.reply('❌ *No se encontró contenido multimedia o la API no respondió.*')
            }

            const { title, type, result, duration } = json.data
            const cleanTitle = title && title !== '-' ? title.replace(/&#x27;/g, "'") : 'Sin título'
            
            const caption = `✨ *DESCARGA DE TWITTER / X* ✨\n\n` +
                            `📌 *Título:* ${cleanTitle}\n` +
                            `📂 *Tipo:* ${type.toUpperCase()}` +
                            `${duration && duration !== '-' ? `\n⏱️ *Duración:* ${duration}` : ''}`

            if (type === 'video') {
                // Selecciona la mejor calidad (primera opción del array de objetos)
                const videoItem = Array.isArray(result) ? result[0] : result
                const rawVideoUrl = typeof videoItem === 'object' ? videoItem.url : videoItem

                // Sube la URL del video a Evogb para generar la URL procesable
                const directVideoUrl = await uploadToEvogb(rawVideoUrl)

                await conn.sendMessage(
                    m.chat,
                    {
                        video: { url: directVideoUrl },
                        caption: caption,
                        mimetype: 'video/mp4'
                    },
                    { quoted: m }
                )
            } else {
                // Caso de imágenes o GIFs
                for (const item of result) {
                    const mediaUrl = typeof item === 'object' ? item.url : item
                    
                    // Si el archivo es un GIF, se sube y envía como video/gif
                    if (mediaUrl.includes('.gif') || type === 'gif') {
                        const directGifUrl = await uploadToEvogb(mediaUrl)
                        await conn.sendMessage(
                            m.chat,
                            {
                                video: { url: directGifUrl },
                                gifPlayback: true,
                                caption: caption
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
            }

        } catch (error) {
            console.error('Error en descarga de Twitter:', error)
            return m.reply('❌ *Ocurrió un error al procesar la descarga.*')
        }
    }
}
