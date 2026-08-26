/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/herramientas/shazam.js
ʚĭɞ ೃ funcion :: identificar música vía EvoGB Shazam API con subida a EvoGB Upload API
──────✧✦✧──────
*/

import { downloadMediaMessage } from '@itsliaaa/baileys'
import axios from 'axios'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'CuervoOFC'
const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'

export default {
    command: ['shazam', 'whatmusic', 'quemusica', 'quecancion'],

    async run(m, { conn }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const q = m.quoted ? m.quoted : m
        const rawMessage = q.message || q.msg || q

        // Extracción exacta del mimetype al estilo upload.js
        const mime = (
            rawMessage.imageMessage?.mimetype ||
            rawMessage.videoMessage?.mimetype ||
            rawMessage.audioMessage?.mimetype ||
            rawMessage.documentMessage?.mimetype ||
            q.mimetype ||
            ''
        )

        // Validación permitiendo tanto audios como videos o documentos con audio
        const isMedia = /audio|video/.test(mime) || /audioMessage|videoMessage/.test(q.mtype || '')

        if (!isMedia) {
            return m.reply(
                '╭─「 🎵 *SHAZAM SYSTEM* 」\n' +
                '│\n' +
                '│ ❌ Responde a un *audio* o *video* corto para identificar la canción.\n' +
                '│\n' +
                '│ 📌 *Uso:* Responde al mensaje multimedia con `.shazam`\n' +
                '╰──────────────'
            )
        }

        await m.reply('🎧 *Escuchando y analizando audio con Shazam...*')

        try {
            // 1. Descarga del buffer implementando la fallback de upload.js
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

            if (!mediaBuffer) {
                return m.reply('❌ No se pudo descargar el archivo del mensaje respondido.')
            }

            // 2. Subir archivo a la API oficial de EvoGB Upload
            const fileUrl = await uploadToEvoGB(mediaBuffer, mime)
            if (!fileUrl) {
                return m.reply('❌ Error al subir el archivo multimedia a EvoGB.')
            }

            // 3. Consultar la API de EvoGB Shazam
            const apiUrl = `https://api.evogb.org/tools/whatmusic-shazam?method=url&url=${encodeURIComponent(fileUrl)}&key=${EVO_KEY}`
            const res = await axios.get(apiUrl, { timeout: 25000 })

            if (!res.data?.status || !res.data?.data?.info) {
                return m.reply('❌ No se encontró ninguna coincidencia para este audio.')
            }

            const { info, media, links, detection } = res.data.data

            const captionText = 
                `╭━━━〔 🎵 *MÚSICA DETECTADA* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 📌 *Título:* ${info.title || 'Desconocido'}\n` +
                `┃ 👤 *Artista:* ${info.artist || 'Desconocido'}\n` +
                `┃ 💿 *Álbum:* ${info.album || 'N/A'}\n` +
                `┃ 🗓️ *Año:* ${info.year || 'N/A'}\n` +
                `┃ 🎷 *Género:* ${info.genre || 'N/A'}\n` +
                `┃ 🏷️ *Sello:* ${info.label || 'N/A'}\n` +
                `┃ 🎯 *Coincidencia:* ${detection?.confidence?.percentage || 0}%\n` +
                `┃\n` +
                `┃ 🔗 *ENLACES*\n` +
                `┃ • Shazam: ${links?.shazam || 'N/A'}\n` +
                `┃\n` +
                `🤖 Bot: *${botName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`

            const coverUrl = media?.cover_hd || media?.cover

            // 4. Enviar imagen con portada HD e información
            if (coverUrl) {
                await conn.sendMessage(m.chat, {
                    image: { url: coverUrl },
                    caption: captionText
                }, { quoted: m })
            } else {
                await m.reply(captionText)
            }

            // 5. Enviar el audio de prueba si existe
            if (media?.preview_audio) {
                await conn.sendMessage(m.chat, {
                    audio: { url: media.preview_audio },
                    mimetype: 'audio/mp4',
                    ptt: false
                }, { quoted: m })
            }

        } catch (error) {
            console.error('❌ Error en Shazam/WhatMusic:', error)
            return m.reply('❌ Ocurrió un error al intentar identificar la canción.')
        }
    }
}

// Subida a EvoGB Upload API según la estructura de tu upload.js
async function uploadToEvoGB(buffer, mime) {
    try {
        const formData = new FormData()
        const ext = mime.split('/')[1]?.split(';')[0] || 'mp4'
        const blob = new Blob([buffer], { type: mime || 'video/mp4' })
        formData.append('file', blob, `file.${ext}`)

        const res = await fetch(`${EVO_UPLOAD_API}?key=${EVO_KEY}`, {
            method: 'POST',
            body: formData
        })

        if (!res.ok) return null

        const json = await res.json()
        if (json.status && json.url) {
            return json.url
        }
        return null
    } catch (err) {
        console.error('❌ Error al subir a EvoGB:', err)
        return null
    }
}
