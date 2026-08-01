/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/convertidores/sticker.js
ʚĭɞ ೃ funcion :: creacion de stickers usando la API Converter de EvoGB
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { downloadContentFromMessage } from '@itsliaaa/baileys'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'
const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'
const EVO_CONVERTER_API = 'https://api.evogb.org/api/converter-img'

// Helper para convertir el Stream de Baileys en un Buffer
async function streamToBuffer(stream) {
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
}

export default {
    command: ['sticker', 's', 'stiker'],

    async run(m, { conn, args }) {
        // 1. Configuración de nombres del Subbot / Owner
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const defaultPackname = botData.name || config.botName || 'Cuervo'
        const defaultAuthor = botData.ownerName || config.ownerName || 'TheDevil'

        // 2. Extraer mensaje objetivo
        const q = m.quoted ? m.quoted : m
        const rawMessage = q.message || q.msg || q

        const type = Object.keys(rawMessage).find(
            key => key === 'imageMessage' || key === 'videoMessage' || key === 'stickerMessage'
        )

        const mediaContent = rawMessage[type] || q

        if (!type && !q.mimetype) {
            return m.reply(
                '╭─「 🖼️ *STICKER MAKER* 」\n' +
                '│\n' +
                '│ ❌ Responde a una *imagen* o *video* con el comando.\n' +
                '│\n' +
                '│ 📌 *Ejemplos:*\n' +
                '│ • Responde a una imagen con `.s`\n' +
                '│ • Responde a una imagen con `.s Pack | Autor`\n' +
                '╰──────────────'
            )
        }

        const mime = mediaContent.mimetype || q.mimetype || ''

        if (mediaContent.seconds > 11) {
            return m.reply('❌ El video no puede durar más de 10 segundos.')
        }

        await m.reply('⏳ *Creando sticker...*')

        try {
            // 3. Descargar el archivo desde el mensaje
            let mediaBuffer
            try {
                const streamType = mime.split('/')[0]
                const stream = await downloadContentFromMessage(mediaContent, streamType)
                mediaBuffer = await streamToBuffer(stream)
            } catch (e) {
                if (typeof q.download === 'function') {
                    mediaBuffer = await q.download()
                }
            }

            if (!mediaBuffer || mediaBuffer.length === 0) {
                throw new Error('No se pudo extraer el archivo multimedia.')
            }

            // 4. SUBIDA INICIAL (EvoGB -> Respaldo StellarWA)
            let mediaUrl = ''

            try {
                const formData = new FormData()
                const ext = mime.split('/')[1]?.split(';')[0] || 'jpg'
                const blob = new Blob([mediaBuffer], { type: mime })
                formData.append('file', blob, `file.${ext}`)

                const res = await fetch(`${EVO_UPLOAD_API}?key=${EVO_KEY}`, {
                    method: 'POST',
                    body: formData
                })
                const json = await res.json()
                if (json.status && json.url) {
                    mediaUrl = json.url
                } else {
                    throw new Error('Falló subida a EvoGB')
                }
            } catch (evoErr) {
                console.log('⚠️ EvoGB upload falló. Probando StellarWA...', evoErr.message)

                const formData = new FormData()
                const ext = mime.split('/')[1]?.split(';')[0] || 'jpg'
                const blob = new Blob([mediaBuffer], { type: mime })
                formData.append('file', blob, `file.${ext}`)

                const res = await fetch(STELLAR_UPLOAD_API, {
                    method: 'POST',
                    body: formData
                })
                const json = await res.json()
                if (json.success && json.file?.publicUrl) {
                    mediaUrl = json.file.publicUrl
                } else {
                    throw new Error('Los dos servidores de subida fallaron.')
                }
            }

            // 5. CONVERTIR A WEBP USANDO API CONVERTER EVOGB
            const convertUrl = `${EVO_CONVERTER_API}?method=url&url=${encodeURIComponent(mediaUrl)}&width=none&height=none&to=webp&key=${EVO_KEY}`
            
            const webpRes = await fetch(convertUrl)
            if (!webpRes.ok) {
                throw new Error(`La API Converter devolvió status ${webpRes.status}`)
            }

            // Descargar el resultado en WebP directamente
            const webpBuffer = Buffer.from(await webpRes.arrayBuffer())

            // 6. Configurar Nombre del Pack y Autor personalizado
            const text = args.join(' ')
            let packname = defaultPackname
            let author = defaultAuthor

            if (text.includes('|')) {
                const [p, a] = text.split('|')
                if (p && p.trim()) packname = p.trim()
                if (a && a.trim()) author = a.trim()
            } else if (text.trim()) {
                packname = text.trim()
            }

            // 7. Enviar Sticker WebP generado a WhatsApp
            await conn.sendMessage(
                m.chat,
                {
                    sticker: webpBuffer,
                    packname: packname,
                    author: author
                },
                { quoted: m }
            )

        } catch (error) {
            console.error('❌ Error en sticker.js:', error)
            return m.reply(
                '❌ Hubo un error al convertir el archivo a sticker.\n\n' +
                `📄 Detalle: ${error.message || error}`
            )
        }
    }
}
