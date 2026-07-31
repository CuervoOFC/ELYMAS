/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/busquedas/pinterest.js
ʚĭɞ ೃ funcion :: búsqueda y descarga de imagenes/videos de Pinterest
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

const STELLAR_KEY = 'api-COTah'
const BASE_API = 'https://api.stellarwa.xyz/search'

export default {
    command: [
        'pinterest',
        'pin',
        'pinterestvid',
        'pinvid'
    ],

    async run(m, { conn, args, usedPrefix, command }) {
        const text = args.join(' ').trim()

        if (!text) {
            return m.reply(
                '╭─「 📌 *PINTEREST SEARCH* 」\n' +
                '│\n' +
                '│ ❌ Ingresa lo que deseas buscar.\n' +
                '│\n' +
                '│ *Ejemplos de imágenes:*\n' +
                `│ ${usedPrefix}pinterest Cuervo\n` +
                `│ ${usedPrefix}pin anime wallpaper\n` +
                '│\n' +
                '│ *Ejemplos de videos:*\n' +
                `│ ${usedPrefix}pinterestvid Cuervo\n` +
                `│ ${usedPrefix}pinvid edit anime\n` +
                '╰──────────────'
            )
        }

        const isVideoSearch = ['pinterestvid', 'pinvid'].includes(command.toLowerCase())

        await m.reply(
            `🔎 *Buscando ${isVideoSearch ? 'videos' : 'imágenes'} en Pinterest...*\n` +
            `📌 Búsqueda: *${text}*`
        )

        try {
            if (isVideoSearch) {
                
                const url = `${BASE_API}/pinterestvideo?query=${encodeURIComponent(text)}&key=${STELLAR_KEY}`
                const response = await fetch(url)
                const data = await response.json()

                const videoList = data?.data?.videos
                if (!data.status || !videoList || videoList.length === 0) {
                    return m.reply('❌ No se encontraron videos para tu búsqueda.')
                }

                const selected = videoList[Math.floor(Math.random() * videoList.length)]

                await conn.sendMessage(
                    m.chat,
                    {
                        video: { url: selected.dl },
                        mimetype: 'video/mp4',
                        caption:
                            '╭━━━〔 📌 PINTEREST VIDEO 〕━━━⬣\n' +
                            `┃ 📝 Título: ${selected.title || text}\n` +
                            `┃ ❤️ Likes: ${selected.likes || 0}\n` +
                            `┃ ⏱️ Duración: ${selected.duration || 'Desconocida'}\n` +
                            '╰━━━━━━━━━━━━━━━━━━━━⬣'
                    },
                    { quoted: m }
                )
            } else {
                // Endpoint de Imágenes
                const url = `${BASE_API}/pinterest?query=${encodeURIComponent(text)}&key=${STELLAR_KEY}`
                const response = await fetch(url)
                const data = await response.json()

                const imageList = data?.data
                if (!data.status || !Array.isArray(imageList) || imageList.length === 0) {
                    return m.reply('❌ No se encontraron imágenes para tu búsqueda.')
                }

                const selected = imageList[Math.floor(Math.random() * imageList.length)]
                const imageUrl = selected.hd || selected.mini

                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: imageUrl },
                        caption:
                            '╭━━━〔 📌 PINTEREST IMAGE 〕━━━⬣\n' +
                            `┃ 👤 Usuario: ${selected.full_name || selected.username || 'Desconocido'}\n` +
                            `┃ 📝 Título: ${selected.title !== '-' ? selected.title : text}\n` +
                            `┃ ❤️ Likes: ${selected.likes || 0}\n` +
                            `┃ 👥 Seguidores: ${selected.followers || 0}\n` +
                            '╰━━━━━━━━━━━━━━━━━━━━⬣'
                    },
                    { quoted: m }
                )
            }

        } catch (error) {
            console.error('❌ Error Pinterest:', error)
            return m.reply(
                '❌ Ocurrió un error al realizar la búsqueda en Pinterest.\n\n' +
                `📄 ${error?.message || 'Error desconocido'}`
            )
        }
    }
}
