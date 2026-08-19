/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/rpg/levelup.js
ʚĭɞ ೃ funcion :: Verifica y sube de nivel al usuario si acumulo la experiencia requerida
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
    command: ['levelup', 'subirnivel', 'lvl'],

    async run(m) {
        const user = getUser(m.sender)
        const currentLevel = user.level || 1
        const currentExp = user.exp || 0

        const requiredExp = currentLevel * 500

        if (currentExp < requiredExp) {
            return m.reply(
                `📊 *ESTADO DE EXPERIENCIA*\n\n` +
                `⭐ Nivel Actual: *${currentLevel}*\n` +
                `⚡ EXP Actual: *${formatNumber(currentExp)} / ${formatNumber(requiredExp)}*\n\n` +
                `❌ Te faltan *${formatNumber(requiredExp - currentExp)}* de EXP para subir de nivel. ¡Sigue trabajando, minando o reclamando el daily!`
            )
        }

        const newLevel = currentLevel + 1
        const remainingExp = currentExp - requiredExp
        const bonusCoins = newLevel * 1000

        updateUser(m.sender, {
            level: newLevel,
            exp: remainingExp,
            coins: (user.coins || 0) + bonusCoins
        })

        return m.reply(
            `🎉 *¡FELICIDADES! ¡HAS SUBIDO DE NIVEL!* 🎉\n\n` +
            `🔝 *Nuevo Nivel:* ${newLevel}\n` +
            `🎁 *Recompensa:* +${formatNumber(bonusCoins)} monedas 🪙\n` +
            `⚡ *EXP Restante:* ${formatNumber(remainingExp)} EXP`
        )
    }
}
