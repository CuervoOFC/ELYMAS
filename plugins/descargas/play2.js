/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/descargas/play2.js
ʚĭɞ ೃ funcion :: descarga de youtube en mp4
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

const EVO_KEY = 'evogb-WzR3kPpa'
const STELLAR_KEY = 'api-COTah'

const SEARCH_API = 'https://api.evogb.org/search/yt'
const EVO_DOWNLOAD_API = 'https://api.evogb.org/dl/ytmp4'
const STELLAR_DOWNLOAD_API = 'https://api.stellarwa.xyz/dl/ytmp4'

export default {
    command: [
        'play2',
        'playvideo'
    ],

    async run(m, { conn, args }) {
        if (!args || args.length === 0) {
            return m.reply(
                '╭─「 🎬 *YOUTUBE MP4* 」\n' +
                '│\n' +
                '│ ❌ Escribe el nombre o enlace de un video.\n' +
                '│\n' +
                '│ 📌 Ejemplos:\n' +
                '│ .play2 nombre del video\n' +
                '│ .play2 https://youtu.be/xxxxxx\n' +
                '╰──────────────'
            )
        }

        const fullText = args.join(' ')
        let query = fullText

        // Limpieza básica por si incluyen comas extra
        const parts = fullText.split(',')
        if (parts.length > 1 && (parts[parts.length - 1].trim() === '1' || parts[parts.length - 1].trim() === '2')) {
            parts.pop()
            query = parts.join(',').trim()
        }

        if (!query) {
            return m.reply('❌ Escribe el nombre o enlace del video.')
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
                // Si es enlace directo
                videoUrl = query
                videoTitle = 'Video de YouTube'
            } else {
                // Búsqueda por texto
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

            // Mensaje de portada e información (Sin datos de API)
            const captionText = 
                '╭━━━〔 🎬 YOUTUBE VIDEO 〕━━━⬣\n' +
                `┃ 📌 *Título:* ${videoTitle}\n` +
                `┃ 👤 *Autor:* ${videoAuthor}\n` +
                `┃ ⏱️ *Duración:* ${videoDuration}\n` +
                `┃ 👀 *Vistas:* ${videoViews}\n` +
                '╰━━━━━━━━━━━━━━━━━━━━⬣\n\n' +
                '⏳ *Descargando video, por favor espera...*'

            if (videoCover) {
                await conn.sendMessage(m.chat, { image: { url: videoCover }, caption: captionText }, { quoted: m })
            } else {
                await m.reply(captionText)
            }

            // Función de descarga
            async function getVideoDl(apiChoice) {
                const endpoint = apiChoice === 1 ? EVO_DOWNLOAD_API : STELLAR_DOWNLOAD_API
                const key = apiChoice === 1 ? EVO_KEY : STELLAR_KEY
                const dlUrl = `${endpoint}?url=${encodeURIComponent(videoUrl)}&quality=auto&key=${key}`

                const res = await fetch(dlUrl)
                if (!res.ok) throw new Error(`HTTP Error ${res.status}`)
                
                const json = await res.json()
                if (!json.status || !json.data || !json.data.dl) throw new Error('Sin enlace de descarga')
                
                return json.data
            }

            let videoData = null

            // Respaldo silente de API
            try {
                videoData = await getVideoDl(1)
            } catch {
                videoData = await getVideoDl(2)
            }

            const finalTitle = videoData.title || videoTitle || 'video'

            // Envío del video MP4
            await conn.sendMessage(
                m.chat,
                {
                    video: { url: videoData.dl },
                    mimetype: 'video/mp4',
                    fileName: `${sanitizeFileName(finalTitle)}.mp4`,
                    caption: `🎬 *${finalTitle}*`
                },
                { quoted: m }
            )

        } catch (error) {
            console.error('❌ Error en play2:', error)
            return m.reply(
                '❌ Ocurrió un error al procesar el video.\n\n' +
                `📄 ${error instanceof Error ? error.message : 'Error desconocido'}`
            )
        }
    }
}

function sanitizeFileName(input) {
    return String(input || 'video')
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100) || 'video'
}
