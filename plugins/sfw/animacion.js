/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/sfw/animaciones.js
ʚĭɞ funcion :: Reacciones/Interacciones SFW con control ON/OFF por grupo y lista dinámica
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'
import { getGroup, updateGroup } from '../../lib/database.js'
import axios from 'axios'

const API_KEY = 'evogb-WzR3kPpa'
const API_BASE_URL = 'https://api.evogb.org/sfw/interaction'

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
        } catch (e) {}
    }

    const tag = str.split('@')[0].replace(/[^0-9]/g, '') || 'usuario'
    return {
        mentionId: str,
        tagText: tag
    }
}

// Mapeo completo obtenido del endpoint de reacciones de la API
const commandTexts = {
    peek: { action: 'espió a', emoji: '👀' },
    comfort: { action: 'consoló a', emoji: '🤗' },
    thinkhard: { action: 'pensó intensamente en', emoji: '🤔' },
    curious: { action: 'sintió curiosidad por', emoji: '🧐' },
    sniff: { action: 'olfateó a', emoji: '👃' },
    stare: { action: 'miró fijamente a', emoji: '👁️' },
    trip: { action: 'tropezó cerca de', emoji: '😵' },
    blowkiss: { action: 'le lanzó un beso a', emoji: '😘' },
    snuggle: { action: 'se acurrucó con', emoji: '🫂' },
    angry: { action: 'se enojó con', emoji: '😡' },
    bleh: { action: 'le sacó la lengua a', emoji: '😛' },
    bored: { action: 'se aburrió junto a', emoji: '🥱' },
    clap: { action: 'le aplaudió a', emoji: '👏' },
    coffee: { action: 'tomó un café con', emoji: '☕' },
    dramatic: { action: 'actuó dramáticamente frente a', emoji: '🎭' },
    drunk: { action: 'se emborrachó con', emoji: '🍺' },
    cold: { action: 'sintió frío y buscó calor en', emoji: '🥶' },
    impregnate: { action: 'dejó embarazada a', emoji: '🤰' },
    kisscheek: { action: 'le dio un beso en la mejilla a', emoji: '😚' },
    sing: { action: 'le cantó una canción a', emoji: '🎤' },
    tickle: { action: 'le hizo cosquillas a', emoji: '🤏' },
    scream: { action: 'le gritó a', emoji: '😱' },
    push: { action: 'empujó a', emoji: '🖐️' },
    nope: { action: 'le dijo que no a', emoji: '🙅' },
    jump: { action: 'saltó con', emoji: '🦘' },
    heat: { action: 'sintió calor junto a', emoji: '🔥' },
    gaming: { action: 'jugó videojuegos con', emoji: '🎮' },
    draw: { action: 'dibujó a', emoji: '🎨' },
    call: { action: 'llamó por teléfono a', emoji: '📞' },
    laugh: { action: 'se rió de', emoji: '😂' },
    love: { action: 'le expresó su amor a', emoji: '❤️' },
    pout: { action: 'le hizo un puchero a', emoji: '🥺' },
    punch: { action: 'le dio un puñetazo a', emoji: '🥊' },
    run: { action: 'corrió hacia', emoji: '🏃' },
    sad: { action: 'se puso triste con', emoji: '😢' },
    scared: { action: 'se asustó de', emoji: '😨' },
    seduce: { action: 'intentó seducir a', emoji: '😏' },
    shy: { action: 'sintió timidez frente a', emoji: '😳' },
    sleep: { action: 'se durmió al lado de', emoji: '😴' },
    smoke: { action: 'fumó con', emoji: '🚬' },
    spit: { action: 'escupió a', emoji: '💦' },
    step: { action: 'pisó a', emoji: '🦶' },
    think: { action: 'pensó en', emoji: '💭' },
    walk: { action: 'caminó con', emoji: '🚶' },
    hug: { action: 'abrazo a', emoji: '🫂' },
    kill: { action: 'asesinó a', emoji: '🔪' },
    eat: { action: 'comió con', emoji: '🍽️' },
    kiss: { action: 'besó a', emoji: '💋' },
    wink: { action: 'le guiñó el ojo a', emoji: '😉' },
    pat: { action: 'acarició la cabeza de', emoji: '🫳' },
    happy: { action: 'se puso feliz por', emoji: '😊' },
    bully: { action: 'molestó juguetónamente a', emoji: '😜' },
    bite: { action: 'mordió a', emoji: '🦷' },
    blush: { action: 'se sonrojó por', emoji: '🙈' },
    wave: { action: 'le saludó con la mano a', emoji: '👋' },
    bath: { action: 'se bañó con', emoji: '🛁' },
    smug: { action: 'se mostró presumido ante', emoji: '😏' },
    smile: { action: 'le sonrió a', emoji: '😄' },
    highfive: { action: 'chocó los cinco con', emoji: '✋' },
    handhold: { action: 'tomó de las manos a', emoji: '🤝' },
    cringe: { action: 'sintió vergüenza ajena por', emoji: '😬' },
    bonk: { action: 'le dio un bonk en la cabeza a', emoji: '🔨' },
    cry: { action: 'lloró frente a', emoji: '😭' },
    lick: { action: 'lamió a', emoji: '👅' },
    slap: { action: 'le dio una bofetada a', emoji: '👋' },
    dance: { action: 'bailó con', emoji: '💃' },
    cuddle: { action: 'se acurrucó con', emoji: '🧸' }
}

