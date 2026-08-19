/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/casino/carrera.js
ʚĭɞ ೃ funcion :: Apostar a un corredor en una carrera simulada (Multiplica x3.5)
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber, pick } from '../../lib/utils.js'

const RACERS = [
    { id: '1', name: '🏎️ Auto Rojo' },
    { id: '2', name: '🐎 Caballo' },
    { id: '3', name: '🛵 Motocicleta' },
    { id: '4', name: '🚀 Cohete' }
]

export default {
    command: ['carrera', 'race'],

    async run(m, { args }) {
        const user = getUser(m.sender)
        const wallet = user.coins || 0

        const choice = args[0]
        let amountInput = args[1]?.toLowerCase()

        if (!choice || !['1', '2', '3', '4'].includes(choice)) {
            return m.reply(
                `🏎️ *CARRERA DE APUESTAS*\n\n` +
                `Elige a tu competidor favorito (Ganas x3.5 tu apuesta):\n` +
                `1️⃣ 🏎️ Auto Rojo\n` +
                `2️⃣ 🐎 Caballo\n` +
                `3️⃣ 🛵 Motocicleta\n` +
                `4️⃣ 🚀 Cohete\n\n` +
                `Uso: \`.carrera <1-4> <monto>\`\nEjemplo: \`.carrera 2 500\``
            )
        }

        if (!amountInput) {
            return m.reply('⚠️ Especifica la cantidad a apostar.')
        }

        let amount = amountInput === 'all' || amountInput === 'todo' ? wallet : parseInt(amountInput)

        if (isNaN(amount) || amount <= 0) {
            return m.reply('❌ Ingresa una cantidad numérica válida.')
        }

        if (amount > wallet) {
            return m.reply(`❌ No tienes monedas suficientes. Saldo: *${formatNumber(wallet)}* 🪙`)
        }

        const winner = pick(RACERS)
        const selected = RACERS.find(r => r.id === choice)

        if (selected.id === winner.id) {
            const earnings = Math.floor(amount * 2.5) // Ganancia neta (+x2.5)
            updateUser(m.sender, { coins: wallet + earnings })

            return m.reply(
                `🏁 *¡RESULTADOS DE LA CARRERA!* 🏁\n\n` +
                `🥇 Ganador: *${winner.name}*\n` +
                `Tu apuesta: *${selected.name}*\n\n` +
                `🎉 ¡ACERTADAZO! Tu corredor llegó primero.\n` +
                `💰 Ganancia: *+${formatNumber(earnings)}* monedas 🪙\n` +
                `👛 Saldo Actual: *${formatNumber(wallet + earnings)}*`
            )
        } else {
            updateUser(m.sender, { coins: wallet - amount })

            return m.reply(
                `🏁 *¡RESULTADOS DE LA CARRERA!* 🏁\n\n` +
                `🥇 Ganador: *${winner.name}*\n` +
                `Tu apuesta: *${selected.name}*\n\n` +
                `❌ Tu corredor quedó rezagado. Perdiste *${formatNumber(amount)}* monedas 🪙`
            )
        }
    }
}
