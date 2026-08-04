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
ʚĭɞ ೃ funcion :: comandos nsfw con videos/gifs
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'
import { getGroup } from '../../lib/database.js'
import axios from 'axios'
import { proto } from '@itsliaaa/baileys'

const API_KEY = 'evogb-WzR3kPpa'
const API_BASE_URL = 'https://api.evogb.org/nsfw/interaction'

// Mapeo de comandos a textos personalizados
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

        // Comando de lista
        if (usedCommand === 'nsfwlist' || usedCommand === 'listansfw') {
            return sendNsfwList(m, conn, botName)
        }

        // Verificar grupo
        if (!m.isGroup) {
            return m.reply('⚠️ Los comandos NSFW solo funcionan en grupos.')
        }

        // Verificar NSFW activado
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

        const sender = m.sender
        const senderName = sender.split('@')[0]

        // Obtener usuario mencionado
        let mentionedUser = m.mentionedJid && m.mentionedJid[0]
        if (!mentionedUser && m.quoted) {
            mentionedUser = m.quoted.sender
        }

        // Enviar mensaje de carga
        await m.reply('🔞 Cargando contenido...')

        try {
            // Llamar a la API para obtener el video/GIF
            const apiUrl = `${API_BASE_URL}?type=${usedCommand}&key=${API_KEY}`
            const response = await axios.get(apiUrl, { timeout: 15000 })
            
            if (!response.data.status || !response.data.result) {
                return m.reply('❌ No se pudo obtener el contenido de la API.')
            }

            const videoUrl = response.data.result
            const description = response.data.description || commandInfo.action

            // Construir mensaje de caption
            let captionText
            if (mentionedUser) {
                const targetName = mentionedUser.split('@')[0]
                captionText = 
                    `🔞 *NSFW - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${senderName} *${commandInfo.action}* @${targetName}\n\n` +
                    `💬 _${description}_\n\n` +
                    `🤖 Bot: *${botName}*`
            } else {
                captionText = 
                    `🔞 *NSFW - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${senderName} *${commandInfo.action}* alguien especial 😏\n\n` +
                    `💬 _${description}_\n\n` +
                    `🤖 Bot: *${botName}*`
            }

            // Descargar el video y enviarlo
            const videoResponse = await axios.get(videoUrl, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })

            const videoBuffer = Buffer.from(videoResponse.data, 'binary')

            // Enviar video como GIF (ptvMessage - video que se ve como GIF)
            await conn.sendMessage(m.chat, {
                video: videoBuffer,
                caption: captionText,
                gifPlayback: true, // Se reproduce como GIF
                mentions: mentionedUser ? [sender, mentionedUser] : [sender],
                mimetype: 'video/mp4'
            }, { quoted: m })

        } catch (error) {
            console.error('Error NSFW API:', error.message)
            
            // Si falla, enviar mensaje de error
            m.reply(
                '❌ *Error al obtener el contenido*\n\n' +
                '⚠️ La API no respondió o el video no está disponible.\n' +
                'Inténtalo de nuevo más tarde.'
            )
        }
    }
}

// Función para enviar la lista de comandos
async function sendNsfwList(m, conn, botName) {
    const listText = 
        `╭─「 🔞 *COMANDOS NSFW CON VIDEOS* 」\n` +
        `│\n` +
        `│ 📋 *Lista de interacciones:*\n` +
        `│\n` +
        `│ 👋 \`!spank\` ➔ Azotar\n` +
        `│ 👗 \`!undress\` ➔ Desvestir\n` +
        `│ 👭 \`!yuri\` ➔ Yuri/Lésbico\n` +
        `│ 🔥 \`!sixnine\` ➔ 69\n` +
        `│ 🍑 \`!anal\` ➔ Anal\n` +
        `│ 💦 \`!fuck\` ➔ Coger\n` +
        `│ 👄 \`!cummouth\` ➔ En la boca\n` +
        `│ 🍒 \`!suckboobs\` ➔ Chupar tetas\n` +
        `│ 💦 \`!cumshot\` ➔ Cumshot\n` +
        `│ 👅 \`!lickpussy\` ➔ Lamer coño\n` +
        `│ 👅 \`!lickdick\` ➔ Lamer verga\n` +
        `│ 👅 \`!lickass\` ➔ Lamer culo\n` +
        `│ ✊ \`!handjob\` ➔ Paja manual\n` +
        `│ 🍑 \`!grope\` ➔ Agarrar nalgas\n` +
        `│ 💦 \`!cum\` ➔ Venirse\n` +
        `│ 🍒 \`!grabboobs\` ➔ Agarrar tetas\n` +
        `│ 👄 \`!blowjob\` ➔ Oral\n` +
        `│ 🍒 \`!boobjob\` ➔ Cubana\n` +
        `│ ✊ \`!fap\` ➔ Masturbarse\n` +
        `│ 🦶 \`!footjob\` ➔ Con los pies\n` +
        `│ 👆 \`!fingering\` ➔ Meter dedos\n` +
        `│ 🥧 \`!creampie\` ➔ Creampie\n` +
        `│ 😮 \`!facesitting\` ➔ Facesitting\n` +
        `│ 🍆 \`!futanari\` ➔ Futanari\n` +
        `│ 🍆 \`!pegging\` ➔ Pegging\n` +
        `│ ⛓️ \`!bondage\` ➔ Bondage\n` +
        `│ 👄 \`!deepthroat\` ➔ Deepthroat\n` +
        `│ 🦵 \`!thighjob\` ➔ Thighjob\n` +
        `│ 👬 \`!yaoi\` ➔ Yaoi/Gay\n` +
        `│ 💦 \`!bukkake\` ➔ Bukkake\n` +
        `│ 🎉 \`!orgy\` ➔ Orgía\n` +
        `│ 💧 \`!squirting\` ➔ Squirt\n` +
        `│\n` +
        `│ 💡 *Uso:* \`!comando @usuario\`\n` +
        `│ 🎬 *Formato:* Video/GIF\n` +
        `│ 📝 *Total:* ${allCommands.length} comandos\n` +
        `│\n` +
        `│ 🤖 Bot: *${botName}*\n` +
        `╰──────────────`

    await m.reply(listText)
}
