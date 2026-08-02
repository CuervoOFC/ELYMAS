/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/owner/reset.js
ʚĭɞ ೃ funcion :: reiniciar proceso del bot
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

function extractPureNumber(target) {
    if (!target) return ''
    return String(target)
        .split('@')[0]
        .split(':')[0]
        .replace(/[^0-9]/g, '')
}

export default {
    command: [
        'restart',
        'reiniciar',
        'reset'
    ],

    async run(m, { conn }) {
        const senderJid =
            m?.sender ||
            m?.key?.participant ||
            m?.key?.remoteJid ||
            ''

        const senderNum = extractPureNumber(senderJid)

        const isMainOwner =
            Array.isArray(config?.owners) &&
            config.owners.some(
                owner => extractPureNumber(owner) === senderNum
            )

        if (!isMainOwner) {
            return m.reply('🚫 Este comando solo puede ser usado por el *Owner Global*.')
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
