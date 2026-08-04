/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/nsfw/interacciones.js
ʚĭɞ ೃ funcion :: comandos nsfw optimizado para @itsliaaa/baileys (resolucion LID/JID con findUserId)
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'
import { getGroup } from '../../lib/database.js'
import axios from 'axios'

const API_KEY = 'evogb-WzR3kPpa'
const API_BASE_URL = 'https://api.evogb.org/nsfw/interaction'

/**
 * Resuelve el JID real (@s.whatsapp.net), LID (@lid) y el número telefónico
 * Aprovecha sock.findUserId de @itsliaaa/baileys si no está en la metadata del grupo.
 */
async function resolveParticipant(rawId, conn, groupParticipants = []) {
    if (!rawId) return { jid: '', lid: '', number: '' }

    const str = String(typeof rawId === 'string' ? rawId : rawId?.id || rawId?.phoneNumber || '').split(':')[0]
    let jid = ''
    let lid = ''

    if (str.includes('@lid')) {
        lid = str
        // 1. Buscar en participantes del grupo
        const found = groupParticipants.find(p => p.lid === str || p.id === str)
        if (found && found.id && found.id.includes('@s.whatsapp.net')) {
            jid = found.id.split(':')[0]
        } 
        // 2. Si no se encuentra en el grupo, usar findUserId() de @itsliaaa/baileys
        else if (conn && typeof conn.findUserId === 'function') {
            try {
                const res = await conn.findUserId(str)
                if (res?.phoneNumber) jid = res.phoneNumber
            } catch (e) {
                // Silenciar fallo si no se encuentra
            }
        }
    } else if (str.includes('@s.whatsapp.net')) {
        jid = str
        // 1. Buscar en participantes del grupo
        const found = groupParticipants.find(p => p.id === str || p.lid === str)
        if (found && found.lid) {
            lid = found.lid.split(':')[0]
        }
        // 2. Si no tiene LID en grupo, consultar findUserId() de @itsliaaa/baileys
        else if (conn && typeof conn.findUserId === 'function') {
            try {
                const res = await conn.findUserId(str)
                if (res?.lid) lid = res.lid
            } catch (e) {
                // Silenciar fallo
            }
        }
    } else if (!str.includes('@')) {
        const clean = str.replace(/[^0-9]/g, '')
        if (clean) jid = `${clean}@s.whatsapp.net`
    }

    // El número formateado para menciones (@123456) SOLO sale del JID real
    let number = ''
    if (jid && jid.includes('@s.whatsapp.net')) {
        number = jid.split('@')[0].replace(/[^0-9]/g, '')
    }

    return { jid, lid, number }
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
    command: [...allCommands, 'nsfwlist', 'listansfw'],

    async run(m, { conn, args }) {
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

        let groupParticipants = []
        try {
            const metadata = await conn.groupMetadata(m.chat)
            groupParticipants = metadata.participants || []
        } catch (e) {
            console.error('Error al obtener participantes del grupo:', e)
        }

        // 1. Resolver emisor (sender)
        const senderRaw = m.sender || m.key.participant || m.participant
        const sender = await resolveParticipant(senderRaw, conn, groupParticipants)

        // 2. Determinar/extraer objetivo
        let targetRaw = null
        let extractedNumber = ''

        if (args.length > 0) {
            const cleanArg = args.join(' ').replace(/[^0-9]/g, '')
            if (cleanArg.length >= 10) {
                extractedNumber = cleanArg
                targetRaw = `${cleanArg}@s.whatsapp.net`
            }
        }

        if (!targetRaw) {
            if (m.mentionedJid && m.mentionedJid.length > 0) {
                targetRaw = m.mentionedJid[0]
            } else if (m.quoted) {
                targetRaw = m.quoted.sender || m.quoted.participant || m.quoted.key?.participant
            }
        }

        // 3. Resolver objetivo asíncronamente aprovechando sock.findUserId
        const target = await resolveParticipant(targetRaw, conn, groupParticipants)

        if (!target.number && extractedNumber) {
            target.number = extractedNumber
            if (!target.jid) target.jid = `${extractedNumber}@s.whatsapp.net`
        }

        await m.reply('🔞 Cargando contenido...')

        try {
            const apiUrl = `${API_BASE_URL}?type=${usedCommand}&key=${API_KEY}`
            const response = await axios.get(apiUrl, { timeout: 15000 })

            if (!response.data?.status || !response.data?.result) {
                return m.reply('❌ No se pudo obtener el contenido de la API.')
            }

            const videoUrl = response.data.result
            const description = response.data.description || commandInfo.action

            // Agregar tanto JID como LID al array de menciones para compatibilidad total con Baileys
            const mentions = []
            if (sender.jid) mentions.push(sender.jid)
            if (sender.lid) mentions.push(sender.lid)

            let captionText = ''

            if (target.number) {
                if (target.jid) mentions.push(target.jid)
                if (target.lid) mentions.push(target.lid)

                captionText = 
                    `🔞 *NSFW - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${sender.number} *${commandInfo.action}* @${target.number}\n\n` +
                    `💬 _${description}_\n\n` +
                    `🤖 Bot: *${botName}*`
            } else {
                captionText = 
                    `🔞 *NSFW - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${sender.number} *${commandInfo.action}* alguien especial 😏\n\n` +
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
