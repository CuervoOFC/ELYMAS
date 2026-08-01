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
ʚĭɞ ೃ funcion :: creacion de stickers locales usando sticker-craft
ʚĭɞ r estado :: completo
──────✧✦✧──────
*/

import { downloadContentFromMessage } from '@itsliaaa/baileys'
import { Sticker } from 'sticker-craft'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

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

        await m.reply(
            '╭━━━〔 ⏳ *GENERANDO* 〕━━━⬣\n' +
            '┃ 🖼️ Procesando sticker localmente...\n' +
            '╰━━━━━━━━━━━━━━━━━━━━⬣'
        )

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

            const sticker = new Sticker(mediaBuffer, {
                pack: packname,
                author: author,
                type: 'full'
            })

            const stickerBuffer = await sticker.toBuffer()

            return await conn.sendMessage(
                m.chat,
                { sticker: stickerBuffer },
                { quoted: m }
            )

        } catch (error) {
            console.error('❌ Error en sticker.js:', error)
            return m.reply(
                '╭─「 ❌ *ERROR EN STICKER* 」\n' +
                '│\n' +
                '│ Hubo un error al convertir el archivo a sticker.\n' +
                `│ 📄 Detalle: ${error.message || error}\n` +
                '╰──────────────'
            )
        }
    }
}
