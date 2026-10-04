/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot
━━━━━ ☾☽ ━━━━━
ʚĭɞ ⏰ CODIGO JAVASCRIPT ʚĭɞ ⏰
ʚĭɞ ⏰ codigo :: plugins/owner/leave.js
ʚĭɞ ⏰ funcion :: Salir del grupo actual o de otro grupo mediante Link / ID
──────✧✦✧──────
*/

import config from '../../config.js'

function extractPureNumber(target) {
    if (!target) return ''
    return String(target).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
}

export default {
    command: ['leave', 'salir', 'salte', 'leavegroup'],

    async run(m, { conn, args }) {
        // 1. Verificación de Owner Global
        const senderJid = m?.sender || m?.key?.participant || m?.key?.remoteJid || ''
        const senderNum = extractPureNumber(senderJid)

        const isMainOwner =
            Array.isArray(config?.owners) &&
            config.owners.some(owner => extractPureNumber(owner) === senderNum)

        if (!isMainOwner) {
            return m.reply('🚫 Este comando solo puede ser usado por el *Owner Global*.')
        }

        let targetGroup = m.chat

        // 2. Si pasa un enlace o ID como argumento, intenta salir de ese grupo remoto
        if (args[0]) {
            const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
            const match = args[0].match(linkRegex)

            if (match) {
                try {
                    const inviteCode = match[1]
                    const groupInfo = await conn.groupGetInviteInfo(inviteCode)
                    targetGroup = groupInfo.id
                } catch (e) {
                    return m.reply('❌ El enlace de invitación es inválido o el bot no tiene acceso.')
                }
            } else if (args[0].endsWith('@g.us')) {
                targetGroup = args[0]
            }
        }

        // 3. Validar que el objetivo sea un grupo
        if (!targetGroup.endsWith('@g.us')) {
            return m.reply('⚠️ Debes usar este comando dentro de un grupo o proporcionar un enlace válido.\n\nEjemplo: `.leave https://chat.whatsapp.com/...`')
        }

        // 4. Salida del grupo
        try {
            await conn.sendMessage(targetGroup, { 
                text: '👋 *¡Hasta luego!* Me retiro del grupo por orden de mi creador.' 
            })

            await new Promise(resolve => setTimeout(resolve, 1500))
            await conn.groupLeave(targetGroup)

            if (targetGroup !== m.chat) {
                await m.reply('✅ El bot ha salido con éxito del grupo especificado.')
            }

        } catch (error) {
            console.error('❌ Error al intentar salir del grupo:', error)
            return m.reply('❌ Ocurrió un error al intentar abandonar el grupo. Asegúrate de que el bot esté dentro de él.')
        }
    }
}
