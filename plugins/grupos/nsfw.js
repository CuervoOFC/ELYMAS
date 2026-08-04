/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/grupos/nsfw.js
ʚĭɞ ೃ funcion :: activar o desactivar el modo nsfw en el grupo
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { getGroup, getGroups, saveGroups } from '../../lib/database.js'

export default {
    command: ['nsfw', 'modonsfw'],

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
            groupData.nsfw = true
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('✅ *Modo NSFW ACTIVADO* para este grupo.')
        } else if (option === 'off' || option === 'disable' || option === '0') {
            groupData.nsfw = false
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('❌ *Modo NSFW DESACTIVADO* para este grupo.')
        } else {
            return m.reply(
                '╭─「 🔞 *CONFIGURACIÓN NSFW* 」\n' +
                '│\n' +
                `│ 📌 Estado actual: *${groupData.nsfw ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*\n` +
                '│\n' +
                '│ 💡 *Uso:*\n' +
                '│ • `.nsfw on` ➔ Activar modo NSFW\n' +
                '│ • `.nsfw off` ➔ Desactivar modo NSFW\n' +
                '╰──────────────'
            )
        }
    }
}
