/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/stalking/tiktok.js
ʚĭɞ ೃ funcion :: stalkeo completo de TikTok
──────✧✦✧──────
*/

import axios from 'axios'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const STELLAR_KEY = 'api-COTah'
const DEFAULT_AVATAR = 'https://i.imgur.com/2w3A80k.jpeg'

export default {
    command: ['tiktokstalk', 'ttstalk'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const username = args[0]?.replace(/^@/, '').trim()

        if (!username) {
            return m.reply(
                '╭─「 🎵 *TIKTOK STALK* 」\n' +
                '│\n' +
                '│ ❌ Ingresa el usuario de TikTok a consultar.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:* `.ttstalk cuervoofc404`\n' +
                '╰──────────────'
            )
        }

        await m.reply('🔍 *Obteniendo datos de TikTok...*')

        try {
            const apiUrl = `https://api.stellarwa.xyz/stalking/tiktok?username=${encodeURIComponent(username)}&key=${STELLAR_KEY}`
            const res = await axios.get(apiUrl, { timeout: 15000 })

            if (!res.data?.status || !res.data?.result) {
                return m.reply('❌ No se encontró la cuenta de TikTok o la API no respondió.')
            }

            const data = res.data.result

            const captionText = 
                `╭━━━〔 🎵 *TIKTOK STALK* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 👤 *Usuario:* ${data.username}\n` +
                `┃ 🏷️ *Apodo:* ${data.nickname || 'Sin apodo'}\n` +
                `┃ 📝 *Firma/Bio:* ${data.signature || 'Sin biografía'}\n` +
                `┃ 🔒 *Privada:* ${data.private_account ? 'Sí 🔒' : 'No 🔓'}\n` +
                `┃ ✔️ *Verificado:* ${data.verified ? 'Sí ✅' : 'No ❌'}\n` +
                `┃ 🛍️ *Comercial:* ${data.commerce_user ? 'Sí 💼' : 'No'}\n` +
                `┃ 🌍 *Región:* ${data.account_region || 'Desconocido'}\n` +
                `┃ 🔗 *Perfil:* ${data.profile_url}\n` +
                `┃\n` +
                `┃ 📊 *ESTADÍSTICAS*\n` +
                `┃ • Seguidores: ${data.stats?.followers ?? 0}\n` +
                `┃ • Siguiendo: ${data.stats?.following ?? 0}\n` +
                `┃ • Me gusta: ${data.stats?.likes ?? 0}\n` +
                `┃ • Videos subidos: ${data.stats?.videos ?? 0}\n` +
                `┃\n` +
                `🤖 Bot: *${botName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`

            return await conn.sendMessage(m.chat, {
                image: { url: data.avatar || DEFAULT_AVATAR },
                caption: captionText
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en TikTok Stalk:', error)
            return m.reply('❌ Ocurrió un error al intentar consultar la cuenta de TikTok.')
        }
    }
}
