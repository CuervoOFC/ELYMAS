/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/casino/raspa.js
ʚĭɞ ೃ funcion :: Boleto de Raspa y Gana estilo Lotería
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber, pick } from '../../lib/utils.js'

const ICONS = ['🪙', '💎', '👑', '💣', '💵', '⭐']

export default {
    command: ['raspa', 'scratch'],

    async run(m) {
        const user = getUser(m.sender)
        const wallet = user.coins || 0
        const TICKET_COST = 300

        if (wallet < TICKET_COST) {
            return m.reply(`❌ Comprar un boleto de raspa cuesta *${formatNumber(TICKET_COST)}* monedas. No tienes suficiente saldo.`)
        }

        const b1 = pick(ICONS)
        const b2 = pick(ICONS)
        const b3 = pick(ICONS)

        let prize = 0

        if (b1 === b2 && b2 === b3) {
            prize = b1 === '👑' ? 3000 : 1500
        } else if (b1 === b2 || b2 === b3 || b1 === b3) {
            prize = 500
        }

        const netChange = prize - TICKET_COST
        updateUser(m.sender, { coins: wallet + netChange })

        const board = `
🎟️ *BOLETO DE RASPA Y GANA* 🎟️
───────────────
   [ ${b1} | ${b2} | ${b3} ]
───────────────`

        if (prize > 0) {
            return m.reply(
                `${board}\n\n` +
                `🎉 *¡BOLETO GANADOR!*\n` +
                `💰 Premio recibido: *${formatNumber(prize)}* monedas\n` +
                `📈 Balance final: *+${formatNumber(netChange)}* monedas 🪙`
            )
        } else {
            return m.reply(
                `${board}\n\n` +
                `❌ Boleto no ganador. Perdiste los *${formatNumber(TICKET_COST)}* monedas del costo del boleto.`
            )
        }
    }
}
