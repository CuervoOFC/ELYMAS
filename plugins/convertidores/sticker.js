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
ʚĭɞ ೃ funcion :: creacion de stickers desde imagen o video
ʚĭɞ r estado :: completo
──────✧✦✧──────
*/

import { downloadMediaMessage } from '@itsliaaa/baileys'

// Datos por defecto para el Pack de Sticker
const DEFAULT_PACKNAME = 'Elymas-Bot'
const DEFAULT_AUTHOR = 'Cuervo-Team-Supreme'

export default {
    command: [
        'sticker',
        's',
        'stiker'
    ],

    async run(m, { conn, args }) {
        // Detectar si responde a un mensaje o es un mensaje directo
        const q = m.quoted ? m.quoted : m
        const rawMessage = q.message || q.msg || q

        // Detectar si es una Imagen o Video
        const mime = (
            rawMessage.imageMessage?.mimetype ||
            rawMessage.videoMessage?.mimetype ||
            q.mimetype ||
            ''
        )

        // Validar que sea un archivo multimedia compatible
        if (!mime || (!mime.includes('image') && !mime.includes('video'))) {
            return m.reply(
                '╭─「 🖼️ *STICKER MAKER* 」\n' +
                '│\n' +
                '│ ❌ Responde a una *imagen* o *video* con el comando.\n' +
                '│\n' +
                '│ 📌 *Ejemplos de Uso:*\n' +
                '│ • Responde a una imagen con `.s`\n' +
                '│ • Responde a una imagen con `.sticker NombrePack | Autor`\n' +
                '╰──────────────'
            )
        }

        // Si es video, validar que no dure demasiado (máx 10 segundos para WhatsApp)
        const duration = rawMessage.videoMessage?.seconds || 0
        if (duration > 11) {
            return m.reply('❌ El video no puede durar más de 10 segundos para convertirse en sticker.')
        }

        await m.reply('⏳ *Creando sticker, por favor espera...*')

        try {
            // Descargar el contenido multimedia usando la función nativa de Baileys
            let mediaBuffer
            try {
                mediaBuffer = await downloadMediaMessage(
                    q,
                    'buffer',
                    {},
                    { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
                )
            } catch (dlErr) {
                if (typeof q.download === 'function') {
                    mediaBuffer = await q.download()
                } else if (typeof conn.downloadMediaMessage === 'function') {
                    mediaBuffer = await conn.downloadMediaMessage(q)
                } else {
                    throw dlErr
                }
            }

            if (!mediaBuffer) throw new Error('No se pudo obtener el archivo del mensaje.')

            // Extraer nombre del pack y autor enviando texto opcional (ej: .s PackName | Author)
            const text = args.join(' ')
            let packname = DEFAULT_PACKNAME
            let author = DEFAULT_AUTHOR

            if (text.includes('|')) {
                const [p, a] = text.split('|')
                if (p && p.trim()) packname = p.trim()
                if (a && a.trim()) author = a.trim()
            } else if (text.trim()) {
                packname = text.trim()
            }

            // Enviar el sticker generado aprovechando el soporte nativo de envio de stickers de Baileys
            await conn.sendMessage(
                m.chat,
                {
                    sticker: mediaBuffer,
                    packname: packname,
                    author: author
                },
                { quoted: m }
            )

        } catch (error) {
            console.error('❌ Error al crear el sticker:', error)
            return m.reply(
                '❌ Ocurrió un error al intentar crear el sticker.\n\n' +
                `📄 ${error instanceof Error ? error.message : 'Error desconocido'}`
            )
        }
    }
}
