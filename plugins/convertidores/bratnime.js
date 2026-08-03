/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/convertidores/bratnime.js
ʚĭɞ ೃ funcion :: generar sticker brat anime estatico y animado localmente
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { createCanvas, loadImage } from '@napi-rs/canvas'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const BG_URL = 'https://raw.githubusercontent.com/uploader762/dat1/main/uploads/4f8284-1776503052781.jpg'

const left = 275
const right = 1011
const topY = 574
const bottomY = 1032
const centerX = (left + right) / 2
const centerY = 804

function wrapLines(ctx, text, maxWidth) {
    const words = text.split(' ')
    let line = ''
    const lines = []

    for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + ' '
        const width = ctx.measureText(test).width

        if (width > maxWidth && i > 0) {
            lines.push(line)
            line = words[i] + ' '
        } else {
            line = test
        }
    }

    lines.push(line)
    return lines
}

function drawText(ctx, text) {
    const maxWidth = right - left
    const maxHeight = bottomY - topY

    let fontSize = 80
    let lines, lineHeight, totalHeight

    do {
        ctx.font = `bold ${fontSize}px sans-serif`
        lines = wrapLines(ctx, text, maxWidth)
        lineHeight = fontSize * 1.15
        totalHeight = lines.length * lineHeight
        fontSize -= 2
    } while (totalHeight > maxHeight && fontSize > 10)

    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const startY = centerY - (lines.length * lineHeight / 2) + (lineHeight / 2)

    lines.forEach((line, i) => {
        ctx.fillText(line, centerX, startY + (i * lineHeight))
    })
}

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

async function renderImage(text) {
    const canvas = createCanvas(1280, 1280)
    const ctx = canvas.getContext('2d')

    const bg = await loadImage(BG_URL)

    canvas.width = bg.width
    canvas.height = bg.height

    ctx.drawImage(bg, 0, 0)
    drawText(ctx, text)

    return canvas.toBuffer('image/png')
}

async function renderVideo(text) {
    const words = text.split(' ')
    const tmpDir = path.join(os.tmpdir(), `bratnime_${Date.now()}`)

    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const frames = []
    const bg = await loadImage(BG_URL)

    for (let i = 0; i < words.length; i++) {
        const partial = words.slice(0, i + 1).join(' ')

        const canvas = createCanvas(1280, 1280)
        const ctx = canvas.getContext('2d')

        canvas.width = bg.width
        canvas.height = bg.height

        ctx.drawImage(bg, 0, 0)
        drawText(ctx, partial)

        const framePath = path.join(tmpDir, `frame_${i}.png`)
        fs.writeFileSync(framePath, canvas.toBuffer('image/png'))

        frames.push(framePath)
    }

    const listPath = path.join(tmpDir, 'list.txt')
    let list = ''

    for (const f of frames) {
        const abs = path.resolve(f).replace(/\\/g, '/')
        list += `file '${abs}'\n`
        list += `duration 0.8\n`
    }

    const last = path.resolve(frames.at(-1)).replace(/\\/g, '/')
    list += `file '${last}'\n`
    list += `duration 2\n`

    fs.writeFileSync(listPath, list)

    const output = path.join(tmpDir, 'output.mp4')

    execSync(
        `ffmpeg -y -f concat -safe 0 -i "${listPath}" -vf "fps=30,format=yuv420p" "${output}"`
    )

    const buffer = fs.readFileSync(output)
    fs.rmSync(tmpDir, { recursive: true, force: true })

    return buffer
}

export default {
    command: ['bratnime', 'bratnimevid', 'bratnimevideo'],

    async run(m, { conn, command, args, text }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const defaultPackname = botData.name || config.botName || 'Cuervo'
        const defaultAuthor = botData.ownerName || config.ownerName || 'TheDevil'

        let txt = text || (m.quoted ? m.quoted.text : '')

        if (!txt) {
            return m.reply(
                `╭─「 🖼️ *BRAT ANIME* 」\n` +
                `│\n` +
                `│ ❌ Por favor, ingresa el texto para generar el sticker.\n` +
                `│\n` +
                `│ 📌 *Ejemplo:*\n` +
                `│ • .${command} Hola mundo\n` +
                `│ (O responde a un mensaje con .${command})\n` +
                `╰──────────────`
            )
        }

        await m.reply(
            '╭━━━〔 ⏳ *GENERANDO* 〕━━━⬣\n' +
            '┃ 🖼️ Procesando Brat Anime...\n' +
            '╰━━━━━━━━━━━━━━━━━━━━⬣'
        )

        const tmpDir = path.join(process.cwd(), 'tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

        const isVideo = command.includes('vid')
        const tmpInput = path.join(tmpDir, `${Date.now()}_input.${isVideo ? 'mp4' : 'png'}`)

        try {
            let mediaBuffer

            if (isVideo) {
                mediaBuffer = await renderVideo(txt)
            } else {
                mediaBuffer = await renderImage(txt)
            }

            fs.writeFileSync(tmpInput, mediaBuffer)

            const webpBuffer = await convertToWebp(tmpInput, isVideo)

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
            console.error('❌ Error en bratnime:', error)
            return m.reply(
                '╭─「 ❌ *ERROR EN BRAT ANIME* 」\n' +
                '│\n' +
                '│ Ocurrió un error al generar el sticker Brat Anime.\n' +
                `│ 📄 ${error.message || error}\n` +
                '╰──────────────'
            )
        }
    }
}