const allCommands = Object.keys(commandTexts)

export default {
    command: ['animacion', 'animaciones', 'animacionlist', ...allCommands],

    async run(m, { conn, args, isAdmin }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const usedCommand = m.text.split(' ')[0].replace(/^[!#.]/, '').toLowerCase()

        // 1. MANEJO DEL COMANDO PRINCIPAL (.animacion / .animaciones)
        if (usedCommand === 'animacion' || usedCommand === 'animaciones') {
            const subOption = args[0]?.toLowerCase()

            if (subOption === 'on' || subOption === 'off') {
                if (!m.isGroup) {
                    return m.reply('⚠️ Esta configuración solo se puede usar en grupos.')
                }
                if (!isAdmin) {
                    return m.reply('👮‍♂️ Solo los administradores pueden activar o desactivar este módulo.')
                }

                const state = subOption === 'on'
                updateGroup(m.chat, { animaciones: state })

                return m.reply(
                    `✨ *Módulo de Animaciones SFW ${state ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*\n\n` +
                    `📌 Estado actual: ${state ? 'Los usuarios pueden interactuar con reacciones.' : 'Comandos de animaciones deshabilitados.'}`
                )
            }

            if (subOption === 'list' || subOption === 'lista' || usedCommand === 'animacionlist') {
                return sendAnimacionList(m, conn, botName)
            }

            return m.reply(
                `🎭 *MÓDULO DE ANIMACIONES / REACCIONES*\n\n` +
                `📌 *Uso disponible:*\n` +
                `• \`.animacion on\` (Activar en el grupo)\n` +
                `• \`.animacion off\` (Desactivar en el grupo)\n` +
                `• \`.animacion list\` (Ver lista de comandos)\n` +
                `• \`.hug @usuario\` (Ejemplo de reacción)`
            )
        }

        if (usedCommand === 'animacionlist') {
            return sendAnimacionList(m, conn, botName)
        }

        // 2. VALIDACIONES DE GRUPO Y ESTADO (ON/OFF)
        if (!m.isGroup) {
            return m.reply('⚠️ Las animaciones solo se pueden usar dentro de grupos.')
        }

        const groupData = getGroup(m.chat)
        if (groupData.animaciones === false) { // Por defecto estará activo salvo que expresamente sea false
            return m.reply(
                '🔒 *El módulo de animaciones está DESACTIVADO en este grupo.*\n\n' +
                '👮‍♂️ Pide a un administrador que use:\n' +
                '`!animacion on` para activar las animaciones SFW.'
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

        await m.reply('🎬 Cargando reacción...')

        try {
            const apiUrl = `${API_BASE_URL}?type=${usedCommand}&key=${API_KEY}`
            const response = await axios.get(apiUrl, { timeout: 15000 })

            if (!response.data?.status || !response.data?.result) {
                return m.reply('❌ No se pudo obtener la animación desde la API.')
            }

            const videoUrl = response.data.result

            const mentions = []
            if (sender.mentionId) mentions.push(sender.mentionId)

            let captionText = ''

            if (target.mentionId) {
                mentions.push(target.mentionId)

                captionText = 
                    `🎭 *REACCIÓN - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${sender.tagText} *${commandInfo.action}* @${target.tagText}\n\n` +
                    `🤖 Bot: *${botName}*`
            } else {
                captionText = 
                    `🎭 *REACCIÓN - ${usedCommand.toUpperCase()}*\n\n` +
                    `${commandInfo.emoji} @${sender.tagText} *${commandInfo.action}* la nada 😅\n\n` +
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
            console.error('Error Animaciones:', error)
            m.reply('❌ Error al obtener la animación. Inténtalo de nuevo.')
        }
    }
}

async function sendAnimacionList(m, conn, botName) {
    const entries = Object.entries(commandTexts)
    let commandsFormatted = ''

    entries.forEach(([cmd, info]) => {
        commandsFormatted += `│ ${info.emoji} \`.${cmd}\` - _${info.action}_\n`
    })

    const listText = 
        `╭─「 🎭 *LISTA DE ANIMACIONES SFW* 」\n` +
        `│\n` +
        `│ 💡 *Uso:* \`.comando @usuario\` o respondiendo a un mensaje\n` +
        `│ 📊 *Total de animaciones:* ${entries.length}\n` +
        `│\n` +
        commandsFormatted +
        `│\n` +
        `🤖 Bot: *${botName}*\n` +
        `╰──────────────`

    await m.reply(listText)
}
