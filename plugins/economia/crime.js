/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/crime.js
ʚĭɞ ೃ funcion :: Cometer crimenes para ganar o perder monedas (con probabilidad)
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatTime, formatNumber, randomInt, pick, chance } from '../../lib/utils.js'

const CRIME_WINS = [
    'Hackeaste un cajero automático con un script de Python y conseguiste',
    'Robaste un auto deportivo de lujo y lo vendiste en el mercado negro por',
    'Asaltaste un banco local al estilo Payday y lograste escapar con',
    'Le robaste el reloj de oro a un empresario en el centro y obtuviste',
    'Hiciste un fraude cibernético a una empresa internacional y ganaste',
    'Asaltaste un camión blindado en la autopista y saqueaste'
]

const CRIME_FAILS = [
    'Intentaste robar un banco pero sonó la alarma SWAT y tuviste que pagar una fianza de',
    'Intentaste robar un carro pero tenía GPS activo y la policía te incautó',
    'Le quisiste robar el reloj a un luchador de MMA, te dio una paliza y pagaste médico por',
    'Hackeaste la cuenta equivocada y el FBI congeló tus cuentas quitándote',
    'Te atrapó el guardia de un centro comercial robando y pagaste una multa de'
]

export default {
    command: ['crime', 'crimen', 'robarbanco'],

    async run(m) {
        const user = getUser(m.sender)
        const cooldown = 20 * 60 * 1000 // 20 minutos
        const timePassed = Date.now() - (user.lastCrime || 0)

        if (timePassed < cooldown) {
            const timeLeft = cooldown - timePassed
            return m.reply(
                `🚨 *¡La policía te tiene acorralado y buscando!*\n\n` +
                `Mantente bajo perfil durante: *${formatTime(timeLeft)}*`
            )
        }

        const isSuccess = chance(45) // 45% de probabilidad de ganar (Riesgo alto)
        let wallet = user.coins || 0

        if (isSuccess) {
            const reward = randomInt(800, 2500)
            updateUser(m.sender, {
                coins: wallet + reward,
                lastCrime: Date.now()
            })

            return m.reply(
                `🕶️ *¡CRIMEN PERFECTO!*\n\n` +
                `📜 ${pick(CRIME_WINS)} *${formatNumber(reward)}* monedas.🪙`
            )
        } else {
            const penalty = Math.min(wallet, randomInt(500, 1500))
            updateUser(m.sender, {
                coins: wallet - penalty,
                lastCrime: Date.now()
            })

            return m.reply(
                `🚔 *¡TE ATRAPÓ LA POLICÍA!*\n\n` +
                `📜 ${pick(CRIME_FAILS)} *${formatNumber(penalty)}* monedas. ⚖️`
            )
        }
    }
}
