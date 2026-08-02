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
ʚĭɞ ೃ funcion :: generar sticker brat con conversion ffmpeg local
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'

function convertToWebp(inputPath) {
    return new Promise((resolve, reject) => {
        const tmpOutput = path.join(process.cwd(), 'tmp', `${Date.now()}_out.webp`)

        ffmpeg(inputPath)
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
                '-preset', 'default'
            ])
            .toFormat('webp')
            .save(tmpOutput)
            .on('end', () => {
                try {
                    const resultBuffer = fs.readFileSync(tmpOutput)
                    if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput)
                    resolve(resultBuffer)
                } catch (err) {
                    reject(err)
                }
            })
            .on('error', (err) => {
                if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput)
                reject(err)
            })
    })
}

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

        const tmpDir = path.join(process.cwd(), 'tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

        const tmpInput = path.join(tmpDir, `${Date.now()}_brat.png`)

        try {
            const bratApi = `https://api.evogb.org/tools/brat?text=${encodeURIComponent(txt)}&animated=false&key=${EVO_KEY}`
            const bratRes = await fetch(bratApi)

            if (!bratRes.ok) throw new Error('Error al conectar con la API de Brat.')

            const mediaBuffer = Buffer.from(await bratRes.arrayBuffer())
            fs.writeFileSync(tmpInput, mediaBuffer)

            const webpBuffer = await convertToWebp(tmpInput)

            if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput)

            return await conn.sendMessage(
                m.chat,
                {
                    sticker: webpBuffer,
                    packname: defaultPackname,
                    author: defaultAuthor
                },
                { quoted: m }
            )

        } catch (error) {
            if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput)
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
