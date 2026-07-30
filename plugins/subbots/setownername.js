/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/subbots/setownername.js
ʚĭɞ ೃ funcion :: cambia el nombre del owner del bot
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import { saveSubbotConfig, validateSubbotOwner } from '../../lib/subbotconfig.js'

export default {
    command: ['setowner', 'setbotowner', 'cambiardueño'],

    async run(m, { conn, text }) {

        const auth = validateSubbotOwner(m, conn)
        if (!auth.allowed) return m.reply(auth.reason)

        const newOwnerName = text ? text.trim() : (m.pushName || 'Dueño')

        const botJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid

        saveSubbotConfig(botJid, { ownerName: newOwnerName })

        return m.reply(`✅ El nombre del dueño de este Subbot ahora es: *${newOwnerName}*`)
    }
}
