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
ʚĭɞ ೃ funcion :: identificar música vía EvoGB Shazam API con subida a EvoGB Files
──────✧✦✧──────
*/

import axios from 'axios'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'

export default {
    command: ['shazam', 'whatmusic', 'quemusica', 'quecancion'],

    async run(m, { conn }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''

        if (!/audio|video/.test(mime)) {
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
            const mediaBuffer = await q.download()
            if (!mediaBuffer) {
                return m.reply('❌ No se pudo descargar el archivo de audio/video.')
            }
            const fileUrl = await uploadMediaToEvoGB(mediaBuffer, mime)
            if (!fileUrl) {
                return m.reply('❌ Error al subir el archivo multimedia a EvoGB.')
            }
            const apiUrl = `https://api.evogb.org/tools/whatmusic-shazam?method=url&url=${encodeURIComponent(fileUrl)}&key=${EVO_KEY}`
            const res = await axios.get(apiUrl, { timeout: 20000 })

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

            if (coverUrl) {
                await conn.sendMessage(m.chat, {
                    image: { url: coverUrl },
                    caption: captionText
                }, { quoted: m })
            } else {
                await m.reply(captionText)
            }
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

async function uploadMediaToEvoGB(buffer, mime) {
    try {
        const { FormData } = await import('form-data')
        const form = new FormData()
        const ext = mime.split('/')[1] || 'mp3'
        
        form.append('file', buffer, { 
            filename: `media_${Date.now()}.${ext}`, 
            contentType: mime 
        })

        const res = await axios.post('https://files.evogb.win/upload', form, {
            headers: form.getHeaders(),
            timeout: 15000
        })

        if (res.data?.url) {
            return res.data.url
        } else if (res.data?.data?.url) {
            return res.data.data.url
        }
        return null
    } catch (err) {
        console.error('❌ Error al subir archivo a EvoGB:', err?.message || err)
        return null
    }
}
