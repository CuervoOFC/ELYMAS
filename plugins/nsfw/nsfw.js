/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/nsfw/nsfw.js
ʚĭɞ ೃ funcion :: comandos de interaccion nsfw con verificacion
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'
import { getGroup } from '../../lib/database.js'
import axios from 'axios'

const API_URL = 'https://api.evogb.org/nsfw/interaction?type=list&key=evogb-WzR3kPpa'

// Mapeo completo de comandos a textos personalizados
const commandTexts = {
    spank: { action: 'azotó', emoji: '👋', desc: 'Golpear las nalgas para excitación sexual' },
    undress: { action: 'desvistió', emoji: '👗', desc: 'Quitar la ropa para exponer el cuerpo desnudo' },
    yuri: { action: 'hizo yuri con', emoji: '👭', desc: 'Posición lésbica donde se frotan los genitales mutuamente' },
    sixnine: { action: 'hizo un 69 con', emoji: '🔥', desc: 'Posición donde ambos se estimulan oralmente al mismo tiempo' },
    anal: { action: 'penetró analmente a', emoji: '🍑', desc: 'Penetración sexual por el ano' },
    fuck: { action: 'cogió con', emoji: '💦', desc: 'Acto de penetración sexual vigorosa' },
    cummouth: { action: 'se vino en la boca de', emoji: '👄', desc: 'Eyaculación dentro de la boca durante el sexo oral' },
    suckboobs: { action: 'chupó las tetas de', emoji: '🍒', desc: 'Estimular los pechos con la boca y lengua' },
    cumshot: { action: 'le hizo un cumshot a', emoji: '💦', desc: 'Eyaculación externa sobre el cuerpo o rostro' },
    lickpussy: { action: 'lamió el coño de', emoji: '👅', desc: 'Estimular la vulva con la lengua' },
    lickdick: { action: 'lamió la verga de', emoji: '👅', desc: 'Lamer el pene para excitación' },
    lickass: { action: 'lamió el culo de', emoji: '👅', desc: 'Lamer el ano para placer sexual' },
    handjob: { action: 'le hizo una paja a', emoji: '✊', desc: 'Masturbación manual del pene' },
    grope: { action: 'agarró las nalgas de', emoji: '🍑', desc: 'Acariciar o apretar las nalgas de forma sexual' },
    cum: { action: 'se vino con', emoji: '💦', desc: 'Eyaculación intensa o clímax sexual' },
    grabboobs: { action: 'agarró las tetas de', emoji: '🍒', desc: 'Agarar los pechos con las manos para estimulación' },
    blowjob: { action: 'le hizo un oral a', emoji: '👄', desc: 'Sexo oral en el pene hasta la eyaculación' },
    boobjob: { action: 'le hizo una cubana a', emoji: '🍒', desc: 'Estimular el pene entre los pechos' },
    fap: { action: 'se masturbó pensando en', emoji: '✊', desc: 'Masturbación solitaria del pene' },
    footjob: { action: 'le hizo un footjob a', emoji: '🦶', desc: 'Estimular el pene usando los pies' },
    fingering: { action: 'le metió dedos a', emoji: '👆', desc: 'Introducir y mover los dedos en la vagina o ano' },
    creampie: { action: 'le hizo un creampie a', emoji: '🥧', desc: 'Eyaculación interna en la vagina' },
    facesitting: { action: 'se sentó en la cara de', emoji: '😮', desc: 'Sentarse sobre la cara de la pareja' },
    futanari: { action: 'hizo futanari con', emoji: '🍆', desc: 'Personaje futanari realizando actos sexuales' },
    pegging: { action: 'le hizo pegging a', emoji: '🍆', desc: 'Mujer que penetra analmente a un hombre con strap-on' },
    bondage: { action: 'ató con cuerdas a', emoji: '⛓️', desc: 'Atar o inmovilizar a la pareja para dominar' },
    deepthroat: { action: 'le hizo deepthroat a', emoji: '👄', desc: 'Introducir el pene completamente hasta la garganta' },
    thighjob: { action: 'le hizo un thighjob a', emoji: '🦵', desc: 'Estimular el pene frotándolo entre los muslos' },
    yaoi: { action: 'hizo yaoi con', emoji: '👬', desc: 'Posición gay masculina con actos sexuales íntimos' },
    bukkake: { action: 'le hizo bukkake a', emoji: '💦', desc: 'Múltiples hombres eyaculan sobre el rostro o cuerpo' },
    orgy: { action: 'hizo una orgía con', emoji: '🎉', desc: 'Sexo grupal con varias personas simultáneamente' },
    squirting: { action: 'hizo squirt a', emoji: '💧', desc: 'Expulsión de líquido durante el clímax femenino' }
}

