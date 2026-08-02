/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/convertidores/bratvid.js
ʚĭɞ ೃ funcion :: generar sticker brat animado (video/gif) con fallback a estatico
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'
const STELLAR_KEY = 'api-COTah'

// Función para convertir tanto video/gif como imagenes estáticas a WebP
function convertToWebp(inputPath, isVideo = false) {
    return new Promise((resolve, reject) => {
        const tmpOutput = path.join(process.cwd(), 'tmp', `${Date.now()}_out.webp`)

        const options = isVideo
            ? [
                '-vcodec', 'libwebp',
                '-vf', 'scale=320:320:force_original_aspect_ratio=decrease,fps=10,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
                '-loop', '0',
                '-ss', '00:00:00',
                '-t', '00:00:06',
                '-preset', 'default',
                '-an',
                '-vsync', '0'
            ]
            : [
                '-vcodec', 'libwebp',
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
                '-preset', 'default'
            ]

        ffmpeg(inputPath)
            .outputOptions(options)
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
    command: ['bratvid', 'bratvideo', 'bratgif', 'bratanimado'],

    async run(m, { conn, args, text }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const defaultPackname = botData.name || config.botName || 'Cuervo'
        const defaultAuthor = botData.ownerName || config.ownerName || 'TheDevil'

        let txt = text || (m.quoted ? m.quoted.text : '')

        if (!txt) {
            return m.reply(
                '╭─「 🟩 *BRAT VIDEO STICKER* 」\n' +
                '│\n' +
                '│ ❌ Por favor, ingresa el texto para crear el sticker animado.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:*\n' +
                '│ .bratvid Hola bro\n' +
                '│ (O responde a un mensaje con *.bratvid*)\n' +
                '╰──────────────'
            )
        }

        await m.reply(
            '╭━━━〔 ⏳ *GENERANDO* 〕━━━⬣\n' +
            '┃ 🟩 Creando sticker Brat animado...\n' +
            '╰━━━━━━━━━━━━━━━━━━━━⬣'
        )

        const tmpDir = path.join(process.cwd(), 'tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

        let mediaBuffer = null
        let isAnimated = true
        let ext = 'mp4'

        try {
            const evoAnimatedApi = `https://api.evogb.org/tools/brat?text=${encodeURIComponent(txt)}&animated=true&key=${EVO_KEY}`
            const res = await fetch(evoAnimatedApi)
            if (res.ok) {
                const contentType = res.headers.get('content-type') || ''
                if (contentType.includes('gif')) ext = 'gif'
                else if (contentType.includes('png')) { ext = 'png'; isAnimated = false; }
                
                mediaBuffer = Buffer.from(await res.arrayBuffer())
            }
        } catch (e) {
            console.error('❌ Error API EvoGB Animada:', e)
        }

        if (!mediaBuffer) {
            try {
                const stellarAnimatedApi = `https://api.stellarwa.xyz/tools/brat?text=${encodeURIComponent(txt)}&animated=true&key=${STELLAR_KEY}`
                const res = await fetch(stellarAnimatedApi)
                if (res.ok) {
                    ext = 'mp4'
                    mediaBuffer = Buffer.from(await res.arrayBuffer())
                }
            } catch (e) {
                console.error('❌ Error API Stellar Animada:', e)
            }
        }

        if (!mediaBuffer) {
            console.log('⚠️ Cambiando a Fallback de Brat Estático...')
            isAnimated = false
            ext = 'png'
            
            try {
                const staticApi = `https://api.evogb.org/tools/brat?text=${encodeURIComponent(txt)}&animated=false&key=${EVO_KEY}`
                const res = await fetch(staticApi)
                if (res.ok) mediaBuffer = Buffer.from(await res.arrayBuffer())
            } catch {}

            if (!mediaBuffer) {
                try {
                    const stellarStaticApi = `https://api.stellarwa.xyz/tools/brat?text=${encodeURIComponent(txt)}&key=${STELLAR_KEY}`
                    const res = await fetch(stellarStaticApi)
                    if (res.ok) mediaBuffer = Buffer.from(await res.arrayBuffer())
                } catch {}
            }
        }

        if (!mediaBuffer) {
            return m.reply('❌ No se pudo generar el sticker de Brat en ninguna de sus versiones.')
        }

        const tmpInput = path.join(tmpDir, `${Date.now()}_bratinput.${ext}`)

        try {
            fs.writeFileSync(tmpInput, mediaBuffer)

            const webpBuffer = await convertToWebp(tmpInput, isAnimated)

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
            console.error('❌ Error en bratvid.js:', error)
            return m.reply(
                '╭─「 ❌ *ERROR EN BRAT ANIMADO* 」\n' +
                '│\n' +
                '│ Ocurrió un error al procesar el sticker animado.\n' +
                `│ 📄 ${error.message || error}\n` +
                '╰──────────────'
            )
        }
    }
}
