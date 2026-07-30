/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: 
ʚĭɞ ೃ funcion :: 
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { saveSubbotConfig, validateSubbotOwner } from '../../lib/subbotconfig.js'

export default {
    command: [
        'setownernumber',
        'setownernumero',
        'setnumeroowner',
        'setnumerodueño'
    ],

    async run(m, { conn, text }) {

        const auth = validateSubbotOwner(m, conn)
        if (!auth.allowed) return m.reply(auth.reason)

        if (!text)
            return m.reply(
                '❌ Ingresa el número del dueño.\n\n' +
                'Ejemplo:\n' +
                '.setownernumber 521××××××××'
            )

        const ownerNumber = text.replace(/\D/g, '')

        if (ownerNumber.length < 8)
            return m.reply('❌ Ingresa un número válido.')

        const botJid =
            conn?.user?.jid ||
            conn?.user?.id ||
            conn?.subBotJid

        saveSubbotConfig(botJid, {
            ownerNumber
        })

        return m.reply(
            `✅ Número del dueño actualizado correctamente.\n\n` +
            `📱 Nuevo número:\n${ownerNumber}`
        )
    }
}
