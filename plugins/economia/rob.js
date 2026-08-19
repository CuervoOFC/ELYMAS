/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/rob.js
ʚĭɞ ೃ funcion :: Intentar robar la billetera de otro usuario con riesgo de multa
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatTime, formatNumber, randomInt, chance } from '../../lib/utils.js'

export default {
    command: ['rob', 'robar', 'asaltar'],

    async run(m) {
        const robber = getUser(m.sender)
        const cooldown = 30 * 60 * 1000 // 30 Minutos
        const timePassed = Date.now() - (robber.lastRob || 0)

        if (timePassed < cooldown) {
            const timeLeft = cooldown - timePassed
            return m.reply(`⌛ *¡Estás bajo la mira de las autoridades!*\n\nRegresa en: *${formatTime(timeLeft)}*`)
        }

        const targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid?.[0] || null)

        if (!targetJid) {
            return m.reply('⚠️ Responde al mensaje de alguien o etiquétalo para intentar asaltarlo.')
        }

        if (targetJid === m.sender) {
            return m.reply('🤡 ¿Te vas a robar a ti mismo?')
        }

        const victim = getUser(targetJid)
        const victimWallet = victim.coins || 0

        if (victimWallet < 200) {
            return m.reply('📉 Esta persona está demasiado pobre, no vale la pena asaltarla.')
        }

        const isSuccess = chance(40) // 40% probabilidad de éxito
        const robberWallet = robber.coins || 0

        if (isSuccess) {
            const stolen = randomInt(Math.floor(victimWallet * 0.1), Math.floor(victimWallet * 0.4))

            updateUser(m.sender, { coins: robberWallet + stolen, lastRob: Date.now() })
            updateUser(targetJid, { coins: victimWallet - stolen })

            return m.reply(
                `🥷 *¡ASALTO EXITOSO!*\n\n` +
                `Le has robado *${formatNumber(stolen)}* monedas a @${targetJid.split('@')[0]} 🪙`
            )
        } else {
            const fine = Math.min(robberWallet, randomInt(300, 1000))

            updateUser(m.sender, { coins: robberWallet - fine, lastRob: Date.now() })
            updateUser(targetJid, { coins: victimWallet + fine }) // La multa va de compensación a la víctima

            return m.reply(
                `🚔 *¡TE ATRAPARON CON LAS MANOS EN LA MASA!*\n\n` +
                `Intentaste robar a @${targetJid.split('@')[0]} pero fuiste sometido.\n` +
                `⚖️ Pagaste una indemnización de *${formatNumber(fine)}* monedas.`
            )
        }
    }
}
