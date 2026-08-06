/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ r codigo :: plugins/general/buscando.js
ʚĭɞ ೃ funcion :: muestra y etiqueta los números del emisor y el citado/mencionado
──────✧✦✧──────
*/

import config from '../config.js'
import { getSubbotConfig } from '../lib/subbotconfig.js'

async function resolveParticipant(rawId, altPn, conn) {
    if (!rawId && !altPn) return { mentionId: '', tagText: '', phoneNumber: '' }

    if (altPn) {
        const cleanPn = String(altPn).split('@')[0].replace(/[^0-9]/g, '')
        if (cleanPn) {
            return {
                mentionId: `${cleanPn}@s.whatsapp.net`,
                tagText: cleanPn,
                phoneNumber: `+${cleanPn}`
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
                        tagText: pn,
                        phoneNumber: `+${pn}`
                    }
                }
            }
        } catch (e) {
        }
    }
    const cleanNumber = str.split('@')[0].replace(/[^0-9]/g, '') || 'Desconocido'
    return {
        mentionId: str,
        tagText: cleanNumber,
        phoneNumber: cleanNumber !== 'Desconocido' ? `+${cleanNumber}` : 'No disponible'
    }
}

export default {
    command: ['buscar', 'buscando'],

    async run(m, { conn }) {
        if (!m.isGroup) {
            return m.reply('⚠️ Este comando solo se puede usar en grupos.')
        }

        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

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

        if (!target.mentionId) {
            return m.reply('⚠️ Debes mencionar a `@usuario` o responder a un mensaje de la persona que buscas.')
        }

        const mentions = [sender.mentionId, target.mentionId]

        const messageText = 
            `🔍 *BÚSQUEDA EN PROCESO*\n\n` +
            `👤 *Buscador:* @${sender.tagText}\n` +
            `📱 *Número:* ${sender.phoneNumber}\n\n` +
            `🎯 *Buscado:* @${target.tagText}\n` +
            `📞 *Número:* ${target.phoneNumber}\n\n` +
            `📢 _@${sender.tagText} está buscando a @${target.tagText}_ 😏\n\n` +
            `🤖 Bot: *${botName}*`

        await conn.sendMessage(m.chat, {
            text: messageText,
            mentions: mentions
        }, { quoted: m })
    }
}
