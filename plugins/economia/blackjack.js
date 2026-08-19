/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/casino/blackjack.js
ʚĭɞ ೃ funcion :: Juego de Blackjack / 21 contra el bot
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber, randomInt } from '../../lib/utils.js'

export default {
    command: ['blackjack', 'bj', '21'],

    async run(m, { args }) {
        const user = getUser(m.sender)
        const wallet = user.coins || 0

        let amountInput = args[0]?.toLowerCase()

        if (!amountInput) {
            return m.reply('⚠️ Especifica la cantidad que deseas apostar. Ejemplo: `.bj 500` o `.bj all`')
        }

        let amount = amountInput === 'all' || amountInput === 'todo' ? wallet : parseInt(amountInput)

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa un monto numérico válido.')
        }

        if (amount > wallet) {
            return m.reply(`❌ No tienes suficiente dinero. Tu saldo actual: *${formatNumber(wallet)}* 🪙`)
        }

        // Cartas iniciales
        const playerCard1 = randomInt(2, 11)
        const playerCard2 = randomInt(2, 11)
        const playerTotal = playerCard1 + playerCard2

        const botCard1 = randomInt(2, 11)
        const botCard2 = randomInt(2, 11)
        const botTotal = botCard1 + botCard2

        let resultText = ''
        let won = false
        let tie = false

        // Lógica de juego
        if (playerTotal === 21 && botTotal !== 21) {
            won = true
            resultText = '🃏 *¡BLACKJACK!* Obtuviste 21 en la mano inicial.'
        } else if (playerTotal > 21) {
            won = false
            resultText = '💥 Te pasaste de 21.'
        } else if (botTotal > 21) {
            won = true
            resultText = '🤖 El bot se pasó de 21.'
        } else if (playerTotal > botTotal) {
            won = true
            resultText = '🎉 Tu mano es más cercana a 21 que la del bot.'
        } else if (botTotal > playerTotal) {
            won = false
            resultText = '🤖 El bot obtuvo una mejor mano.'
        } else {
            tie = true
            resultText = '⚖️ ¡Empate! Se devuelven las apuestas.'
        }

        if (tie) {
            return m.reply(
                `🃏 *BLACKJACK / 21* 🃏\n\n` +
                `👤 *Tus Cartas:* [${playerCard1}, ${playerCard2}] ➔ *Total: ${playerTotal}*\n` +
                `🤖 *Bot Cartas:* [${botCard1}, ${botCard2}] ➔ *Total: ${botTotal}*\n\n` +
                `${resultText}\n` +
                `👛 Conservas tus *${formatNumber(amount)}* monedas.`
            )
        }

        if (won) {
            updateUser(m.sender, { coins: wallet + amount })
            return m.reply(
                `🃏 *BLACKJACK / 21* 🃏\n\n` +
                `👤 *Tus Cartas:* [${playerCard1}, ${playerCard2}] ➔ *Total: ${playerTotal}*\n` +
                `🤖 *Bot Cartas:* [${botCard1}, ${botCard2}] ➔ *Total: ${botTotal}*\n\n` +
                `🎉 *¡GANASTE!* ${resultText}\n` +
                `💰 Ganancia: *+${formatNumber(amount)}* monedas 🪙\n` +
                `👛 Saldo Actual: *${formatNumber(wallet + amount)}*`
            )
        } else {
            updateUser(m.sender, { coins: wallet - amount })
            return m.reply(
                `🃏 *BLACKJACK / 21* 🃏\n\n` +
                `👤 *Tus Cartas:* [${playerCard1}, ${playerCard2}] ➔ *Total: ${playerTotal}*\n` +
                `🤖 *Bot Cartas:* [${botCard1}, ${botCard2}] ➔ *Total: ${botTotal}*\n\n` +
                `❌ *PERDISTE.* ${resultText}\n` +
                `💸 Pérdida: *-${formatNumber(amount)}* monedas 🪙\n` +
                `👛 Saldo Actual: *${formatNumber(wallet - amount)}*`
            )
        }
    }
}
