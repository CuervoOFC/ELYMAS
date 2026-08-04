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
ʚĭɞ ೃ funcion :: comandos nsfw con normalizacion correcta
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'
import { getGroup } from '../../lib/database.js'
import axios from 'axios'

const API_KEY = 'evogb-WzR3kPpa'
const API_BASE_URL = 'https://api.evogb.org/nsfw/interaction'

// Función para normalizar JID (similar a decodeIdentifier pero mantiene @s.whatsapp.net)
function normalizeJid(jid) {
    if (!jid) return ''
    const str = String(jid)
    
    // Si ya es @s.whatsapp.net, devolverlo limpio
    if (str.includes('@s.whatsapp.net')) {
        return str.split(':')[0] // Quitar :1, :2, etc.
    }
    
    // Si es @lid, convertir a @s.whatsapp.net
    if (str.includes('@lid')) {
        const number = str.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
        return number ? `${number}@s.whatsapp.net` : ''
    }
    
    // Si no tiene @, asumir que es número
    if (!str.includes('@')) {
        const number = str.replace(/[^0-9]/g, '')
        return number ? `${number}@s.whatsapp.net` : ''
    }
    
    // Cualquier otro caso (g.us, etc.)
    return str
}

// Extraer solo el número para mostrar en texto
function getNumber(jid) {
    if (!jid) return ''
    return String(jid).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
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

        // Normalizar JID del remitente (quita lid, :1, etc.)
        const senderJid = normalizeJid(m.sender)
        const senderNumber = getNumber(senderJid)

        if (!senderJid) {
            console.error('Error: No se pudo obtener JID del remitente')
            return m.reply('❌ Error al procesar tu mensaje.')
        }

        // Obtener y normalizar usuario mencionado
        let targetJid = null
        let targetNumber = null
        
        // Debug: Ver qué tenemos en mentionedJid
        console.log('Menciones raw:', m.mentionedJid)
        console.log('Quoted sender:', m.quoted?.sender)

        // 1. De mentionedJid (prioridad alta)
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetJid = normalizeJid(m.mentionedJid[0])
            targetNumber = getNumber(targetJid)
            console.log('Target de mentionedJid:', targetJid)
        }
        // 2. De quoted message
        else if (m.quoted && m.quoted.sender) {
            targetJid = normalizeJid(m.quoted.sender)
            targetNumber = getNumber(targetJid)
            console.log('Target de quoted:', targetJid)
        }
        // 3. De argumentos del texto
        else if (args.length > 0) {
            const possibleNumber = args[0].replace(/[@\s]/g, '')
            if (/^\d+$/.test(possibleNumber) && possibleNumber.length >= 10) {
                targetJid = `${possibleNumber}@s.whatsapp.net`
                targetNumber = possibleNumber
            }
        }

        await m.reply('🔞 Cargando contenido...')

        try {
            const apiUrl = `${API_BASE_URL}?type=${usedCommand}&key=${API_KEY}`
            const response = await axios.get(apiUrl, { timeout: 15000 })
            
            if (!response.data.status || !response.data.result) {
                return m.reply('❌ No se pudo obtener el contenido de la API.')
            }

            const videoUrl = response.data.result
            const description = response.data.description || commandInfo.action

            // Construir caption y array de menciones
            let captionText
            const mentions = [senderJid] // Siempre incluir remitente
            
            if (targetJid) {
                mentions.push(targetJid)
                captionText = 
                    `🔞 *NSFW - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${senderNumber} *${commandInfo.action}* @${targetNumber}\n\n` +
                    `💬 _${description}_\n\n` +
                    `🤖 Bot: *${botName}*`
                
                console.log('Menciones a enviar:', mentions)
                console.log('Caption:', captionText)
            } else {
                captionText = 
                    `🔞 *NSFW - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${senderNumber} *${commandInfo.action}* alguien especial 😏\n\n` +
                    `💬 _${description}_\n\n` +
                    `🤖 Bot: *${botName}*`
            }

            // Descargar video
            const videoResponse = await axios.get(videoUrl, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })

            const videoBuffer = Buffer.from(videoResponse.data, 'binary')

            // Enviar mensaje
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
