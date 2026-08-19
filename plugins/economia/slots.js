/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/casino/slots.js
ʚĭɞ ೃ funcion :: Máquina tragamonedas (3 símbolos iguales duplican o triplican)
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber, pick } from '../../lib/utils.js'

const SYMBOLS = ['🍇', '🍊', '🍋', '🔔', '💎', '7️⃣']

export default {
    command: ['slots', 'tragamonedas', 'slot'],

    async run(m, { args }) {
        const user = getUser(m.sender)
        const wallet = user.coins || 0

        let amountInput = args[0]?.toLowerCase()

        if (!amountInput) {
            return m.reply('⚠️ Especifica la cantidad que quieres apostar. Ejemplo: `.slots 500` o `.slots all`')
        }

        let amount = amountInput === 'all' || amountInput === 'todo' ? wallet : parseInt(amountInput)

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa una cantidad numérica válida.')
        }

        if (amount > wallet) {
            return m.reply(`❌ No tienes saldo suficiente. Monedas: *${formatNumber(wallet)}* 🪙`)
        }

        const s1 = pick(SYMBOLS)
        const s2 = pick(SYMBOLS)
        const s3 = pick(SYMBOLS)

        let multiplier = 0

        if (s1 === s2 && s2 === s3) {
            multiplier = s1 === '7️⃣' ? 5 : 3 // Jackpot triple de 7s da x5, otros símbolos triples dan x3
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            multiplier = 1.5 // 2 símbolos iguales reembolsan x1.5
        }

        const board = `
🎰 *TRAGAMONEDAS* 🎰
───────────────
       [ ${s1} | ${s2} | ${s3} ]
───────────────`

        if (multiplier > 0) {
            const winAmount = Math.floor(amount * multiplier) - amount
            updateUser(m.sender, { coins: wallet + winAmount })

            return m.reply(
                `${board}\n\n` +
                `🎉 ¡FELICIDADES!\n` +
                `💰 Monedas ganadas: *+${formatNumber(winAmount)}* 🪙\n` +
                `👛 Nuevo Saldo: *${formatNumber(wallet + winAmount)}*`
            )
        } else {
            updateUser(m.sender, { coins: wallet - amount })

            return m.reply(
                `${board}\n\n` +
                `❌ Sin coincidencias. Perdiste *${formatNumber(amount)}* monedas.\n` +
                `👛 Nuevo Saldo: *${formatNumber(wallet - amount)}*`
            )
        }
    }
}
