/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/grupos/tag.js
ʚĭɞ ೃ funcion :: etiquetar a todos los miembros del grupo en fantasma (mencion invisible)
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

export default {
    command: ['tag', 'totag', 'tagallf', 'hidetag'],

    async run(m, { conn, text, isOwner }) {
        if (!m.isGroup) {
            return m.reply('❌ Este comando solo se puede usar en grupos.')
        }

        let isAdmin = false
        let groupMetadata
        let participants = []

        try {
            groupMetadata = await conn.groupMetadata(m.chat)
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

        try {
            const mentions = participants.map(p => p.id)

            if (m.quoted) {
                const messageText = text || m.quoted.text || ''
                
                return await conn.sendMessage(m.chat, {
                    text: messageText || '📢 *Mención general*',
                    mentions: mentions
                }, { quoted: m })
            }

            const messageToSend = text ? text : '📢 *Mención a todos los miembros*'

            return await conn.sendMessage(m.chat, {
                text: messageToSend,
                mentions: mentions
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en tag.js:', error)
            return m.reply('❌ Ocurrió un error al intentar etiquetar a los miembros.')
        }
    }
}
