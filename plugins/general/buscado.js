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
ʚĭɞ 💤 funcion :: antilink con resolucion de LID a JID real
──────✧✦✧──────
*/

import { getGroup, getGroups, saveGroups } from '../../lib/database.js'

const linkRegex = /(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|wa\.me\/[0-9A-Za-z]|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i

// Función para resolver LID a JID/Número real
async function resolveRealJid(rawId, altPn, conn) {
    if (!rawId && !altPn) return null

    if (altPn) {
        const cleanPn = String(altPn).split('@')[0].replace(/[^0-9]/g, '')
        if (cleanPn) return `${cleanPn}@s.whatsapp.net`
    }

    const str = String(rawId || '').split(':')[0]

    // Si ya viene con el formato estándar @s.whatsapp.net y no es LID
    if (str.endsWith('@s.whatsapp.net') && !str.includes('@lid')) {
        return str
    }

    if (conn && typeof conn.findUserId === 'function') {
        try {
            const cleanQuery = str.split('@')[0].replace(/[^0-9]/g, '')
            if (cleanQuery && cleanQuery.length >= 8) {
                const res = await conn.findUserId(cleanQuery)
                if (res?.phoneNumber) {
                    const pn = res.phoneNumber.split('@')[0].replace(/[^0-9]/g, '')
                    return `${pn}@s.whatsapp.net`
                }
            }
        } catch (e) {}
    }

    const cleanNumber = str.split('@')[0].replace(/[^0-9]/g, '')
    return cleanNumber ? `${cleanNumber}@s.whatsapp.net` : null
}

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

        // Obtener remitente primario
        const senderRaw = m.sender || m.key.participant || m.participant
        const senderPn = m.key?.senderPn || m.key?.participantAlt

        // Resolver a JID Real (Elimina el problema del LID)
        const realJid = await resolveRealJid(senderRaw, senderPn, conn)
        if (!realJid) return

        const cleanNumber = realJid.split('@')[0]

        // 1. Eximir Administradores u Owner del Bot
        const isUserAdmin = participants.some(p => {
            const pNum = (p.id || p.jid || '').split(':')[0].split('@')[0]
            return pNum === cleanNumber && (p.admin === 'admin' || p.admin === 'superadmin')
        })

        if (isUserAdmin || isOwner) return

        // 2. Intentar borrar el mensaje (Se le pasa tanto el JID real como el LID por compatibilidad)
        await conn.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: m.key.fromMe || false,
                id: m.key.id,
                participant: m.key.participant || senderRaw
            }
        }).catch(() => conn.sendMessage(m.chat, { delete: m.key }))

        // 3. Advertencia en el grupo citando el JID real
        await conn.sendMessage(m.chat, {
            text: `🚫 *@${cleanNumber}*, los enlaces no están permitidos en este grupo.`,
            mentions: [realJid]
        })

        // 4. Expulsar al usuario con su JID real (@s.whatsapp.net)
        await conn.groupParticipantsUpdate(m.chat, [realJid], 'remove').catch(async () => {
            // Reintento de respaldo por si el servidor exige la ID cruda
            await conn.groupParticipantsUpdate(m.chat, [senderRaw], 'remove')
        })

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
