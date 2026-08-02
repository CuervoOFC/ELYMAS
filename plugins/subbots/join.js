/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/subbots/join.js
ʚĭɞ funcion :: Unir el bot/subbot a un grupo mediante enlace
──────✧✦✧──────
*/

import { validateSubbotOwner } from '../../lib/subbotconfig.js'

export default {
    command: ['join', 'unirse'],

    async run(m, { conn, args }) {
        const validation = validateSubbotOwner(m, conn)
        if (!validation.allowed) {
            return m.reply(validation.reason)
        }

        const text = args.join(' ')
        if (!text) {
            return m.reply(
                '╭─「 🔗 *UNIRSE A GRUPO* 」\n' +
                '│\n' +
                '│ ❌ Ingresa el enlace de invitación de WhatsApp.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:*\n' +
                '│ • `.join https://chat.whatsapp.com/L1M2N3O4P5Q6R7S8T9U0V`\n' +
                '╰──────────────'
            )
        }

        const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
        const match = text.match(linkRegex)

        if (!match || !match[1]) {
            return m.reply('❌ El enlace ingresado no parece ser un link válido de WhatsApp.')
        }

        const inviteCode = match[1]
        await m.reply('⏳ *Procesando solicitud de ingreso al grupo...*')

        try {
            const res = await conn.groupAcceptInvite(inviteCode)
            
            if (res) {
                return m.reply('✅ *¡Me he unido al grupo con éxito!*')
            } else {
                return m.reply('📩 *Solicitud enviada:* El grupo requiere aprobación de administradores para ingresar.')
            }
        } catch (error) {
            console.error('❌ Error en join.js:', error)
            return m.reply('❌ No me pude unir al grupo. Revisa si el link fue restablecido o si fui baneado del grupo.')
        }
    }
}
