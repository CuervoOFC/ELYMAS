/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/subbots/setbotname.js
ʚĭɞ ೃ funcion :: cambiar nombre del bot
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import { saveSubbotConfig, validateSubbotOwner } from '../../lib/subbotconfig.js'

export default {
    command: ['setbotname', 'setnamebot', 'setname'],

    async run(m, { conn, text }) {
        const auth = validateSubbotOwner(m, conn)
        if (!auth.allowed) return m.reply(auth.reason)

        if (!text) return m.reply('❌ Ingresa el nuevo nombre para este Subbot.')

        const botJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid

        saveSubbotConfig(botJid, { name: text.trim() })

        return m.reply(`✅ El nombre de este Subbot ahora es: *${text.trim()}*`)
    }
}
