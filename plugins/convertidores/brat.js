/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/convertidores/brat.js
ʚĭɞ ೃ funcion :: generar sticker brat estático usando el conversor oficial
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'
const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'
const EVO_CONVERTER_API = 'https://api.evogb.org/api/converter-img'

export default {
    command: ['brat'],

    async run(m, { conn, args, text }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const defaultPackname = botData.name || config.botName || 'Cuervo'
        const defaultAuthor = botData.ownerName || config.ownerName || 'TheDevil'

        let txt = text || (m.quoted ? m.quoted.text : '')

        if (!txt) {
            return m.reply(
                '╭─「 🟩 *BRAT STICKER* 」\n' +
                '│\n' +
                '│ ❌ Por favor, ingresa el texto para crear el sticker.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:*\n' +
                '│ .brat Hola bro\n' +
                '│ (O responde a un mensaje con *.brat*)\n' +
                '╰──────────────'
            )
        }

        await m.reply(
            '╭━━━〔 ⏳ *GENERANDO* 〕━━━⬣\n' +
            '┃ 🟩 Creando sticker Brat...\n' +
            '╰━━━━━━━━━━━━━━━━━━━━⬣'
        )

        try {
            const bratApi = `https://api.evogb.org/tools/brat?text=${encodeURIComponent(txt)}&animated=false&key=${EVO_KEY}`
            const bratRes = await fetch(bratApi)
            if (!bratRes.ok) throw new Error('Error al conectar con la API de Brat.')
            
            const mediaBuffer = Buffer.from(await bratRes.arrayBuffer())

            let mediaUrl = ''
            try {
                const formData = new FormData()
                const blob = new Blob([mediaBuffer], { type: 'image/png' })
                formData.append('file', blob, 'brat.png')

                const res = await fetch(`${EVO_UPLOAD_API}?key=${EVO_KEY}`, {
                    method: 'POST',
                    body: formData
                })
                const json = await res.json()
                if (json.status && json.url) mediaUrl = json.url
                else throw new Error()
            } catch {
                const formData = new FormData()
                const blob = new Blob([mediaBuffer], { type: 'image/png' })
                formData.append('file', blob, 'brat.png')

                const res = await fetch(STELLAR_UPLOAD_API, {
                    method: 'POST',
                    body: formData
                })
                const json = await res.json()
                if (json.success && json.file?.publicUrl) mediaUrl = json.file.publicUrl
                else throw new Error('Falló la subida en ambos servidores.')
            }

            const convertUrl = `${EVO_CONVERTER_API}?method=url&url=${encodeURIComponent(mediaUrl)}&width=none&height=none&to=webp&key=${EVO_KEY}`
            const webpRes = await fetch(convertUrl)
            if (!webpRes.ok) throw new Error('Error en el conversor de stickers.')

            const webpBuffer = Buffer.from(await webpRes.arrayBuffer())

            return await conn.sendMessage(m.chat, {
                sticker: webpBuffer,
                packname: defaultPackname,
                author: defaultAuthor
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en Brat:', error)
            return m.reply(
                '╭─「 ❌ *ERROR EN BRAT* 」\n' +
                '│\n' +
                '│ Ocurrió un error al generar el sticker Brat.\n' +
                `│ 📄 ${error.message || error}\n` +
                '╰──────────────'
            )
        }
    }
}
