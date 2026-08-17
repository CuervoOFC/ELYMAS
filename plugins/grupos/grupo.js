/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/grupos/group.js
ʚĭɞ ೃ funcion :: Abrir o cerrar el grupo y etiquetar a todos los miembros
──────✧✦✧──────
*/

export default {
    command: ['grupo', 'group', 'g'],

    async run(m, { conn, args, isOwner }) {
        if (!m.isGroup) {
            return m.reply('❌ Este comando solo se puede usar en grupos.')
        }

        let isAdmin = false
        let participants = []

        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            participants = groupMetadata.participants || []
            
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

        const action = args[0]?.toLowerCase()
        const mentions = participants.map(p => p.id)

        if (action === 'close' || action === 'cerrar') {
            try {
                await conn.groupSettingUpdate(m.chat, 'announcement')

                const closeText = 
                    `🔒 *GRUPO CERRADO*\n\n` +
                    `📢 *Atención a todos los miembros:*\n` +
                    `El grupo ha sido cerrado. Ahora solo los *Administradores* pueden enviar mensajes.`

                return await conn.sendMessage(m.chat, {
                    text: closeText,
                    mentions: mentions,
                    mentionAll: true
                }, { quoted: m })

            } catch (error) {
                console.error('❌ Error en group.js (close):', error)
                return m.reply('❌ No se pudo cerrar el grupo. Verifica si **soy administrador**.')
            }
        } 
        
        if (action === 'open' || action === 'abrir') {
            try {
                await conn.groupSettingUpdate(m.chat, 'not_announcement')

                const openText = 
                    `🔓 *GRUPO ABIERTO*\n\n` +
                    `📢 *Atención a todos los miembros:*\n` +
                    `El grupo ha sido abierto. Ahora todos pueden enviar mensajes.`

                return await conn.sendMessage(m.chat, {
                    text: openText,
                    mentions: mentions,
                    mentionAll: true
                }, { quoted: m })

            } catch (error) {
                console.error('❌ Error en group.js (open):', error)
                return m.reply('❌ No se pudo abrir el grupo. Verifica si **soy administrador**.')
            }
        }

        return m.reply(
            `╭─「 ⚙️ *AJUSTE DE GRUPO* 」\n` +
            `│\n` +
            `│ Usemos opciones válidas:\n` +
            `│ 📌 *.grupo close* (Cerrar grupo y etiquetar)\n` +
            `│ 📌 *.grupo open* (Abrir grupo y etiquetar)\n` +
            `│\n` +
            `╰──────────────`
        )
    }
}
