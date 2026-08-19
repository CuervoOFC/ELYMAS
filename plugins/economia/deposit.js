/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/deposit.js
ʚĭɞ ೃ funcion :: Depositar monedas de la billetera al banco
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
    command: ['deposit', 'dep', 'depositar'],

    async run(m, { args }) {
        const user = getUser(m.sender)
        const wallet = user.coins || 0

        if (wallet <= 0) {
            return m.reply('❌ No tienes monedas en la billetera para depositar.')
        }

        let amount = args[0]?.toLowerCase()

        if (!amount) {
            return m.reply('⚠️ Especifica la cantidad que deseas depositar o usa `all` / `todo`. Ejemplo: `.depositar 500`')
        }

        if (amount === 'all' || amount === 'todo') {
            amount = wallet
        } else {
            amount = parseInt(amount)
        }

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa una cantidad numérica válida.')
        }

        if (amount > wallet) {
            return m.reply(`❌ No tienes suficiente dinero en tu billetera. Monedas disponibles: *${formatNumber(wallet)}*`)
        }

        updateUser(m.sender, {
            coins: wallet - amount,
            bank: (user.bank || 0) + amount
        })

        return m.reply(
            `🏦 *¡DEPÓSITO EXITOSO!*\n\n` +
            `💰 *Depositado:* ${formatNumber(amount)} monedas\n` +
            `👛 *Billetera:* ${formatNumber(wallet - amount)} monedas\n` +
            `🏛️ *Banco:* ${formatNumber((user.bank || 0) + amount)} monedas`
        )
    }
}
