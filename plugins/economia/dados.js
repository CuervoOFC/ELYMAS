/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/casino/dado.js
ʚĭɞ ೃ funcion :: Adivinar la cara de un dado (del 1 al 6 - Multiplica x5)
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber, randomInt } from '../../lib/utils.js'

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export default {
    command: ['dado', 'dice', 'dados'],

    async run(m, { args }) {
        const user = getUser(m.sender)
        const wallet = user.coins || 0

        const guessedFace = parseInt(args[0])
        let amountInput = args[1]?.toLowerCase()

        if (isNaN(guessedFace) || guessedFace < 1 || guessedFace > 6) {
            return m.reply(
                `🎲 *JUEGO DE DADOS*\n\n` +
                `Adivina qué cara del dado caerá (del 1 al 6). ¡Si aciertas multiplicas x5!\n\n` +
                `Uso: \`.dado <número 1-6> <cantidad>\`\n` +
                `Ejemplo: \`.dado 4 500\``
            )
        }

        if (!amountInput) {
            return m.reply('⚠️ Ingresa el monto que deseas apostar.')
        }

        let amount = amountInput === 'all' || amountInput === 'todo' ? wallet : parseInt(amountInput)

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa un monto numérico válido.')
        }

        if (amount > wallet) {
            return m.reply(`❌ No tienes monedas suficientes. Saldo: *${formatNumber(wallet)}* 🪙`)
        }

        const rolled = randomInt(1, 6)
        const diceIcon = DICE_FACES[rolled - 1]

        if (guessedFace === rolled) {
            const earnings = amount * 4 // Pago x5 (monto apostado + x4 ganancia)
            updateUser(m.sender, { coins: wallet + earnings })

            return m.reply(
                `🎲 *¡LANZANDO DADO!* 🎲\n\n` +
                `🎯 El dado cayó en: *${rolled}* ${diceIcon}\n` +
                `Tu predicción: *${guessedFace}*\n\n` +
                `🎉 *¡ACERTADAZO! Multiplicador x5*\n` +
                `💰 Ganancia: *+${formatNumber(earnings)}* monedas 🪙\n` +
                `👛 Nuevo Saldo: *${formatNumber(wallet + earnings)}*`
            )
        } else {
            updateUser(m.sender, { coins: wallet - amount })

            return m.reply(
                `🎲 *¡LANZANDO DADO!* 🎲\n\n` +
                `🎯 El dado cayó en: *${rolled}* ${diceIcon}\n` +
                `Tu predicción: *${guessedFace}*\n\n` +
                `❌ Fallaste. Perdiste *${formatNumber(amount)}* monedas 🪙\n` +
                `👛 Nuevo Saldo: *${formatNumber(wallet - amount)}*`
            )
        }
    }
}
