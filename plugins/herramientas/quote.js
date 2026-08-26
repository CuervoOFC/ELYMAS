/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/herramientas/quote.js
ʚĭɞ ೃ funcion :: genera quote usando el nombre y foto del etiquetado/citado con conversion a sticker
──────✧✦✧──────
*/

import { downloadMediaMessage } from '@itsliaaa/baileys'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'CuervoOFC'
const STELLAR_KEY = 'CuervoOFC'

const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'

const DEFAULT_PFP = 'https://i.imgur.com/2w3A80k.jpeg'
const MAX_SIZE_MB = 45

function convertToWebp(inputPath) {
    return new Promise((resolve, reject) => {
        const tmpDir = path.join(process.cwd(), 'tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
        
        const tmpOutput = path.join(tmpDir, `${Date.now()}_quote.webp`)

        const options = [
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

async function uploadMedia(mediaBuffer, mime) {
    const ext = mime.split('/')[1]?.split(';')[0] || 'jpg'
    
    try {
        const formData = new FormData()
        const blob = new Blob([mediaBuffer], { type: mime })
        formData.append('file', blob, `file.${ext}`)

        const res = await fetch(`${EVO_UPLOAD_API}?key=${EVO_KEY}`, {
            method: 'POST',
            body: formData
        })

        if (res.ok) {
            const json = await res.json()
            if (json.status && json.url) return json.url
        }
    } catch (e) {
        console.log('⚠️ Error subiendo a EvoGB en quote, intentando StellarWA...', e.message)
    }

    const formData = new FormData()
    const blob = new Blob([mediaBuffer], { type: mime })
    formData.append('file', blob, `file.${ext}`)

    const res = await fetch(STELLAR_UPLOAD_API, {
        method: 'POST',
        body: formData
    })

    if (!res.ok) throw new Error('No se pudo subir la imagen a los servidores de hosting.')

    const json = await res.json()
    if (!json.success || !json.file?.publicUrl) throw new Error('Respuesta inválida del hosting StellarWA.')

    return json.file.publicUrl
}

async function resolveUserTarget(m, conn) {
    let targetRaw = null
    let targetPn = null
    let targetName = ''

    const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo
    const mentionedJids = m.mentionedJid || contextInfo?.mentionedJid || []

    if (mentionedJids.length > 0) {
        targetRaw = mentionedJids[0]
        targetPn = contextInfo?.mentionedPn || contextInfo?.participantAlt

        const contact = conn.contacts?.[targetRaw]
        targetName = contact?.name || contact?.notify || contact?.vname || ''
    } else if (m.quoted) {
        targetRaw = m.quoted.sender || m.quoted.participant || m.quoted.key?.participant
        targetPn = m.quoted.senderPn || m.quoted.key?.participantAlt
        targetName = m.quoted.pushName || m.quoted.name || ''
    } else {
        targetRaw = m.sender || m.key.participant || m.participant
        targetPn = m.key?.senderPn || m.key?.participantAlt
        targetName = m.pushName || m.name || ''
    }

    let jid = targetRaw
    if (targetPn) {
        const cleanPn = String(targetPn).split('@')[0].replace(/[^0-9]/g, '')
        if (cleanPn) jid = `${cleanPn}@s.whatsapp.net`
    }

    if (!targetName && conn.contacts?.[jid]) {
        const c = conn.contacts[jid]
        targetName = c.name || c.notify || c.vname || ''
    }

    if (!targetName) {
        targetName = jid.split('@')[0].replace(/[^0-9]/g, '') || 'Usuario'
    }

    return {
        jid: jid,
        name: targetName
    }
}

export default {
    command: ['qc', 'quote', 'cita'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const packname = botData.name || config.botName || 'Cuervo'
        const author = botData.ownerName || config.ownerName || 'TheDevil'

        const q = m.quoted ? m.quoted : m
        const rawMessage = q.message || q.msg || q

        let quoteText = args.join(' ').replace(/@[0-9]+/g, '').trim()

        if (!quoteText && m.quoted) {
            quoteText = m.quoted.text || m.quoted.caption || ''
        }

        if (!quoteText) {
            return m.reply(
                '╭─「 💬 *GENERADOR DE QUOTE* 」\n' +
                '│\n' +
                '│ ❌ Escribe el texto para el quote.\n' +
                '│\n' +
                '│ 📌 *Ejemplos:*\n' +
                '│ • `.qc Hola a todos` (Tus datos)\n' +
                '│ • `.qc @usuario Hola` (Usa el nombre y foto del etiquetado)\n' +
                '╰──────────────'
            )
        }

        const targetUser = await resolveUserTarget(m, conn)

        const tmpDir = path.join(process.cwd(), 'tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

        const tmpInput = path.join(tmpDir, `${Date.now()}_quote_in.png`)

        try {
            let avatarUrl = ''
            const mime = rawMessage.imageMessage?.mimetype || q.mimetype || ''

            if (mime && mime.startsWith('image/')) {
                let mediaBuffer
                try {
                    mediaBuffer = await downloadMediaMessage(
                        q,
                        'buffer',
                        {},
                        { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
                    )
                } catch (dlErr) {
                    if (typeof q.download === 'function') {
                        mediaBuffer = await q.download()
                    } else if (typeof conn.downloadMediaMessage === 'function') {
                        mediaBuffer = await conn.downloadMediaMessage(q)
                    } else {
                        throw dlErr
                    }
                }

                if (mediaBuffer) {
                    const fileSizeMB = mediaBuffer.length / (1024 * 1024)
                    if (fileSizeMB <= MAX_SIZE_MB) {
                        avatarUrl = await uploadMedia(mediaBuffer, mime)
                    }
                }
            }

            if (!avatarUrl) {
                try {
                    avatarUrl = await conn.profilePictureUrl(targetUser.jid, 'image')
                } catch (e) {
                    avatarUrl = DEFAULT_PFP
                }
            }

            const nameParam = encodeURIComponent(targetUser.name)
            const textParam = encodeURIComponent(quoteText)
            const urlParam = encodeURIComponent(avatarUrl)

            const quoteApiUrl = `https://api.evogb.org/generate/quote-basic?method=url&url=${urlParam}&name=${nameParam}&textMarkdown=${textParam}&undefined=%23000000&solidColor=%23000000&width=none&height=none&key=${EVO_KEY}`

            const res = await fetch(quoteApiUrl)
            if (!res.ok) throw new Error('No se pudo generar el quote desde la API.')

            const arrayBuf = await res.arrayBuffer()
            const resultBuffer = Buffer.from(arrayBuf)

            fs.writeFileSync(tmpInput, resultBuffer)

            const webpBuffer = await convertToWebp(tmpInput)

            if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput)

            return await conn.sendMessage(
                m.chat,
                { 
                    sticker: webpBuffer,
                    packname: packname,
                    author: author
                },
                { quoted: m }
            )

        } catch (error) {
            if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput)
            console.error('❌ Error en Quote:', error)
            return m.reply(
                '╭─「 ❌ *ERROR EN QUOTE* 」\n' +
                '│\n' +
                '│ Ocurrió un error al generar el sticker cita.\n' +
                `│ 📄 ${error instanceof Error ? error.message : 'Error desconocido'}\n` +
                '╰──────────────'
            )
        }
    }
}
