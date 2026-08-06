/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/stalking/instagram.js
ʚĭɞ ೃ funcion :: stalkeo completo de Instagram con re-subida de avatar
──────✧✦✧──────
*/

import axios from 'axios'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'
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
        console.log('⚠️ No se pudo resubir avatar de Instagram, usando URL directa:', e.message)
    }
    return url
}

export default {
    command: ['igstalk', 'instagramstalk'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const username = args[0]?.replace(/^@/, '').trim()

        if (!username) {
            return m.reply(
                '╭─「 📸 *INSTAGRAM STALK* 」\n' +
                '│\n' +
                '│ ❌ Ingresa el usuario de Instagram a consultar.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:* `.igstalk cuervoofc404`\n' +
                '╰──────────────'
            )
        }

        await m.reply('🔍 *Obteniendo datos de Instagram...*')

        try {
            const apiUrl = `https://api.evogb.org/stalking/instagram?username=${encodeURIComponent(username)}&key=${EVO_KEY}`
            const res = await axios.get(apiUrl, { timeout: 15000 })

            if (!res.data?.status || !res.data?.result) {
                return m.reply('❌ No se encontró la cuenta de Instagram o la API no respondió.')
            }

            const data = res.data.result
            const avatar = await uploadAvatarUrl(data.profile_pic)

            const captionText = 
                `╭━━━〔 📸 *INSTAGRAM STALK* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 🆔 *ID:* ${data.id || 'N/A'}\n` +
                `┃ 👤 *Usuario:* ${data.username}\n` +
                `┃ 📛 *Nombre:* ${data.full_name || 'Sin nombre'}\n` +
                `┃ 📝 *Biografía:* ${data.biography || 'Sin biografía'}\n` +
                `┃ 🔒 *Privada:* ${data.is_private ? 'Sí 🔒' : 'No 🔓'}\n` +
                `┃ 🔗 *Perfil:* https://instagram.com/${data.username}\n` +
                `┃\n` +
                `┃ 📊 *ESTADÍSTICAS*\n` +
                `┃ • Publicaciones: ${data.statistics?.posts ?? 0}\n` +
                `┃ • Seguidores: ${data.statistics?.followers ?? 0}\n` +
                `┃ • Siguiendo: ${data.statistics?.following ?? 0}\n` +
                `┃\n` +
                `🤖 Bot: *${botName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`

            return await conn.sendMessage(m.chat, {
                image: { url: avatar },
                caption: captionText
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en Instagram Stalk:', error)
            return m.reply('❌ Ocurrió un error al intentar consultar la cuenta de Instagram.')
        }
    }
}
