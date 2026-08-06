/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ 💤 CODIGO JAVASCRIPT ʚĭɞ 💤
ʚĭɞ 💤 codigo :: plugins/grupos/antilink.js
ʚĭɞ 💤 funcion :: antilink con soporte para Tarjetas de Invitación y enlaces directos
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
            const senderJid = (m.sender || m.key.participant || '').split(':')[0].split('@')[0]
            
            isAdmin = participants.some(p => {
                const pJid = (p.id || p.jid || '').split(':')[0].split('@')[0]
                return pJid === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
            })
        } catch (e) {
            console.error('Error al obtener la metadata del grupo:', e)
        }

        if (!isAdmin && !isOwner) {
            return m.reply('❌ Este comando solo puede ser utilizado por los *Administradores* del grupo.')
        }

        const option = args[0]?.toLowerCase()
        const groupData = getGroup(m.chat) || {}
        const allGroups = getGroups() || {}

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
        if (!m || !m.isGroup) return

        const groupData = getGroup(m.chat)
        if (!groupData || !groupData.antilink) return

        // 1. Detección de Tarjetas de Invitación a Grupos (Group Invite Messages)
        const isGroupInviteCard = Boolean(
            m.message?.groupInviteMessage || 
            m.msg?.groupInviteMessage ||
            m.mtype === 'groupInviteMessage'
        )

        // 2. Extracción de texto normal para URLs escritas
        const text = m.text || 
                     m.body || 
                     m.caption || 
                     m.msg?.text || 
                     m.msg?.caption || 
                     m.message?.conversation || 
                     m.message?.extendedTextMessage?.text || ''

        const containsLink = linkRegex.test(text)

        // Si no es tarjeta de invitación ni contiene un enlace en texto, ignorar
        if (!isGroupInviteCard && !containsLink) return

        try {
            const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
            if (!groupMetadata) return

            const participants = groupMetadata.participants || []

            // Obtener remitente sin subdispositivos (:1, :2)
            const rawSender = m.sender || m.key.participant || ''
            const cleanSenderNumber = rawSender.split(':')[0].split('@')[0]
            const senderJid = `${cleanSenderNumber}@s.whatsapp.net`

            // Verificar si el remitente es Admin u Owner
            const isUserAdmin = participants.some(p => {
                const pNum = (p.id || p.jid || '').split(':')[0].split('@')[0]
                return pNum === cleanSenderNumber && (p.admin === 'admin' || p.admin === 'superadmin')
            })

            if (isUserAdmin || isOwner) return

            // Verificar si el BOT es Admin
            const botRawJid = conn.user?.jid || conn.user?.id || ''
            const botCleanNumber = botRawJid.split(':')[0].split('@')[0]
            const isBotAdmin = participants.some(p => {
                const pNum = (p.id || p.jid || '').split(':')[0].split('@')[0]
                return pNum === botCleanNumber && (p.admin === 'admin' || p.admin === 'superadmin')
            })

            if (!isBotAdmin) {
                await conn.sendMessage(m.chat, {
                    text: '⚠️ Se detectó una invitación/enlace, pero no puedo borrarla porque **NO soy Administrador**.'
                })
                return
            }

            // Eliminar el mensaje (admite mensajes propios de subbots o de terceros)
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: m.key.fromMe || false,
                    id: m.key.id,
                    participant: m.key.participant || senderJid
                }
            }).catch(async () => {
                await conn.sendMessage(m.chat, { delete: m.key })
            })

            // Notificación
            await conn.sendMessage(m.chat, {
                text: `⚠️ *@${cleanSenderNumber}*, los enlaces e invitaciones a grupos no están permitidos.`,
                mentions: [senderJid]
            })

            // Expulsión del grupo
            await conn.groupParticipantsUpdate(m.chat, [senderJid], 'remove')

        } catch (err) {
            console.error('❌ Error en el ejecutor AntiLink:', err)
        }
    }
}
