/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/descargas/twitter.js
ʚĭɞ ೃ funcion :: Descargar imagenes y videos de Twitter / X 
──────✧✦✧──────
*/

import fetch from 'node-fetch'

export default {
    command: ['twitter', 'tw', 'x', 'xdl', 'twdl'],

    async run(m, { conn, args, usedPrefix, command }) {
        const url = args[0]

        if (!url) {
            return m.reply(
                `⚠️ *¡Falta el enlace de Twitter / X!*\n\n` +
                `📌 *Uso:* \`${usedPrefix + command} <enlace>\`\n` +
                `💡 *Ejemplo:* \`${usedPrefix + command} https://x.com/username/status/123456789\``
            )
        }

        // Validar que sea un enlace válido de Twitter o X
        if (!/x\.com|twitter\.com/i.test(url)) {
            return m.reply('❌ *El enlace proporcionado no pertenece a Twitter / X.*')
        }

        await m.reply('⏳ *Procesando la descarga desde Twitter / X...*')

        try {
            const apiUrl = `https://api.evogb.org/dl/twitter?url=${encodeURIComponent(url)}&key=evogb-WzR3kPpa`
            const res = await fetch(apiUrl)
            const json = await res.json()

            if (!json.status || !json.data || !json.data.result || json.data.result.length === 0) {
                return m.reply('❌ *No se encontraron medios en el enlace o la API no devolvió respuesta.*')
            }

            const { title, type, result, thumbnail } = json.data
            const caption = `✨ *DESCARGA DE TWITTER / X* ✨\n\n` +
                            `📌 *Título:* ${title && title !== '-' ? title : 'Sin título'}\n` +
                            `📂 *Tipo:* ${type.toUpperCase()}`

            // Recorrer los resultados por si hay varias imágenes/videos
            for (const mediaUrl of result) {
                if (type === 'video') {
                    await conn.sendMessage(
                        m.chat,
                        {
                            video: { url: mediaUrl },
                            caption: caption,
                            mimetype: 'video/mp4'
                        },
                        { quoted: m }
                    )
                } else {
                    await conn.sendMessage(
                        m.chat,
                        {
                            image: { url: mediaUrl },
                            caption: caption
                        },
                        { quoted: m }
                    )
                }
            }

        } catch (error) {
            console.error('Error en descarga de Twitter:', error)
            return m.reply('❌ *Ocurrió un error al intentar descargar el contenido de Twitter / X.*')
        }
    }
}
