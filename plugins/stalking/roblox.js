/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/stalking/roblox.js
ʚĭɞ r funcion :: stalkeo completo de Roblox con re-subida de avatar
──────✧✦✧──────
*/

import axios from 'axios'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'CuervoOFC'
const DEFAULT_AVATAR = 'https://i.imgur.com/2w3A80k.jpeg'

async function uploadAvatarUrl(url) {
    if (!url) return DEFAULT_AVATAR
    try {
        const uploadEndpoint = `https://api.evogb.org/tools/upload?server=evogb&method=url&url=${encodeURIComponent(url)}&author=EvogbApi&key=${EVO_KEY}`
        const res = await axios.get(uploadEndpoint, { timeout: 10000 })
        if (res.data?.status && res.data?.url) {
            return res.data.url
        }
    } catch (e) {
        console.log('⚠️ No se pudo resubir avatar de Roblox, usando URL directa:', e.message)
    }
    return url
}

export default {
    command: ['robloxstalk', 'rbxstalk', 'roblox'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const username = args[0]?.trim()

        if (!username) {
            return m.reply(
                '╭─「 🎮 *ROBLOX STALK* 」\n' +
                '│\n' +
                '│ ❌ Ingresa el usuario de Roblox a consultar.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:* `.rbxstalk <nombre usuario>`\n' +
                '╰──────────────'
            )
        }

        await m.reply('🔍 *Obteniendo datos de Roblox...*')

        try {
            const apiUrl = `https://api.evogb.org/stalking/roblox?username=${encodeURIComponent(username)}&key=${EVO_KEY}`
            const res = await axios.get(apiUrl, { timeout: 15000 })

            if (!res.data?.status || !res.data?.data) {
                return m.reply('❌ No se encontró el usuario de Roblox o la API no respondió.')
            }

            const { account, presence, stats, badges } = res.data.data
            const avatar = await uploadAvatarUrl(account?.profilePicture)

            const badgesText = badges && badges.length > 0 
                ? badges.map(b => `  • ${b.name || 'Insignia'}`).join('\n')
                : '  • Sin insignias'

            const captionText = 
                `╭━━━〔 🎮 *ROBLOX STALK* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 🆔 *ID:* ${account?.id || 'N/A'}\n` +
                `┃ 👤 *Usuario:* ${account?.username || username}\n` +
                `┃ 🏷️ *Display Name:* ${account?.displayName || 'Sin apodo'}\n` +
                `┃ 📝 *Descripción:* ${account?.description || 'Sin descripción'}\n` +
                `┃ 🚫 *Baneado:* ${account?.isBanned ? 'Sí ❌' : 'No ✅'}\n` +
                `┃ ✔️ *Verificado:* ${account?.hasVerifiedBadge ? 'Sí ✅' : 'No ❌'}\n` +
                `┃ 📅 *Creación:* ${account?.created ? new Date(account.created).toLocaleString() : 'N/A'}\n` +
                `┃\n` +
                `┃ 🟢 *PRESENCIA*\n` +
                `┃ • En Línea: ${presence?.isOnline ? 'Sí 🟢' : 'No 🔴'}\n` +
                `┃ • Última Vez: ${presence?.lastOnline || 'No disponible'}\n` +
                `┃ • Ubicación: ${presence?.location || 'Desconocido'}\n` +
                `┃\n` +
                `┃ 📊 *ESTADÍSTICAS*\n` +
                `┃ • Amigos: ${stats?.friends ?? 0}\n` +
                `┃ • Seguidores: ${stats?.followers ?? 0}\n` +
                `┃ • Siguiendo: ${stats?.following ?? 0}\n` +
                `┃\n` +
                `┃ 🏅 *INSIGNIAS*\n` +
                `${badgesText}\n` +
                `┃\n` +
                `🤖 Bot: *${botName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`

            return await conn.sendMessage(m.chat, {
                image: { url: avatar },
                caption: captionText
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en Roblox Stalk:', error)
            return m.reply('❌ Ocurrió un error al intentar consultar la cuenta de Roblox.')
        }
    }
}
