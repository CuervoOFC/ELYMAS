/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/casino/coinflip.js
ʚĭɞ ೃ funcion :: Apustas a cara o cruz (50/50)
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber, chance } from '../../lib/utils.js'

export default {
    command: ['coinflip', 'cf', 'volado', 'suerte'],

    async run(m, { args }) {
        const user = getUser(m.sender)
        const wallet = user.coins || 0

        const choiceInput = args[0]?.toLowerCase()
        let amountInput = args[1]?.toLowerCase()

        if (!choiceInput || !['cara', 'cruz'].includes(choiceInput)) {
            return m.reply(
                `🪙 *¡COINFLIP / VOLADO!*\n\n` +
                `Uso correcto:\n` +
                `• \`.cf cara <cantidad>\`\n` +
                `• \`.cf cruz <cantidad>\`\n\n` +
                `Ejemplo: \`.cf cara 500\` o \`.cf cruz all\``
            )
        }

        if (!amountInput) {
            return m.reply('⚠️ Ingresa la cantidad que deseas apostar.')
        }

        let amount = amountInput === 'all' || amountInput === 'todo' ? wallet : parseInt(amountInput)

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa un monto válido para apostar.')
        }

        if (amount > wallet) {
            return m.reply(`❌ No tienes suficientes monedas. Tu saldo es: *${formatNumber(wallet)}* 🪙`)
        }

        const win = chance(50) // 50% probabilidad
        const result = win ? choiceInput : (choiceInput === 'cara' ? 'cruz' : 'cara')

        if (win) {
            updateUser(m.sender, { coins: wallet + amount })
            return m.reply(
                `🪙 *¡LANZANDO LA MONEDA!* 🪙\n\n` +
                `✨ La moneda cayó en: *${result.toUpperCase()}*\n` +
                `🎉 ¡Felicidades! Ganaste *${formatNumber(amount)}* monedas. 🪙\n` +
                `👛 Nuevo Saldo: *${formatNumber(wallet + amount)}*`
            )
        } else {
            updateUser(m.sender, { coins: wallet - amount })
            return m.reply(
                `🪙 *¡LANZANDO LA MONEDA!* 🪙\n\n` +
                `💀 La moneda cayó en: *${result.toUpperCase()}*\n` +
                `❌ Perdiste *${formatNumber(amount)}* monedas.\n` +
                `👛 Nuevo Saldo: *${formatNumber(wallet - amount)}*`
            )
        }
    }
}
