/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/busquedas/ytsearch.js
ʚĭɞ funcion :: Búsqueda de videos en YouTube mediante API
──────✧✦✧──────
*/

const STELLAR_KEY = 'api-COTah'
const API_YT_SEARCH = 'https://api.stellarwa.xyz/search/yt'

export default {
    command: ['ytsearch', 'yts', 'ytdlsearch'],

    async run(m, { conn, text, usedPrefix, command }) {
        if (!text) {
            return m.reply(`🔍 *Por favor, ingresa el término o título a buscar.*\n\n📌 *Ejemplo:* \`${usedPrefix + command} Cuervoofc\``)
        }

        await m.reply('🔍 *Buscando resultados en YouTube...*')

        try {
            const url = `${API_YT_SEARCH}?query=${encodeURIComponent(text)}&key=${STELLAR_KEY}`
            const res = await fetch(url)

            if (!res.ok) throw new Error(`HTTP Error ${res.status}`)

            const json = await res.json()

            if (!json || !json.status || !json.result || json.result.length === 0) {
                return m.reply(`❌ No se encontraron resultados para: *${text}*`)
            }

            const results = json.result.slice(0, 10) // Muestra hasta 10 resultados
            const firstItem = results[0]

            let caption = `╭━━━〔 🎥 *YOUTUBE SEARCH* 〕━━━⬣\n`
            caption += `┃ 🔎 *Búsqueda:* ${text}\n`
            caption += `┃ 📊 *Resultados:* ${results.length}\n`
            caption += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`

            results.forEach((item, index) => {
                caption += `*${index + 1}. ${item.title}*\n`
                caption += `👤 *Canal:* ${item.autor || 'Desconocido'}\n`
                caption += `⏱️ *Duración:* ${item.duration || 'N/A'}\n`
                caption += `👁️ *Vistas:* ${item.views || '0'}\n`
                caption += `📅 *Subido:* ${item.uploaded || 'Desconocido'}\n`
                caption += `🔗 *Link:* ${item.url}\n\n`
            })
          
            if (firstItem.banner) {
                await conn.sendMessage(m.chat, {
                    image: { url: firstItem.banner },
                    caption: caption.trim()
                }, { quoted: m })
            } else {
                await m.reply(caption.trim())
            }

        } catch (error) {
            console.error('❌ Error en ytsearch:', error)
            return m.reply('❌ Ocurrió un error al realizar la búsqueda en YouTube.')
        }
    }
}
