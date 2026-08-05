/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ r CODIGO JAVASCRIPT ʚĭɞ r
ʚĭɞ r codigo :: plugins/nsfw/interacciones.js
ʚĭɞ r funcion :: comandos nsfw con extraccion precisa de menciones directas (@usuario)
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'
import { getGroup } from '../../lib/database.js'
import axios from 'axios'

const API_KEY = 'evogb-WzR3kPpa'
const API_BASE_URL = 'https://api.evogb.org/nsfw/interaction'

async function resolveParticipant(rawId, altPn, conn) {
    if (!rawId && !altPn) return { mentionId: '', tagText: '' }

    if (altPn) {
        const cleanPn = String(altPn).split('@')[0].replace(/[^0-9]/g, '')
        if (cleanPn) {
            return {
                mentionId: `${cleanPn}@s.whatsapp.net`,
                tagText: cleanPn
            }
        }
    }

    const str = String(rawId || '').split(':')[0]

    if (conn && typeof conn.findUserId === 'function') {
        try {
            const cleanQuery = str.split('@')[0].replace(/[^0-9]/g, '')
            if (cleanQuery && cleanQuery.length >= 8) {
                const res = await conn.findUserId(cleanQuery)
                if (res?.phoneNumber) {
                    const pn = res.phoneNumber.split('@')[0].replace(/[^0-9]/g, '')
                    return {
                        mentionId: res.phoneNumber,
                        tagText: pn
                    }
                }
            }
        } catch (e) {
        }
    }

    const tag = str.split('@')[0].replace(/[^0-9]/g, '') || 'usuario'
    return {
        mentionId: str,
        tagText: tag
    }
}

const commandTexts = {
    spank: { action: 'azotó', emoji: '👋' },
    undress: { action: 'desvistió', emoji: '👗' },
    yuri: { action: 'hizo yuri con', emoji: '👭' },
    sixnine: { action: 'hizo un 69 con', emoji: '🔥' },
    anal: { action: 'penetró analmente a', emoji: '🍑' },
    fuck: { action: 'cogió con', emoji: '💦' },
    cummouth: { action: 'se vino en la boca de', emoji: '👄' },
    suckboobs: { action: 'chupó las tetas de', emoji: '🍒' },
    cumshot: { action: 'le hizo un cumshot a', emoji: '💦' },
    lickpussy: { action: 'lamió el coño de', emoji: '👅' },
    lickdick: { action: 'lamió la verga de', emoji: '👅' },
    lickass: { action: 'lamió el culo de', emoji: '👅' },
    handjob: { action: 'le hizo una paja a', emoji: '✊' },
    grope: { action: 'agarró las nalgas de', emoji: '🍑' },
    cum: { action: 'se vino con', emoji: '💦' },
    grabboobs: { action: 'agarró las tetas de', emoji: '🍒' },
    blowjob: { action: 'le hizo un oral a', emoji: '👄' },
    boobjob: { action: 'le hizo una cubana a', emoji: '🍒' },
    fap: { action: 'se masturbó pensando en', emoji: '✊' },
    footjob: { action: 'le hizo un footjob a', emoji: '🦶' },
    fingering: { action: 'le metió dedos a', emoji: '👆' },
    creampie: { action: 'le hizo un creampie a', emoji: '🥧' },
    facesitting: { action: 'se sentó en la cara de', emoji: '😮' },
    futanari: { action: 'hizo futanari con', emoji: '🍆' },
    pegging: { action: 'le hizo pegging a', emoji: '🍆' },
    bondage: { action: 'ató con cuerdas a', emoji: '⛓️' },
    deepthroat: { action: 'le hizo deepthroat a', emoji: '👄' },
    thighjob: { action: 'le hizo un thighjob a', emoji: '🦵' },
    yaoi: { action: 'hizo yaoi con', emoji: '👬' },
    bukkake: { action: 'le hizo bukkake a', emoji: '💦' },
    orgy: { action: 'hizo una orgía con', emoji: '🎉' },
    squirting: { action: 'hizo squirt a', emoji: '💧' }
}

