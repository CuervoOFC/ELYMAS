/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/owner/reset.js
ʚĭɞ funcion :: Reiniciar el proceso del bot
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

export default {
    command: ['restart', 'reiniciar', 'reset'],

    async run(m, { conn, isOwner }) {
        if (!isOwner) {
            return m.reply('❌ Este comando solo puede ser ejecutado por el *Owner* del bot.')
        }

        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        await m.reply(`🔄 *Reiniciando ${botName}... Por favor espera unos segundos.*`)

        setTimeout(() => {
            if (process.send) {
                process.send('restart')
            } else {
                process.exit(0)
            }
        }, 3000)
    }
}
