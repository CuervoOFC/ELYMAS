/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/work.js
ʚĭɞ ೃ funcion :: Trabajar para ganar monedas con tiempo de espera
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatTime, formatNumber, randomInt, pick } from '../../lib/utils.js'

const JOBS = [
    'Trabajaste como desarrollador de software y ganaste',
    'Trabajaste repartiendo pizzas y ganaste',
    'Reparaste la computadora del vecino y ganaste',
    'Trabajaste de mesero en un restaurante lujoso y ganaste',
    'Creaste un bot de WhatsApp para un cliente y ganaste',
    'Vendiste limonada en la calle y ganaste',
    'Ganaste una competencia de videojuegos y obtuviste'
]

export default {
    command: ['work', 'trabajar', 'chambear'],

    async run(m) {
        const user = getUser(m.sender)
        const cooldown = 15 * 60 * 1000 // 15 Minutos
        const timePassed = Date.now() - (user.lastWork || 0)

        if (timePassed < cooldown) {
            const timeLeft = cooldown - timePassed
            return m.reply(
                `⌛ *¡Estás cansado! Necesitas descansar.*\n\n` +
                `Podrás trabajar de nuevo en: *${formatTime(timeLeft)}*`
            )
        }

        const earned = randomInt(100, 600)
        const jobMessage = pick(JOBS)

        updateUser(m.sender, {
            coins: (user.coins || 0) + earned,
            lastWork: Date.now()
        })

        return m.reply(
            `💼 *¡TRABAJO CONCLUIDO!*\n\n` +
            `📝 ${jobMessage} *${formatNumber(earned)}* monedas.🪙`
        )
    }
}
