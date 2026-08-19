/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/minar.js
ʚĭɞ ೃ funcion :: Minar minerales para ganar monedas y experiencia
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatTime, formatNumber, randomInt } from '../../lib/utils.js'

export default {
    command: ['minar', 'mine', 'mineria'],

    async run(m) {
        const user = getUser(m.sender)
        const cooldown = 10 * 60 * 1000 // 10 minutos
        const timePassed = Date.now() - (user.lastMine || 0)

        if (timePassed < cooldown) {
            const timeLeft = cooldown - timePassed
            return m.reply(`⛏️ *Tus brazos están cansados por picar piedra.*\n\nPodrás volver a minar en: *${formatTime(timeLeft)}*`)
        }

        const coinsEarned = randomInt(250, 750)
        const expEarned = randomInt(50, 150)

        updateUser(m.sender, {
            coins: (user.coins || 0) + coinsEarned,
            exp: (user.exp || 0) + expEarned,
            lastMine: Date.now()
        })

        return m.reply(
            `⛏️ *¡JORNADA DE MINERÍA FINALIZADA!*\n\n` +
            `💎 Encontraste minerales valiosos y los vendiste por:\n` +
            `🪙 Monedas: *+${formatNumber(coinsEarned)}*\n` +
            `⭐ Experiencia: *+${formatNumber(expEarned)}*`
        )
    }
}
