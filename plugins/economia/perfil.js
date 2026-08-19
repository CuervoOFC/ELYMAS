/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/rpg/profile.js
ʚĭɞ ೃ funcion :: Muestra la tarjeta de perfil RPG completa del usuario
──────✧✦✧──────
*/

import { getUser } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
    command: ['profile', 'perfil', 'user'],

    async run(m, { conn }) {
        const targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid?.[0] || m.sender)
        const user = getUser(targetJid)

        let pfp = 'https://i.imgur.com/6E2A69A.png'
        try {
            pfp = await conn.profilePictureUrl(targetJid, 'image')
        } catch {}

        const expNextLevel = (user.level || 1) * 500

        const profileText = 
            `👤 *TARJETA DE PERFIL* 👤\n\n` +
            `🔖 *Nombre:* @${targetJid.split('@')[0]}\n` +
            `⭐ *Nivel:* ${user.level || 1}\n` +
            `📊 *Experiencia:* ${formatNumber(user.exp || 0)} / ${formatNumber(expNextLevel)} EXP\n` +
            `👛 *Billetera:* ${formatNumber(user.coins || 0)} 🪙\n` +
            `🏛️ *Banco:* ${formatNumber(user.bank || 0)} 🪙\n` +
            `💎 *Estado:* ${user.premium ? 'VIP / Premium ✨' : 'Usuario Estándar 👤'}`

        return await conn.sendMessage(m.chat, { image: { url: pfp }, caption: profileText }, { quoted: m })
    }
}