// Comandos para la lista
const allCommands = Object.keys(commandTexts)

export default {
    command: [...allCommands, 'nsfwlist', 'listansfw'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const usedCommand = m.text.split(' ')[0].replace(/^[!#.]/, '').toLowerCase()

        // Verificar si es comando de lista
        if (usedCommand === 'nsfwlist' || usedCommand === 'listansfw') {
            return sendNsfwList(m, conn, botName)
        }

        // Verificar si es grupo
        if (!m.isGroup) {
            return m.reply('⚠️ Los comandos NSFW solo funcionan en grupos.')
        }

        // Verificar si NSFW está activado en el grupo
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

        try {
            const response = await axios.get(API_URL)
            const reactions = response.data.reactions
            const description = reactions[usedCommand] || commandInfo.desc

            let messageText

            if (mentionedUser) {
                const targetName = mentionedUser.split('@')[0]
                messageText = 
                    `🔞 *NSFW INTERACCIÓN*\n\n` +
                    `${commandInfo.emoji} @${senderName} *${commandInfo.action}* @${targetName}\n\n` +
                    `💬 _${description}_\n\n` +
                    `🤖 Bot: *${botName}*`
                
                await conn.sendMessage(m.chat, {
                    text: messageText,
                    mentions: [sender, mentionedUser]
                }, { quoted: m })

            } else {
                messageText = 
                    `🔞 *NSFW INTERACCIÓN*\n\n` +
                    `${commandInfo.emoji} @${senderName} *${commandInfo.action}* alguien especial 😏\n\n` +
                    `💬 _${description}_\n\n` +
                    `🤖 Bot: *${botName}*`
                
                await conn.sendMessage(m.chat, {
                    text: messageText,
                    mentions: [sender]
                }, { quoted: m })
            }

        } catch (error) {
            console.error('Error API NSFW:', error)
            
            // Si falla la API, usar descripción local
            const sender = m.sender
            const senderName = sender.split('@')[0]
            let fallbackText
            
            if (mentionedUser) {
                const targetName = mentionedUser.split('@')[0]
                fallbackText = 
                    `🔞 *NSFW INTERACCIÓN*\n\n` +
                    `${commandInfo.emoji} @${senderName} *${commandInfo.action}* @${targetName}\n\n` +
                    `💬 _${commandInfo.desc}_\n\n` +
                    `🤖 Bot: *${botName}*`
                
                await conn.sendMessage(m.chat, {
                    text: fallbackText,
                    mentions: [sender, mentionedUser]
                }, { quoted: m })
            } else {
                fallbackText = 
                    `🔞 *NSFW INTERACCIÓN*\n\n` +
                    `${commandInfo.emoji} @${senderName} *${commandInfo.action}* alguien especial 😏\n\n` +
                    `💬 _${commandInfo.desc}_\n\n` +
                    `🤖 Bot: *${botName}*`
                
                await conn.sendMessage(m.chat, {
                    text: fallbackText,
                    mentions: [sender]
                }, { quoted: m })
            }
        }
    }
}

// Función para enviar la lista de comandos
async function sendNsfwList(m, conn, botName) {
    const listText = 
        `╭─「 🔞 *COMANDOS NSFW DISPONIBLES* 」\n` +
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
        `│ 😮 \`!facesitting\` ➔ Sentarse en cara\n` +
        `│ 🍆 \`!futanari\` ➔ Futanari\n` +
        `│ 🍆 \`!pegging\` ➔ Pegging\n` +
        `│ ⛓️ \`!bondage\` ➔ Bondage\n` +
        `│ 👄 \`!deepthroat\` ➔ Garganta profunda\n` +
        `│ 🦵 \`!thighjob\` ➔ Entre muslos\n` +
        `│ 👬 \`!yaoi\` ➔ Yaoi/Gay\n` +
        `│ 💦 \`!bukkake\` ➔ Bukkake\n` +
        `│ 🎉 \`!orgy\` ➔ Orgía\n` +
        `│ 💧 \`!squirting\` ➔ Squirt\n` +
        `│\n` +
        `│ 💡 *Uso:* \`!comando @usuario\`\n` +
        `│ 📝 *Total:* ${allCommands.length} comandos\n` +
        `│\n` +
        `│ 🤖 Bot: *${botName}*\n` +
        `╰──────────────`

    await m.reply(listText)
}
