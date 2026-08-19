/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ r codigo :: plugins/owner/broadcast.js
ʚĭɞ ೃ funcion :: Enviar mensaje masivo a grupos, chats privados o ambos
──────✧✦✧──────
*/

import config from '../../config.js'

function extractPureNumber(target) {
    if (!target) return ''
    return String(target)
        .split('@')[0]
        .split(':')[0]
        .replace(/[^0-9]/g, '')
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
    command: ['broadcast', 'bc', 'bcgc', 'bcpvt'],

    async run(m, { conn, args, usedPrefix, command }) {
        const senderJid = m?.sender || m?.key?.participant || m?.key?.remoteJid || ''
        const senderNum = extractPureNumber(senderJid)

        const isMainOwner =
            Array.isArray(config?.owners) &&
            config.owners.some(owner => extractPureNumber(owner) === senderNum)

        if (!isMainOwner) {
            return m.reply('🚫 Este comando solo puede ser usado por el *Owner Global*.')
        }

        const pesan = m.quoted?.text || args.join(' ')

        if (!pesan) {
            return m.reply(`⚠️ Te faltó el texto para enviar.\n\nEjemplo:\n*${usedPrefix + command} ¡Hola a todos!*`)
        }

        await m.reply('🚀 *Iniciando transmisión masiva...*')

        const chats = Object.keys(await conn.chats || {})
        let sendGroups = command === 'bcgc' || command === 'broadcast' || command === 'bc'
        let sendPrivate = command === 'bcpvt' || command === 'broadcast' || command === 'bc'

        let countGroups = 0
        let countPrivate = 0

        // Obtener grupos si corresponde
        if (sendGroups) {
            try {
                const getGroups = await conn.groupFetchAllParticipating()
                const groupIds = Object.keys(getGroups)

                for (const id of groupIds) {
                    await delay(700) // Evita ban o bloqueo por spam masivo
                    await conn.sendMessage(id, { text: `🌌 *DIFUSIÓN OFICIAL* 🌌\n\n${pesan}` }).catch(() => {})
                    countGroups++
                }
            } catch (err) {
                console.error('Error enviando a grupos:', err)
            }
        }

        // Obtener privados si corresponde
        if (sendPrivate) {
            const privateChats = chats.filter(id => id.endsWith('@s.whatsapp.net') && id !== conn.user.jid)

            for (const id of privateChats) {
                await delay(700)
                await conn.sendMessage(id, { text: `📩 *MENSAJE PRIVADO DE DIRECCIÓN* 📩\n\n${pesan}` }).catch(() => {})
                countPrivate++
            }
        }

        return m.reply(
            `✅ *TRANSMISIÓN FINALIZADA*\n\n` +
            `👥 *Grupos alcanzados:* ${countGroups}\n` +
            `👤 *Chats privados alcanzados:* ${countPrivate}`
        )
    }
}
