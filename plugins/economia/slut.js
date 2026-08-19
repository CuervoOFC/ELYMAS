/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/slut.js
ʚĭɞ ೃ funcion :: Hacer cosas humillantes para ganar o perder monedas (con probabilidad)
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatTime, formatNumber, randomInt, pick, chance } from '../../lib/utils.js'

const WIN_EVENTS = [
    'Te disfrazaste de maid y limpiaste un departamento privado, ganaste',
    'Aceptaste ser el perro humano de un millonario por una hora y te pagó',
    'Bailaste de forma ridícula en la plaza pública y te lanzaron',
    'Fuiste el pie de apoyo de un influencer durante un live y ganaste',
    'Vendiste fotos de tus pies en internet y ganaste',
    'Te dejaste maquillar como payaso en una fiesta infantil y te pagaron'
]

const FAIL_EVENTS = [
    'Intentaste vender fotos de tus pies pero te extorsionaron y perdiste',
    'Te disfrazaste de maid pero rompiste un jarrón caro, tuviste que pagar',
    'Bailaste en la calle pero la policía te multó por alteración al orden, perdiste',
    'Te humillaste en TikTok pero nadie te donó y se te cayó la billetera perdiendo',
    'Intentaste ser la mascota de alguien pero te robaron la cartera perdiendo'
]

export default {
    command: ['slut', 'humillar', 'sumiso'],

    async run(m) {
        const user = getUser(m.sender)
        const cooldown = 10 * 60 * 1000 // 10 minutos
        const timePassed = Date.now() - (user.lastSlut || 0)

        if (timePassed < cooldown) {
            const timeLeft = cooldown - timePassed
            return m.reply(
                `⌛ *¡Estás exhausto tras tanta humillación!*\n\n` +
                `Espera *${formatTime(timeLeft)}* antes de volver a intentarlo.`
            )
        }

        const isSuccess = chance(60) // 60% de probabilidad de ganar
        let wallet = user.coins || 0

        if (isSuccess) {
            const reward = randomInt(200, 800)
            updateUser(m.sender, {
                coins: wallet + reward,
                lastSlut: Date.now()
            })

            return m.reply(
                `😳 *¡ SLUT EXITOSO !*\n\n` +
                `📜 ${pick(WIN_EVENTS)} *${formatNumber(reward)}* monedas.🪙`
            )
        } else {
            const penalty = Math.min(wallet, randomInt(150, 500))
            updateUser(m.sender, {
                coins: wallet - penalty,
                lastSlut: Date.now()
            })

            return m.reply(
                `🤡 *¡HUMILLACIÓN FALLIDA!*\n\n` +
                `📜 ${pick(FAIL_EVENTS)} *${formatNumber(penalty)}* monedas. ❌`
            )
        }
    }
}
