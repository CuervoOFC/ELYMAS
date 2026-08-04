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
ʚĭɞ ೃ funcion :: activar/desactivar nsfw + lista
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

        const option = args[0]?.toLowerCase()
        const groupData = getGroup(m.chat)
        const allGroups = getGroups()

        // Comando list para ver la lista de comandos NSFW
        if (option === 'list' || option === 'lista' || option === 'comandos') {
            const listText = 
                `╭─「 🔞 *COMANDOS NSFW DISPONIBLES* 」\n` +
                `│\n` +
                `│ 📋 *Lista de interacciones:*\n` +
                `│\n` +
                `│ 👋 \`!spank\` ➔ Azotar\n` +
                `│ 🔥 \`!sixnine\` ➔ 69\n` +
                `│ 🍑 \`!anal\` ➔ Anal\n` +
                `│ 💦 \`!fuck\` ➔ Coger\n` +
                `│ 👄 \`!blowjob\` ➔ Oral\n` +
                `│ 🍒 \`!suckboobs\` ➔ Chupar tetas\n` +
                `│ 💦 \`!cum\` ➔ Venirse\n` +
                `│ 🥧 \`!creampie\` ➔ Creampie\n` +
                `│ ⛓️ \`!bondage\` ➔ Bondage\n` +
                `│ 🎉 \`!orgy\` ➔ Orgía\n` +
                `│ 👭 \`!yuri\` ➔ Yuri/Lésbico\n` +
                `│ 👬 \`!yaoi\` ➔ Yaoi/Gay\n` +
                `│ 👄 \`!deepthroat\` ➔ Deepthroat\n` +
                `│ 😮 \`!facesitting\` ➔ Facesitting\n` +
                `│ 💦 \`!bukkake\` ➔ Bukkake\n` +
                `│ 💧 \`!squirting\` ➔ Squirt\n` +
                `│ 🍆 \`!pegging\` ➔ Pegging\n` +
                `│ 🍆 \`!futanari\` ➔ Futanari\n` +
                `│ y 13 comandos más...\n` +
                `│\n` +
                `│ 💡 *Ver lista completa:* \`!nsfwlist\`\n` +
                `│ 💡 *Uso:* \`!comando @usuario\`\n` +
                `╰──────────────`
            
            return m.reply(listText)
        }

        // Verificar admin para activar/desactivar
        if (!isAdmin && !isOwner) {
            return m.reply('❌ Este comando solo puede ser utilizado por los *Administradores* del grupo.')
        }

        if (option === 'on' || option === 'enable' || option === '1') {
            groupData.nsfw = true
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('✅ *Modo NSFW ACTIVADO* para este grupo.\n\n🔞 Ahora puedes usar todos los comandos NSFW.')
        } else if (option === 'off' || option === 'disable' || option === '0') {
            groupData.nsfw = false
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('❌ *Modo NSFW DESACTIVADO* para este grupo.\n\n🔒 Los comandos NSFW están bloqueados.')
        } else {
            return m.reply(
                '╭─「 🔞 *CONFIGURACIÓN NSFW* 」\n' +
                '│\n' +
                `│ 📌 Estado actual: *${groupData.nsfw ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*\n` +
                '│\n' +
                '│ 💡 *Opciones de administrador:*\n' +
                '│ • `.nsfw on` ➔ Activar modo NSFW\n' +
                '│ • `.nsfw off` ➔ Desactivar modo NSFW\n' +
                '│\n' +
                '│ 📋 *Ver comandos:*\n' +
                '│ • `.nsfw list` ➔ Lista de comandos NSFW\n' +
                '│ • `.nsfwlist` ➔ Lista completa\n' +
                '╰──────────────'
            )
        }
    }
}
