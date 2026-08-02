/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/grupos/welcome.js
ʚĭɞ ೃ funcion :: activar o desactivar bienvenida/despedida en el grupo
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { getGroup, getGroups, saveGroups } from '../../lib/database.js'

export default {
    command: ['welcome', 'bienvenida'],

    async run(m, { conn, args, isOwner }) {
        if (!m.isGroup) {
            return m.reply('❌ Este comando solo se puede usar en grupos.')
        }

        // --- VERIFICACIÓN DE ADMINS EN TIEMPO REAL ---
        let isAdmin = false
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const participants = groupMetadata.participants || []
            
            // Obtener el ID limpio del usuario que envió el mensaje
            const senderJid = m.sender || m.key.participant

            // Buscar al participante y verificar si es superadmin o admin
            const userParticipant = participants.find(p => p.id === senderJid || p.jid === senderJid)
            if (userParticipant && (userParticipant.admin === 'admin' || userParticipant.admin === 'superadmin')) {
                isAdmin = true
            }
        } catch (e) {
            console.error('Error al obtener la metadata del grupo:', e)
        }

        // Permitir si es Admin del grupo o Creador/Owner del Bot
        if (!isAdmin && !isOwner) {
            return m.reply('❌ Este comando solo puede ser utilizado por los *Administradores* del grupo.')
        }

        const option = args[0]?.toLowerCase()
        const groupData = getGroup(m.chat)
        const allGroups = getGroups()

        if (option === 'on' || option === 'enable' || option === '1') {
            groupData.welcome = true
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('✅ *Bienvenida y Despedida ACTIVADAS* para este grupo.')
        } else if (option === 'off' || option === 'disable' || option === '0') {
            groupData.welcome = false
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('❌ *Bienvenida y Despedida DESACTIVADAS* para este grupo.')
        } else {
            return m.reply(
                '╭─「 ⚙️ *CONFIGURACIÓN DE BIENVENIDA* 」\n' +
                '│\n' +
                `│ 📌 Estado actual: *${groupData.welcome ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*\n` +
                '│\n' +
                '│ 💡 *Uso:*\n' +
                '│ • `.welcome on` ➔ Activar bienvenida\n' +
                '│ • `.welcome off` ➔ Desactivar bienvenida\n' +
                '╰──────────────'
            )
        }
    }
}
