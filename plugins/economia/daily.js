/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/daily.js
ʚĭɞ ೃ funcion :: Reclamar la recompensa diaria de monedas y experiencia
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatTime, formatNumber, randomInt } from '../../lib/utils.js'

export default {
    command: ['daily', 'diario', 'recompensa'],

    async run(m) {
        const user = getUser(m.sender)
        const cooldown = 24 * 60 * 60 * 1000 // 24 Horas
        const timePassed = Date.now() - (user.lastDaily || 0)

        if (timePassed < cooldown) {
            const timeLeft = cooldown - timePassed
            return m.reply(
                `⌛ *¡Ya reclamaste tu recompensa diaria!*\n\n` +
                `Regresa en: *${formatTime(timeLeft)}*`
            )
        }

        const coinsReward = randomInt(500, 1500)
        const expReward = randomInt(100, 300)

        updateUser(m.sender, {
            coins: (user.coins || 0) + coinsReward,
            exp: (user.exp || 0) + expReward,
            lastDaily: Date.now()
        })

        return m.reply(
            `🎁 *¡RECOMPENSA DIARIA RECLAMADA!*\n\n` +
            `🪙 Monedas: *+${formatNumber(coinsReward)}*\n` +
            `⭐ Experiencia: *+${formatNumber(expReward)}*`
        )
    }
}
