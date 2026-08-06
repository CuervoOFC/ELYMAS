/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/grupos/pfp.js
ʚĭɞ ೃ funcion :: obtiene la foto de perfil, nombre, número y etiqueta del usuario o objetivo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

// Foto por defecto cuando el usuario no tiene foto pública
const DEFAULT_PFP = 'https://i.imgur.com/2w3A80k.jpeg'

/**
 * Resuelve el JID/LID, número limpio y pushName del participante
 */
async function resolveParticipant(rawId, altPn, conn, fallbackName) {
    if (!rawId && !altPn) return null

    let jid = ''
    let phoneNumber = ''

    // 1. Validar si viene Phone Number nativo de Baileys
    if (altPn) {
        const cleanPn = String(altPn).split('@')[0].replace(/[^0-9]/g, '')
        if (cleanPn) {
            jid = `${cleanPn}@s.whatsapp.net`
            phoneNumber = cleanPn
        }
    }

    const str = String(rawId || '').split(':')[0]

    // 2. Probar resolución con sock.findUserId
    if (!phoneNumber && conn && typeof conn.findUserId === 'function') {
        try {
            const cleanQuery = str.split('@')[0].replace(/[^0-9]/g, '')
            if (cleanQuery && cleanQuery.length >= 8) {
                const res = await conn.findUserId(cleanQuery)
                if (res?.phoneNumber) {
                    phoneNumber = res.phoneNumber.split('@')[0].replace(/[^0-9]/g, '')
                    jid = res.phoneNumber
                }
            }
        } catch (e) {
            // Silenciar fallo
        }
    }

    // 3. Fallback directo
    if (!jid) jid = str
    if (!phoneNumber) phoneNumber = str.split('@')[0].replace(/[^0-9]/g, '') || 'Desconocido'

    return {
        jid: jid,
        phoneNumber: phoneNumber !== 'Desconocido' ? `+${phoneNumber}` : 'No disponible',
        tagText: phoneNumber,
        name: fallbackName || `@${phoneNumber}`
    }
}

export default {
    command: ['pfp', 'perfil', 'avatar', 'getpic'],

    async run(m, { conn }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        // 1. Determinar quién es el objetivo
        let targetRaw = null
        let targetPn = null
        let targetName = null

        const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo
        const mentionedJids = m.mentionedJid || contextInfo?.mentionedJid || []

        if (mentionedJids.length > 0) {
            // Usuario mencionado con @
            targetRaw = mentionedJids[0]
            targetPn = contextInfo?.mentionedPn || contextInfo?.participantAlt
        } else if (m.quoted) {
            // Mensaje citado/respondido
            targetRaw = m.quoted.sender || m.quoted.participant || m.quoted.key?.participant
            targetPn = m.quoted.senderPn || m.quoted.key?.participantAlt
            targetName = m.quoted.pushName || m.quoted.name
        } else {
            // Sin mención ni respuesta -> Mismo usuario que envía el comando
            targetRaw = m.sender || m.key.participant || m.participant
            targetPn = m.key?.senderPn || m.key?.participantAlt
            targetName = m.pushName || m.name
        }

        const target = await resolveParticipant(targetRaw, targetPn, conn, targetName)

        if (!target || !target.jid) {
            return m.reply('❌ No se pudo determinar el usuario.')
        }

        await m.reply('🖼️ Obteniendo foto de perfil...')

        // 2. Obtener Foto de Perfil desde WhatsApp Web API
        let pfpUrl = DEFAULT_PFP
        try {
            pfpUrl = await conn.profilePictureUrl(target.jid, 'image')
        } catch (e) {
            // Si el usuario no tiene foto pública o dio privado, usa la foto default
            pfpUrl = DEFAULT_PFP
        }

        // 3. Intentar obtener el nombre guardado en contactos o chat
        let displayName = target.name
        if (!displayName || displayName.startsWith('@')) {
            const contact = conn.contacts?.[target.jid] || conn.contacts?.[targetRaw]
            displayName = contact?.name || contact?.notify || target.name
        }

        // 4. Formatear mensaje y enviar imagen
        const captionText = 
            `👤 *INFORMACIÓN DE PERFIL*\n\n` +
            `📛 *Nombre:* ${displayName}\n` +
            `📱 *Número:* ${target.phoneNumber}\n` +
            `🏷️ *Etiqueta:* @${target.tagText}\n\n` +
            `🤖 Bot: *${botName}*`

        await conn.sendMessage(m.chat, {
            image: { url: pfpUrl },
            caption: captionText,
            mentions: [target.jid]
        }, { quoted: m })
    }
}