const allCommands = Object.keys(commandTexts)

export default {
    command: ['nsfwlist', 'listansfw', ...allCommands],

    async run(m, { conn }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const usedCommand = m.text.split(' ')[0].replace(/^[!#.]/, '').toLowerCase()

        if (usedCommand === 'nsfwlist' || usedCommand === 'listansfw') {
            return sendNsfwList(m, conn, botName)
        }

        if (!m.isGroup) {
            return m.reply('⚠️ Los comandos NSFW solo funcionan en grupos.')
        }

        const groupData = getGroup(m.chat)
        if (!groupData.nsfw) {
            return m.reply(
                '🔒 *El modo NSFW está DESACTIVADO en este grupo.*\n\n' +
                '👮‍♂️ Pide a un administrador que use:\n' +
                '`!nsfw on` para activar los comandos NSFW.'
            )
        }

        const commandInfo = commandTexts[usedCommand]
        if (!commandInfo) return

        const senderRaw = m.sender || m.key.participant || m.participant
        const senderPn = m.key?.senderPn || m.key?.participantAlt
        const sender = await resolveParticipant(senderRaw, senderPn, conn)

        let targetRaw = null
        let targetPn = null
        
        const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo
        const mentionedJids = m.mentionedJid || contextInfo?.mentionedJid || []

        if (mentionedJids.length > 0) {
            targetRaw = mentionedJids[0]
    
            targetPn = contextInfo?.mentionedPn || contextInfo?.participantAlt
        } else if (m.quoted) {
            targetRaw = m.quoted.sender || m.quoted.participant || m.quoted.key?.participant
            targetPn = m.quoted.senderPn || m.quoted.key?.participantAlt
        }

        const target = await resolveParticipant(targetRaw, targetPn, conn)

        await m.reply('🔞 Cargando contenido...')

        try {
            const apiUrl = `${API_BASE_URL}?type=${usedCommand}&key=${API_KEY}`
            const response = await axios.get(apiUrl, { timeout: 15000 })

            if (!response.data?.status || !response.data?.result) {
                return m.reply('❌ No se pudo obtener el contenido de la API.')
            }

            const videoUrl = response.data.result
            const description = response.data.description || commandInfo.action

            const mentions = []
            if (sender.mentionId) mentions.push(sender.mentionId)

            let captionText = ''

            if (target.mentionId) {
                mentions.push(target.mentionId)

                captionText = 
                    `🔞 *NSFW - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${sender.tagText} *${commandInfo.action}* @${target.tagText}\n\n` +
                    `💬 _${description}_\n\n` +
                    `🤖 Bot: *${botName}*`
            } else {
                captionText = 
                    `🔞 *NSFW - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${sender.tagText} *${commandInfo.action}* alguien especial 😏\n\n` +
                    `💬 _${description}_\n\n` +
                    `🤖 Bot: *${botName}*`
            }

            const videoResponse = await axios.get(videoUrl, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })

            const videoBuffer = Buffer.from(videoResponse.data, 'binary')

            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: captionText,
                gifPlayback: true,
                mentions: mentions,
                mimetype: 'video/mp4'
            }, { quoted: m })

        } catch (error) {
            console.error('Error NSFW:', error)
            m.reply('❌ Error al obtener el contenido. Inténtalo de nuevo.')
        }
    }
}

async function sendNsfwList(m, conn, botName) {
    const listText = 
        `╭─「 🔞 *COMANDOS NSFW* 」\n` +
        `│\n` +
        `│ 💡 *Uso:* \`!comando @usuario\`\n` +
        `│\n` +
        `│ 🔥 Populares:\n` +
        `│ • \`!cum\` - Venirse\n` +
        `│ • \`!fuck\` - Coger\n` +
        `│ • \`!anal\` - Anal\n` +
        `│ • \`!blowjob\` - Oral\n` +
        `│\n` +
        `│ 🤖 Bot: *${botName}*\n` +
        `╰──────────────`

    await m.reply(listText)
}
