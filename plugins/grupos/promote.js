/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/grupos/promote.js
ʚĭɞ ೃ funcion :: promueve a administrador a un usuario resolviendo su JID/LID/PN
──────✧✦✧──────
*/

async function resolveParticipant(rawId, altPn, conn) {
    if (!rawId && !altPn) return { mentionId: '', tagText: '', phoneNumber: '' }

    if (altPn) {
        const cleanPn = String(altPn).split('@')[0].replace(/[^0-9]/g, '')
        if (cleanPn) {
            return {
                mentionId: `${cleanPn}@s.whatsapp.net`,
                tagText: cleanPn,
                phoneNumber: `+${cleanPn}`
            }
        }
    }

    const str = String(rawId || '').split(':')[0]

    if (conn && typeof conn.findUserId === 'function') {
        try {
            const cleanQuery = str.split('@')[0].replace(/[^0-9]/g, '')
            if (cleanQuery && cleanQuery.length >= 8) {
                const res = await conn.findUserId(cleanQuery)
                if (res?.phoneNumber) {
                    const pn = res.phoneNumber.split('@')[0].replace(/[^0-9]/g, '')
                    return {
                        mentionId: res.phoneNumber,
                        tagText: pn,
                        phoneNumber: `+${pn}`
                    }
                }
            }
        } catch (e) {
        }
    }
    const cleanNumber = str.split('@')[0].replace(/[^0-9]/g, '') || 'Desconocido'
    return {
        mentionId: str.includes('@') ? str : `${cleanNumber}@s.whatsapp.net`,
        tagText: cleanNumber,
        phoneNumber: cleanNumber !== 'Desconocido' ? `+${cleanNumber}` : 'No disponible'
    }
}

export default {
    command: ['promote', 'daradmin', 'promover'],

    async run(m, { conn, args }) {
        if (!m.isGroup) {
            return m.reply('⚠️ Este comando solo se puede usar en grupos.')
        }

        // Verificación de que el usuario que ejecuta el comando sea Admin
        const groupMetadata = await conn.groupMetadata(m.chat)
        const senderAdmin = groupMetadata.participants.find(p => p.id.includes(m.sender.split('@')[0]))?.admin

        if (!senderAdmin) {
            return m.reply('🚫 Solo los *Administradores* del grupo pueden usar este comando.')
        }

        let targetRaw = null
        let targetPn = null

        const contextInfo = m.message?.extendedTextMessage?.contextInfo || m.msg?.contextInfo
        const mentionedJids = m.mentionedJid || contextInfo?.mentionedJid || []

        if (mentionedJids.length > 0) {
            targetRaw = mentionedJids[0]
            targetPn = contextInfo?.mentionedPn || contextInfo?.participantAlt
        } else if (m.quoted) {
            targetRaw = m.quoted.sender || m.quoted.participant || m.quoted.key?.participant
            targetPn = m.quoted.senderPn || m.quoted.key?.participantAlt
        } else if (args[0]) {
            targetRaw = args[0]
        }

        const target = await resolveParticipant(targetRaw, targetPn, conn)

        if (!target.mentionId) {
            return m.reply('⚠️ Debes mencionar a `@usuario`, responder a su mensaje o escribir su número.')
        }

        try {
            await conn.groupParticipantsUpdate(m.chat, [target.mentionId], 'promote')

            const responseText = 
                `╭─「 👑 *NUEVO ADMINISTRADOR* 」\n` +
                `│\n` +
                `│ 👤 *Usuario:* @${target.tagText}\n` +
                `│ 📞 *Número:* ${target.phoneNumber}\n` +
                `│ 📌 *Estado:* Promovido a Administrador con éxito.\n` +
                `│\n` +
                `╰──────────────`

            await conn.sendMessage(m.chat, {
                text: responseText,
                mentions: [target.mentionId]
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en promote.js:', error)
            return m.reply('❌ No se pudo promover al usuario.')
        }
    }
}
