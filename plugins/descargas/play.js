/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/descargas/play.js
ʚĭɞ ೃ funcion :: descarga de youtube en mp3
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

const EVO_KEY = 'CuervoOFC'
const STELLAR_KEY = 'CuervoOFC'

const SEARCH_API = 'https://api.evogb.org/search/yt'
const EVO_DOWNLOAD_API = 'https://api.evogb.org/dl/ytmp3'
const STELLAR_DOWNLOAD_API = 'https://api.stellarwa.xyz/dl/ytmp3'

export default {
    command: [
        'play',
        'playaudio'
    ],

    async run(m, { conn, args }) {
        if (!args || args.length === 0) {
            return m.reply(
                '╭─「 🎵 *YOUTUBE PLAY* 」\n' +
                '│\n' +
                '│ ❌ Escribe el nombre o enlace de una canción.\n' +
                '│\n' +
                '│ 📌 Ejemplos:\n' +
                '│ .play nombre de la canción\n' +
                '│ .play https://youtu.be/xxxxxx\n' +
                '╰──────────────'
            )
        }

        const fullText = args.join(' ')
        let query = fullText

        const parts = fullText.split(',')
        if (parts.length > 1 && (parts[parts.length - 1].trim() === '1' || parts[parts.length - 1].trim() === '2')) {
            parts.pop()
            query = parts.join(',').trim()
        }

        if (!query) {
            return m.reply('❌ Escribe el nombre o enlace de la canción.')
        }

        try {
            let videoUrl = ''
            let videoTitle = ''
            let videoAuthor = 'Desconocido'
            let videoDuration = 'Desconocida'
            let videoViews = 'Desconocidas'
            let videoCover = null

            const isLink = /https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i.test(query)

            if (isLink) {
                
                videoUrl = query
                videoTitle = 'Canción de YouTube'
            } else {
                
                const searchUrl = `${SEARCH_API}?query=${encodeURIComponent(query)}&key=${EVO_KEY}`
                const searchRes = await fetch(searchUrl)

                if (!searchRes.ok) throw new Error(`Error en la búsqueda (${searchRes.status})`)

                const searchData = await searchRes.json()
                if (!searchData.status || !Array.isArray(searchData.result) || searchData.result.length === 0) {
                    return m.reply('❌ No se encontraron resultados para tu búsqueda.')
                }

                const first = searchData.result[0]
                videoUrl = first.url
                videoTitle = first.title
                videoAuthor = first.autor || first.author || 'Desconocido'
                videoDuration = first.duration || 'Desconocida'
                videoViews = first.views || 'Desconocidas'
                videoCover = first.image || first.thumbnail || first.cover || null
            }

            const captionText = 
                '╭━━━〔 🎵 YOUTUBE PLAY 〕━━━⬣\n' +
                `┃ 📌 *Título:* ${videoTitle}\n` +
                `┃ 👤 *Autor:* ${videoAuthor}\n` +
                `┃ ⏱️ *Duración:* ${videoDuration}\n` +
                `┃ 👀 *Vistas:* ${videoViews}\n` +
                '╰━━━━━━━━━━━━━━━━━━━━⬣\n\n' +
                '⏳ *Descargando audio, por favor espera...*'

            if (videoCover) {
                await conn.sendMessage(m.chat, { image: { url: videoCover }, caption: captionText }, { quoted: m })
            } else {
                await m.reply(captionText)
            }

            async function getAudioDl(apiChoice) {
                const endpoint = apiChoice === 1 ? EVO_DOWNLOAD_API : STELLAR_DOWNLOAD_API
                const key = apiChoice === 1 ? EVO_KEY : STELLAR_KEY
                const dlUrl = `${endpoint}?url=${encodeURIComponent(videoUrl)}&key=${key}`

                const res = await fetch(dlUrl)
                if (!res.ok) throw new Error(`HTTP Error ${res.status}`)
                
                const json = await res.json()
                if (!json.status || !json.data || !json.data.dl) throw new Error('Sin enlace de descarga')
                
                return json.data
            }

            let audioData = null

            try {
                audioData = await getAudioDl(1)
            } catch {
                audioData = await getAudioDl(2)
            }

            await conn.sendMessage(
                m.chat,
                {
                    audio: { url: audioData.dl },
                    mimetype: 'audio/mpeg',
                    fileName: `${sanitizeFileName(audioData.title || videoTitle)}.mp3`,
                    ptt: false
                },
                { quoted: m }
            )

        } catch (error) {
            console.error('❌ Error en play:', error)
            return m.reply(
                '❌ Ocurrió un error al procesar el audio.\n\n' +
                `📄 ${error instanceof Error ? error.message : 'Error desconocido'}`
            )
        }
    }
}

function sanitizeFileName(input) {
    return String(input || 'audio')
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100) || 'audio'
}
