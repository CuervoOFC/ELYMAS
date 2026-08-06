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
ʚĭɞ 💤 funcion :: antilink sin verificacion previa de bot admin
──────✧✦✧──────
*/

import { getGroup, getGroups, saveGroups } from '../../lib/database.js'

const linkRegex = /(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|wa\.me\/[0-9A-Za-z]|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i

async function processAntiLink(m, conn, isOwner) {
    if (!m || !m.isGroup) return

    const groupData = getGroup(m.chat)
    if (!groupData || !groupData.antilink) return

    const text = m.text || 
                 m.body || 
                 m.caption || 
                 m.msg?.text || 
                 m.msg?.caption || 
                 m.message?.conversation || 
                 m.message?.extendedTextMessage?.text || ''

    const isGroupCard = Boolean(m.message?.groupInviteMessage || m.msg?.groupInviteMessage)

    if (!linkRegex.test(text) && !isGroupCard) return

    try {
        const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
        if (!groupMetadata) return

        const participants = groupMetadata.participants || []
        const rawSender = m.sender || m.key.participant || ''
        const cleanSenderNumber = rawSender.split(':')[0].split('@')[0]
        const senderJid = `${cleanSenderNumber}@s.whatsapp.net`

        // Eximir a los Administradores u Owner del Bot
        const isUserAdmin = participants.some(p => {
            const pNum = (p.id || p.jid || '').split(':')[0].split('@')[0]
            return pNum === cleanSenderNumber && (p.admin === 'admin' || p.admin === 'superadmin')
        })

        if (isUserAdmin || isOwner) return

        // 1. Intentar borrar el mensaje directamente
        await conn.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: m.key.fromMe || false,
                id: m.key.id,
                participant: m.key.participant || senderJid
            }
        }).catch(() => conn.sendMessage(m.chat, { delete: m.key }))

        // 2. Advertencia en el grupo
        await conn.sendMessage(m.chat, {
            text: `🚫 *@${cleanSenderNumber}*, los enlaces no están permitidos en este grupo.`,
            mentions: [senderJid]
        })

        // 3. Expulsar al usuario
        await conn.groupParticipantsUpdate(m.chat, [senderJid], 'remove')

    } catch (err) {
        console.error('❌ Error en AntiLink:', err)
    }
}

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
            console.error('Error al obtener la metadata:', e)
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
        await processAntiLink(m, conn, isOwner)
    },

    async all(m, { conn, isOwner }) {
        await processAntiLink(m, conn, isOwner)
    }
}
