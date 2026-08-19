/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/pay.js
ʚĭɞ ೃ funcion :: Transferir monedas a otro usuario etiquetandolo o respondiendo
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
    command: ['pay', 'transfer', 'donar', 'pagar'],

    async run(m, { args }) {
        const senderUser = getUser(m.sender)
        const wallet = senderUser.coins || 0

        const targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid?.[0] || null)

        if (!targetJid) {
            return m.reply('⚠️ Etiqueta a alguien o responde a su mensaje para transferirle monedas. Ejemplo: `.pay @usuario 500`')
        }

        if (targetJid === m.sender) {
            return m.reply('❌ No puedes transferirte monedas a ti mismo.')
        }

        let amountInput = args.find(a => !a.includes('@'))?.toLowerCase()

        if (!amountInput) {
            return m.reply('⚠️ Especifica la cantidad de monedas que deseas transferir.')
        }

        let amount = amountInput === 'all' || amountInput === 'todo' ? wallet : parseInt(amountInput)

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa una cantidad numérica válida.')
        }

        if (amount > wallet) {
            return m.reply(`❌ No tienes suficientes monedas en la billetera. Tu saldo: *${formatNumber(wallet)}* 🪙`)
        }

        const targetUser = getUser(targetJid)

        updateUser(m.sender, { coins: wallet - amount })
        updateUser(targetJid, { coins: (targetUser.coins || 0) + amount })

        return m.reply(
            `💸 *¡TRANSFERENCIA EXITOSA!*\n\n` +
            `👤 *De:* @${m.sender.split('@')[0]}\n` +
            `🎯 *Para:* @${targetJid.split('@')[0]}\n` +
            `💰 *Monto:* ${formatNumber(amount)} monedas 🪙`
        )
    }
}
