/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ r codigo :: plugins/economia/bal.js
ʚĭɞ ೃ funcion :: Ver el saldo actual en billetera y banco
──────✧✦✧──────
*/

import { getUser } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
    command: ['bal', 'balance', 'cartera', 'banco', 'coins'],

    async run(m) {
        const targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid?.[0] || m.sender)
        const user = getUser(targetJid)

        const total = (user.coins || 0) + (user.bank || 0)

        return m.reply(
            `💳 *ESTADO FINANCIERO* 💳\n\n` +
            `👤 *Usuario:* @${targetJid.split('@')[0]}\n` +
            `👛 *Billetera:* ${formatNumber(user.coins)} monedas\n` +
            `🏛️ *Banco:* ${formatNumber(user.bank)} monedas\n` +
            `📈 *Total Neto:* ${formatNumber(total)} monedas\n` +
            `⭐ *Nivel:* ${user.level || 1} (${formatNumber(user.exp || 0)} EXP)`
        )
    }
}
