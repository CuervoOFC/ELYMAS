/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/owner/addcoins.js
ʚĭɞ ೃ funcion :: Regalar/Añadir monedas a un usuario (Exclusivo Owner Global)
──────✧✦✧──────
*/

import config from '../../config.js'
import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

function extractPureNumber(target) {
    if (!target) return ''
    return String(target)
        .split('@')[0]
        .split(':')[0]
        .replace(/[^0-9]/g, '')
}

export default {
    command: ['addcoins', 'darcoins', 'addcoins', 'añadirmonedas'],

    async run(m, { args }) {
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
            return m.reply('⚠️ Debes etiquetar a un usuario o responder a su mensaje para darle monedas. Ejemplo: `.addcoins @usuario 1000`')
        }

        let amountInput = args.find(a => !a.includes('@'))?.toLowerCase()

        if (!amountInput) {
            return m.reply('⚠️ Especifica la cantidad de monedas a añadir.')
        }

        let amount = parseInt(amountInput)

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa una cantidad numérica válida.')
        }

        const targetUser = getUser(targetJid)
        const newWallet = (targetUser.coins || 0) + amount

        updateUser(targetJid, { coins: newWallet })

        return m.reply(
            `✨ *¡MONEDAS AÑADIDAS POR EL OWNER!* ✨\n\n` +
            `🎯 *Usuario:* @${targetJid.split('@')[0]}\n` +
            `🪙 *Añadido:* +${formatNumber(amount)} monedas\n` +
            `👛 *Nuevo Saldo:* ${formatNumber(newWallet)} monedas`
        )
    }
}
