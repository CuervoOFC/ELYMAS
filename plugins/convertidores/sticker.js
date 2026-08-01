/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ crumb codigo :: plugins/convertidores/sticker.js
ʚĭɞ ೃ funcion :: creacion de stickers con node-webpmux (sin dependencias C++)
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { downloadContentFromMessage } from '@itsliaaa/baileys'
import webp from 'node-webpmux'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'
const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'
const EVO_CONVERTER_API = 'https://api.evogb.org/api/converter-img'

async function streamToBuffer(stream) {
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
}

async function addExif(webpBuffer, packname, author) {
    const img = new webp.Image()
    await img.load(webpBuffer)

    const json = {
        'sticker-pack-id': 'CuervoTeam',
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': ['🤖']
    }

    const exifHeader = Buffer.from([0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8')
    const exif = Buffer.concat([exifHeader, jsonBuffer])
    exif.writeUIntLE(jsonBuffer.length, 14, 4)

    img.exif = exif
    return await img.save(null)
}

export default {
    command: ['sticker', 's', 'stiker'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const defaultPackname = botData.name || config.botName || 'Cuervo'
        const defaultAuthor = botData.ownerName || config.ownerName || 'TheDevil'

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

            let mediaUrl = ''

            // Subida a servidor para conversión limpia
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
                if (json.status && json.url) mediaUrl = json.url
                else throw new Error('Falló subida a EvoGB')
            } catch (evoErr) {
                const formData = new FormData()
                const ext = mime.split('/')[1]?.split(';')[0] || 'jpg'
                const blob = new Blob([mediaBuffer], { type: mime })
                formData.append('file', blob, `file.${ext}`)

                const res = await fetch(STELLAR_UPLOAD_API, {
                    method: 'POST',
                    body: formData
                })
                const json = await res.json()
                if (json.success && json.file?.publicUrl) mediaUrl = json.file.publicUrl
                else throw new Error('Los servidores de subida fallaron.')
            }

            // Convertir a WebP con la API Converter
            const convertUrl = `${EVO_CONVERTER_API}?method=url&url=${encodeURIComponent(mediaUrl)}&width=none&height=none&to=webp&key=${EVO_KEY}`
            const webpRes = await fetch(convertUrl)
            if (!webpRes.ok) throw new Error(`La API Converter devolvió status ${webpRes.status}`)

            const rawWebpBuffer = Buffer.from(await webpRes.arrayBuffer())

            // Procesar metadatos de packname / autor
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

            // Inyectar metadatos con node-webpmux
            const finalStickerBuffer = await addExif(rawWebpBuffer, packname, author)

            return await conn.sendMessage(
                m.chat,
                { sticker: finalStickerBuffer },
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
