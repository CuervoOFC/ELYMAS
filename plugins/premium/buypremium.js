/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/rpg/buypremium.js
ʚĭɞ r funcion :: Permite comprar el rango Premium por 75,000 monedas
──────✧✦✧──────
*/

import { getUser, updateUser } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

const PREMIUM_PRICE = 75000

export default {
    command: ['buypremium', 'comprarpremium', 'vip'],

    async run(m, { conn }) {
        const userJid = m.sender
        const user = getUser(userJid)

        if (user.premium) {
            return await conn.sendMessage(m.chat, {
                text: `✨ *@${userJid.split('@')[0]}*, ya posees el estado **VIP / Premium**. ¡Gracias por tu apoyo!`,
                mentions: [userJid]
            }, { quoted: m })
        }

        const userCoins = user.coins || 0
        if (userCoins < PREMIUM_PRICE) {
            const missingCoins = PREMIUM_PRICE - userCoins
            return await conn.sendMessage(m.chat, {
                text: `❌ *Monedas insuficientes*\n\n` +
                      `💵 *Precio Premium:* ${formatNumber(PREMIUM_PRICE)} 🪙\n` +
                      `👛 *Billetera:* ${formatNumber(userCoins)} 🪙\n` +
                      `⚠️ *Te faltan:* ${formatNumber(missingCoins)} 🪙 para realizar la compra.`,
                mentions: [userJid]
            }, { quoted: m })
        }

        const newCoinsBalance = userCoins - PREMIUM_PRICE
        updateUser(userJid, {
            coins: newCoinsBalance,
            premium: true
        })

        const successMessage = 
            `🎉 *¡FELICITACIONES POR TU COMPRA!* 🎉\n\n` +
            `👤 *Usuario:* @${userJid.split('@')[0]}\n` +
            `💎 *Nuevo Estado:* VIP / Premium ✨\n` +
            `💰 *Costo:* -${formatNumber(PREMIUM_PRICE)} 🪙\n` +
            `👛 *Billetera restante:* ${formatNumber(newCoinsBalance)} 🪙\n\n` +
            `🌟 ¡Ahora disfrutas de los beneficios y estatus Premium en tu perfil!`

        return await conn.sendMessage(m.chat, {
            text: successMessage,
            mentions: [userJid]
        }, { quoted: m })
    }
}
