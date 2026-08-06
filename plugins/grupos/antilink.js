/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/grupos/antilink.js
ʚĭɞ ೃ funcion :: activar/desactivar antilink, eliminar mensajes y expulsar infractores
──────✧✦✧──────
*/

import { getGroup, getGroups, saveGroups } from '../../lib/database.js'

// Regex mejorada para capturar enlaces de invitación a grupos y canales de WhatsApp
const linkRegex = /(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|wa\.me\/[0-9A-Za-z]|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i

export default {
    command: ['antilink', 'anti-link'],

    async run(m, { conn, args, isOwner }) {
        if (!m.isGroup) {
            return m.reply('❌ Este comando solo se puede usar en grupos.')
        }

        let isAdmin = false
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const participants = groupMetadata.participants || []
            
            const senderJid = m.sender || m.key.participant
            const userParticipant = participants.find(p => p.id === senderJid || p.jid === senderJid)
            if (userParticipant && (userParticipant.admin === 'admin' || userParticipant.admin === 'superadmin')) {
                isAdmin = true
            }
        } catch (e) {
            console.error('Error al obtener la metadata del grupo:', e)
        }

        if (!isAdmin && !isOwner) {
            return m.reply('❌ Este comando solo puede ser utilizado por los *Administradores* del grupo.')
        }

        const option = args[0]?.toLowerCase()
        const groupData = getGroup(m.chat)
        const allGroups = getGroups()

        if (option === 'on' || option === 'enable' || option === '1') {
            groupData.antilink = true
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('✅ *Antilink ACTIVADO* para este grupo.')
        } else if (option === 'off' || option === 'disable' || option === '0') {
            groupData.antilink = false
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('❌ *Antilink DESACTIVADO* para este grupo.')
        } else {
            return m.reply(
                '╭─「 🛡️ *CONFIGURACIÓN DE ANTILINK* 」\n' +
                '│\n' +
                `│ 📌 Estado actual: *${groupData.antilink ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*\n` +
                '│\n' +
                '│ 💡 *Uso:*\n' +
                '│ • `.antilink on` ➔ Activar Antilink\n' +
                '│ • `.antilink off` ➔ Desactivar Antilink\n' +
                '╰──────────────'
            )
        }
    },

    async before(m, { conn, isOwner }) {
        if (!m.isGroup) return

        const text = m.text || m.msg?.caption || m.msg?.text || ''
        if (!text) return

        const groupData = getGroup(m.chat)
        if (!groupData?.antilink) return

        if (linkRegex.test(text)) {
            try {
                // Verificar si el emisor es Admin u Owner
                const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({}))
                const participants = groupMetadata.participants || []
                const senderJid = m.sender || m.key.participant
                const userParticipant = participants.find(p => p.id === senderJid || p.jid === senderJid)
                const isAdmin = userParticipant && (userParticipant.admin === 'admin' || userParticipant.admin === 'superadmin')

                // Si es Admin u Owner, no realizar acciones
                if (isAdmin || isOwner) return

                // 1. Eliminar el mensaje con el link usando el objeto key completo
                await conn.sendMessage(m.chat, { delete: m.key }).catch(err => {
                    console.error('Error al eliminar mensaje de antilink:', err)
                })

                // 2. Avisar en el chat
                await conn.sendMessage(m.chat, {
                    text: `⚠️ *@${senderJid.split('@')[0]}*, los enlaces de WhatsApp están prohibidos. Has sido eliminado.`,
                    mentions: [senderJid]
                })

                // 3. Expulsar al participante infractor
                await conn.groupParticipantsUpdate(m.chat, [senderJid], 'remove').catch(err => {
                    console.error('Error al expulsar infractor en antilink:', err)
                })

            } catch (e) {
                console.error('❌ Error en el handler antilink before:', e)
            }
        }
    }
}
