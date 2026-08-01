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
ʚĭɞ ೃ funcion :: creacion de stickers via descarga / servidor de respaldo (EvoGB/StellarWA)
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { downloadContentFromMessage } from '@itsliaaa/baileys'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'
const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'

// Función auxiliar para convertir el Stream de Baileys en un Buffer real de Node.js sin fallos
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
        // 1. Datos dinámicos del Subbot
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const defaultPackname = botData.name || config.botName || 'Cuervo'
        const defaultAuthor = botData.ownerName || config.ownerName || 'TheDevil'

        // 2. Extraer mensaje objetivo
        const q = m.quoted ? m.quoted : m
        const rawMessage = q.message || q.msg || q

        // 3. Detectar tipo de multimedia y su nodo dentro de Baileys
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

        // Validar duración de videos
        if (mediaContent.seconds > 11) {
            return m.reply('❌ El video no puede durar más de 10 segundos.')
        }

        await m.reply('⏳ *Procesando sticker mediante servidor...*')

        try {
            // 4. DESCARGA MANUAL VÍA STREAMS (Evita el fallo de downloadMediaMessage)
            let mediaBuffer

            try {
                const streamType = mime.split('/')[0] // 'image' o 'video'
                const stream = await downloadContentFromMessage(mediaContent, streamType)
                mediaBuffer = await streamToBuffer(stream)
            } catch (e) {
                console.log('⚠️ Falló descarga directa por stream, intentando método de objeto...', e.message)
                if (typeof q.download === 'function') {
                    mediaBuffer = await q.download()
                }
            }

            if (!mediaBuffer || mediaBuffer.length === 0) {
                throw new Error('No se pudieron obtener los bytes del archivo.')
            }

            // 5. SUBIDA Y RESPALDO CON APIS (EvoGB -> StellarWA)
            let mediaUrl = ''

            // Intentar EvoGB
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
                    throw new Error('Respuesta inválida de EvoGB')
                }
            } catch (evoErr) {
                console.log('⚠️ EvoGB falló. Usando API de StellarWA como respaldo...', evoErr.message)
                
                // Respaldo StellarWA
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
                    throw new Error('Servidor StellarWA también falló.')
                }
            }

            // 6. Asignar metadatos
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

            // 7. Enviar el Sticker a WhatsApp usando el buffer o la URL procesada
            await conn.sendMessage(
                m.chat,
                {
                    sticker: mediaBuffer, // Si la red de Baileys lo acepta
                    packname: packname,
                    author: author
                },
                { quoted: m }
            )

        } catch (error) {
            console.error('❌ Error general al crear sticker:', error)
            return m.reply(
                '❌ Hubo un error al procesar la imagen/video.\n\n' +
                `📄 Detalle: ${error.message || error}`
            )
        }
    }
}
