/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/retirar.js
ʚĭɞ ೃ funcion :: Retirar monedas del banco a la billetera
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
    command: ['withdraw', 'retirar', 'ret'],

    async run(m, { args }) {
        const user = getUser(m.sender)
        const bank = user.bank || 0

        if (bank <= 0) {
            return m.reply('❌ No tienes fondos guardados en el banco.')
        }

        let amount = args[0]?.toLowerCase()

        if (!amount) {
            return m.reply('⚠️ Especifica la cantidad que deseas retirar o usa `all` / `todo`. Ejemplo: `.retirar 500`')
        }

        if (amount === 'all' || amount === 'todo') {
            amount = bank
        } else {
            amount = parseInt(amount)
        }

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa una cantidad numérica válida.')
        }

        if (amount > bank) {
            return m.reply(`❌ No tienes suficiente dinero en tu banco. Fondos actuales: *${formatNumber(bank)}*`)
        }

        updateUser(m.sender, {
            coins: (user.coins || 0) + amount,
            bank: bank - amount
        })

        return m.reply(
            `💸 *¡RETIRO EXITOSO!*\n\n` +
            `💰 *Retirado:* ${formatNumber(amount)} monedas\n` +
            `👛 *Billetera:* ${formatNumber((user.coins || 0) + amount)} monedas\n` +
            `🏛️ *Banco restante:* ${formatNumber(bank - amount)} monedas`
        )
    }
}
