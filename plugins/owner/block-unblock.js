/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot
━━━━━ ☾☽ ━━━━━
ʚĭɞ ⏰ CODIGO JAVASCRIPT ʚĭɞ ⏰
ʚĭɞ ⏰ codigo :: plugins/owner/blockuser.js
ʚĭɞ ⏰ funcion :: Bloquear / Desbloquear el uso de comandos a un usuario
──────✧✦✧──────
*/

import config from '../../config.js'
import { getUser, updateUser } from '../../lib/database.js'

function extractPureNumber(target) {
    if (!target) return ''
    return String(target).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
}

export default {
    command: ['bancmd', 'unbancmd', 'blockuser', 'unblockuser'],

    async run(m, { args, command }) {
        const senderJid = m?.sender || m?.key?.participant || m?.key?.remoteJid || ''
        const senderNum = extractPureNumber(senderJid)

        // Verificación de Owner Global
        const isMainOwner =
            Array.isArray(config?.owners) &&
            config.owners.some(owner => extractPureNumber(owner) === senderNum)

        if (!isMainOwner) {
            return m.reply('🚫 Este comando solo puede ser usado por el *Owner Global*.')
        }

        // Extraer contextInfo por si m.mentionedJid no fue normalizado en el handler
        const msg = m.message || {}
        const contextInfo = 
            msg.extendedTextMessage?.contextInfo ||
            msg.imageMessage?.contextInfo ||
            msg.videoMessage?.contextInfo ||
            m.msg?.contextInfo || {}

        const mentions = m.mentionedJid || contextInfo.mentionedJid || []

        // Obtención de JID del objetivo (Por citación, por mención @, o por texto/número)
        let targetJid = null

        if (m.quoted) {
            targetJid = m.quoted.sender || m.quoted.participant || m.quoted.key?.participant
        } else if (mentions.length > 0) {
            targetJid = mentions[0]
        } else if (args[0]) {
            const cleanNum = extractPureNumber(args[0])
            if (cleanNum && cleanNum.length >= 8) {
                targetJid = `${cleanNum}@s.whatsapp.net`
            }
        }

        if (!targetJid) {
            return m.reply('⚠️ Debes etiquetar a un usuario con `@`, responder a su mensaje o escribir su número.\n\nEjemplo: `.bancmd @usuario`')
        }

        // Asegurar formato JID correcto
        if (!targetJid.includes('@')) {
            targetJid = `${targetJid}@s.whatsapp.net`
        }

        const targetUser = getUser(targetJid) || {}
        const isBlockCommand = ['bancmd', 'blockuser'].includes(command)

        if (isBlockCommand) {
            if (targetUser.banned) {
                return m.reply(`⚠️ El usuario @${targetJid.split('@')[0]} ya se encuentra bloqueado.`, {
                    mentions: [targetJid]
                })
            }

            updateUser(targetJid, { banned: true })
            return conn.sendMessage(m.chat, {
                text: `🚫 El usuario @${targetJid.split('@')[0]} ha sido *bloqueado* y no podrá usar ningún comando.`,
                mentions: [targetJid]
            }, { quoted: m })

        } else {
            if (!targetUser.banned) {
                return m.reply(`⚠️ El usuario @${targetJid.split('@')[0]} no está bloqueado.`, {
                    mentions: [targetJid]
                })
            }

            updateUser(targetJid, { banned: false })
            return conn.sendMessage(m.chat, {
                text: `✅ El usuario @${targetJid.split('@')[0]} ha sido *desbloqueado* y ya puede usar comandos nuevamente.`,
                mentions: [targetJid]
            }, { quoted: m })
        }
    }
}
