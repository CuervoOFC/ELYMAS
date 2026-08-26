/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/descargas/spotify.js
ʚĭɞ ೃ funcion :: descarga de canciones de Spotify en mp3
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

const EVO_KEY = 'CuervoOFC'
const STELLAR_KEY = 'CuervoOFC'

const SEARCH_API = 'https://api.evogb.org/search/spotify'
const EVO_DOWNLOAD_API = 'https://api.evogb.org/dl/spotify'
const STELLAR_DOWNLOAD_API = 'https://api.stellarwa.xyz/dl/spotifyv2'

export default {
    command: [
        'spotify',
        'music'
    ],

    async run(m, { conn, args }) {
        if (!args || args.length === 0) {
            return m.reply(
                '╭─「 🟢 *SPOTIFY MUSIC* 」\n' +
                '│\n' +
                '│ ❌ Escribe el nombre o enlace de una canción.\n' +
                '│\n' +
                '│ 📌 Ejemplos:\n' +
                '│ .spotify Mafu\n' +
                '│ .spotify https://open.spotify.com/track/xxxxxx\n' +
                '╰──────────────'
            )
        }

        const query = args.join(' ').trim()

        try {
            let trackUrl = ''
            let trackTitle = ''
            let trackArtist = 'Desconocido'
            let trackAlbum = 'Desconocido'
            let trackDuration = 'Desconocida'
            let trackCover = null

            const isLink = /https?:\/\/open\.spotify\.com\/track\//i.test(query)

            if (isLink) {
                trackUrl = query
                trackTitle = 'Canción de Spotify'
            } else {

                const searchUrl = `${SEARCH_API}?query=${encodeURIComponent(query)}&key=${EVO_KEY}`
                const searchRes = await fetch(searchUrl)

                if (!searchRes.ok) throw new Error(`Error en la búsqueda (${searchRes.status})`)

                const searchData = await searchRes.json()
                if (!searchData.status || !Array.isArray(searchData.result) || searchData.result.length === 0) {
                    return m.reply('❌ No se encontraron resultados para tu búsqueda.')
                }

                const first = searchData.result[0]
                trackUrl = first.link
                trackTitle = first.title
                trackArtist = first.artist || 'Desconocido'
                trackCover = first.image || null
            }

            const captionText = 
                '╭━━━〔 🟢 SPOTIFY PLAY 〕━━━⬣\n' +
                `┃ 📌 *Título:* ${trackTitle}\n` +
                `┃ 👤 *Artista:* ${trackArtist}\n` +
                (trackAlbum !== 'Desconocido' ? `┃ 💿 *Álbum:* ${trackAlbum}\n` : '') +
                (trackDuration !== 'Desconocida' ? `┃ ⏱️ *Duración:* ${trackDuration}\n` : '') +
                '╰━━━━━━━━━━━━━━━━━━━━⬣\n\n' +
                '⏳ *Descargando canción, por favor espera...*'

            if (trackCover) {
                await conn.sendMessage(m.chat, { image: { url: trackCover }, caption: captionText }, { quoted: m })
            } else {
                await m.reply(captionText)
            }

            async function getSpotifyDl(apiChoice) {
                const isEvo = apiChoice === 1
                const endpoint = isEvo ? EVO_DOWNLOAD_API : STELLAR_DOWNLOAD_API
                const key = isEvo ? EVO_KEY : STELLAR_KEY
                const dlUrl = `${endpoint}?url=${encodeURIComponent(trackUrl)}&key=${key}`

                const res = await fetch(dlUrl)
                if (!res.ok) throw new Error(`HTTP Error ${res.status}`)

                const json = await res.json()
                if (!json.status || !json.data) throw new Error('Respuesta no válida de la API')

                const data = json.data
                const audioLink = data.url || data.dl
                if (!audioLink) throw new Error('Sin enlace de audio directo')

                return {
                    dl: audioLink,
                    title: data.name || data.title || trackTitle,
                    artist: data.artist || trackArtist
                }
            }

            let audioData = null

            try {
                audioData = await getSpotifyDl(1)
            } catch {
                audioData = await getSpotifyDl(2)
            }

            const finalTitle = `${audioData.artist} - ${audioData.title}`

            await conn.sendMessage(
                m.chat,
                {
                    audio: { url: audioData.dl },
                    mimetype: 'audio/mpeg',
                    fileName: `${sanitizeFileName(finalTitle)}.mp3`,
                    ptt: false
                },
                { quoted: m }
            )

        } catch (error) {
            console.error('❌ Error en spotify:', error)
            return m.reply(
                '❌ Ocurrió un error al procesar la canción de Spotify.\n\n' +
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
