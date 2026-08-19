/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/casino/ruleta.js
ʚĭɞ ೃ funcion :: Apuestas de ruleta (rojo/negro multiplica x2, número exacto x36)
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber, randomInt } from '../../lib/utils.js'

export default {
    command: ['ruleta', 'rt', 'roulette'],

    async run(m, { args }) {
        const user = getUser(m.sender)
        const wallet = user.coins || 0

        const target = args[0]?.toLowerCase()
        let amountInput = args[1]?.toLowerCase()

        if (!target || !amountInput) {
            return m.reply(
                `🎰 *RULETA DE CASINO*\n\n` +
                `Uso del comando:\n` +
                `• \`.rt rojo <monto>\` *(Multiplica x2)*\n` +
                `• \`.rt negro <monto>\` *(Multiplica x2)*\n` +
                `• \`.rt <0-36> <monto>\` *(Multiplica x36)*\n\n` +
                `Ejemplo: \`.rt rojo 1000\` o \`.rt 7 200\``
            )
        }

        let amount = amountInput === 'all' || amountInput === 'todo' ? wallet : parseInt(amountInput)

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa una cantidad numérica válida.')
        }

        if (amount > wallet) {
            return m.reply(`❌ Saldo insuficiente. Monedas actuales: *${formatNumber(wallet)}* 🪙`)
        }

        // Girar la ruleta (0 al 36)
        const landingNumber = randomInt(0, 36)
        let landingColor = 'verde'

        if (landingNumber !== 0) {
            // Asignación simple par/impar para rojo y negro
            landingColor = landingNumber % 2 === 0 ? 'rojo' : 'negro'
        }

        let won = false
        let multiplier = 0

        // Verificar resultado
        if (target === 'rojo' || target === 'negro') {
            if (target === landingColor) {
                won = true
                multiplier = 2
            }
        } else {
            const targetNum = parseInt(target)
            if (!isNaN(targetNum) && targetNum >= 0 && targetNum <= 36) {
                if (targetNum === landingNumber) {
                    won = true
                    multiplier = 36
                }
            } else {
                return m.reply('❌ Tipo de apuesta inválido. Usa: `rojo`, `negro` o un número entre `0 y 36`.')
            }
        }

        if (won) {
            const earnings = amount * (multiplier - 1)
            updateUser(m.sender, { coins: wallet + earnings })
            return m.reply(
                `🎡 *¡GIRANDO LA RULETA!* 🎡\n\n` +
                `📍 Bola cayó en: *${landingNumber}* (${landingColor.toUpperCase()})\n` +
                `🎉 ¡GANASTE! Multiplicador: *x${multiplier}*\n` +
                `💰 Ganancia pura: *+${formatNumber(earnings)}* monedas! 🪙`
            )
        } else {
            updateUser(m.sender, { coins: wallet - amount })
            return m.reply(
                `🎡 *¡GIRANDO LA RULETA!* 🎡\n\n` +
                `📍 Bola cayó en: *${landingNumber}* (${landingColor.toUpperCase()})\n` +
                `❌ Mala suerte, perdiste *${formatNumber(amount)}* monedas. 🪙`
            )
        }
    }
}
