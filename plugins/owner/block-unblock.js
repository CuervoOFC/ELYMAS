/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/owner/blockuser.js
ʚĭɞ funcion :: Bloquear / Desbloquear el uso de comandos a un usuario
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

        const isMainOwner =
            Array.isArray(config?.owners) &&
            config.owners.some(owner => extractPureNumber(owner) === senderNum)

        if (!isMainOwner) {
            return m.reply('🚫 Este comando solo puede ser usado por el *Owner Global*.')
        }

        const targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid?.[0] || null)

        if (!targetJid) {
            return m.reply('⚠️ Debes etiquetar a un usuario o responder a su mensaje.\nEjemplo: `.bancmd @usuario`')
        }

        const targetUser = getUser(targetJid)
        const isBlockCommand = ['bancmd', 'blockuser'].includes(command)

        if (isBlockCommand) {
            if (targetUser.banned) {
                return m.reply('⚠️ Este usuario ya se encuentra bloqueado.')
            }

            updateUser(targetJid, { banned: true })
            return m.reply(`🚫 El usuario @${targetJid.split('@')[0]} ha sido *bloqueado* y no podrá usar ningún comando.`)
        } else {
            if (!targetUser.banned) {
                return m.reply('⚠️ Este usuario no está bloqueado.')
            }

            updateUser(targetJid, { banned: false })
            return m.reply(`✅ El usuario @${targetJid.split('@')[0]} ha sido *desbloqueado* y ya puede usar comandos nuevamente.`)
        }
    }
}
