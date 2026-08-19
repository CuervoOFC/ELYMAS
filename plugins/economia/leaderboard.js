/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/economia/leaderboard.js
ʚĭɞ ೃ funcion :: Muestra el Top 10 de usuarios mas ricos DEL GRUPO
──────✧✦✧──────
*/

import { getUsers } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
    command: ['top', 'lb', 'leaderboard', 'ricos'],

    async run(m, { conn }) {
        if (!m.isGroup) {
            return m.reply('❌ Este comando solo puede ser utilizado dentro de un grupo.')
        }

        // Obtener los participantes del grupo actual
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participants = groupMetadata.participants.map(p => p.id)

        const users = getUsers()

        // Filtrar solo los usuarios que forman parte de este grupo
        const sorted = Object.values(users)
            .filter(u => participants.includes(u.id))
            .map(u => ({
                id: u.id,
                total: (u.coins || 0) + (u.bank || 0)
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10)

        if (sorted.length === 0) {
            return m.reply('❌ Ningún miembro de este grupo tiene datos registrados aún.')
        }

        let text = `🏆 *TOP 10 MÁS RICOS DEL GRUPO* 🏆\n`
        text += `👥 *Grupo:* ${groupMetadata.subject}\n\n`

        sorted.forEach((u, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'
            text += `${medal} *#${index + 1}* @${u.id.split('@')[0]}\n`
            text += `   💰 Fortuna Neta: *${formatNumber(u.total)}* monedas\n`
        })

        return m.reply(text, null, { mentions: sorted.map(u => u.id) })
    }
}
