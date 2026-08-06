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
ʚĭɞ ೃ funcion :: antilink con soporte universal de event handler
──────✧✦✧──────
*/

import { getGroup, getGroups, saveGroups } from '../../lib/database.js'

const linkRegex = /(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|wa\.me\/[0-9A-Za-z]|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i

export default {
    command: ['antilink', 'anti-link'],

    async run(m, { conn, args, isOwner }) {
        if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')

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
            console.error('Error al obtener metadata:', e)
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

    async before(m, { conn }) {
        if (!m || !m.isGroup) return

        // Extraer texto garantizando compatibilidad entre distintas versiones de handler
        const text = m.text || 
                     m.body || 
                     m.caption ||
                     m.msg?.text || 
                     m.msg?.caption || 
                     m.message?.conversation || 
                     m.message?.extendedTextMessage?.text || ''

        if (!text) return

        const groupData = getGroup(m.chat)
        if (!groupData?.antilink) return

        if (linkRegex.test(text)) {
            const senderJid = m.sender || m.key.participant || m.key.remoteJid

            try {
                const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
                if (!groupMetadata) return

                const participants = groupMetadata.participants || []

                // Comprobar si quien mandó el enlace es admin
                const userParticipant = participants.find(p => p.id === senderJid || p.jid === senderJid)
                const isAdmin = userParticipant && (userParticipant.admin === 'admin' || userParticipant.admin === 'superadmin')

                // Si la persona que mandó el link es Admin, no se borra
                if (isAdmin) return

                // 1. Borrado de mensaje con key estructurado explícitamente
                const keyToDelete = {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: senderJid
                }

                await conn.sendMessage(m.chat, { delete: keyToDelete }).catch(async () => {
                    // Intento secundario de borrado usando el key directo
                    await conn.sendMessage(m.chat, { delete: m.key })
                })

                // 2. Notificación en el grupo
                await conn.sendMessage(m.chat, {
                    text: `⚠️ *@${senderJid.split('@')[0]}*, los enlaces no están permitidos en este grupo.`,
                    mentions: [senderJid]
                })

                // 3. Expulsar al usuario infractor
                await conn.groupParticipantsUpdate(m.chat, [senderJid], 'remove')

            } catch (err) {
                console.error('❌ [ANTILINK ERROR]:', err)
            }
        }
    }
}
