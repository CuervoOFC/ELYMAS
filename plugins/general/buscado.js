/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/general/buscando.js
ʚĭɞ ೃ funcion :: mención doble (emisor y objetivo)
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

/**
 * Resuelve y extrae el identificador directo (JID o LID) para menciones en Baileys.
 */
async function resolveParticipant(rawId, altPn, conn) {
    if (!rawId && !altPn) return { mentionId: '', tagText: '' }

    // 1. Si Baileys proporciona el Phone Number real en senderPn / participantAlt, usar ese
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

    // 2. Intentar obtener mapping con sock.findUserId si es un LID puro o número
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
            // Silenciar fallo si no hay coincidencia
        }
    }

    // 3. Fallback: usar el ID directo entregado por WhatsApp
    const tag = str.split('@')[0].replace(/[^0-9]/g, '') || 'usuario'
    return {
        mentionId: str,
        tagText: tag
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

        // 1. Resolver emisor (el que manda el mensaje)
        const senderRaw = m.sender || m.key.participant || m.participant
        const senderPn = m.key?.senderPn || m.key?.participantAlt
        const sender = await resolveParticipant(senderRaw, senderPn, conn)

        // 2. Extraer objetivo (mencionado o citado)
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

        // Si no mencionó ni citó a nadie
        if (!target.mentionId) {
            return m.reply('⚠️ Debes mencionar `@usuario` o responder a un mensaje de la persona que estás buscando.')
        }

        // Construir arreglo de menciones para WhatsApp
        const mentions = [sender.mentionId, target.mentionId]

        // Mensaje formateado
        const messageText = 
            `🔍 *BÚSQUEDA EN PROCESO*\n\n` +
            `👀 @${sender.tagText} está buscando a @${target.tagText} 📢\n\n` +
            `🤖 Bot: *${botName}*`

        // Enviar mensaje etiquetando a ambos
        await conn.sendMessage(m.chat, {
            text: messageText,
            mentions: mentions
        }, { quoted: m })
    }
}
