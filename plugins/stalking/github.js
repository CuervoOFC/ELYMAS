/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/stalking/github.js
ʚĭɞ ೃ funcion :: stalkeo completo de GitHub con re-subida de avatar
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
        console.log('⚠️ No se pudo resubir avatar de GitHub, usando URL directa:', e.message)
    }
    return url
}

export default {
    command: ['githubstalk', 'ghstalk', 'github'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const username = args[0]?.trim()

        if (!username) {
            return m.reply(
                '╭─「 🐙 *GITHUB STALK* 」\n' +
                '│\n' +
                '│ ❌ Ingresa el usuario de GitHub a consultar.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:* `.ghstalk CuervoOFC`\n' +
                '╰──────────────'
            )
        }

        await m.reply('🔍 *Obteniendo datos de GitHub...*')

        try {
            const apiUrl = `https://api.evogb.org/stalking/github?username=${encodeURIComponent(username)}&key=${EVO_KEY}`
            const res = await axios.get(apiUrl, { timeout: 15000 })

            if (!res.data?.status || !res.data?.result) {
                return m.reply('❌ No se encontró el usuario de GitHub o la API no respondió.')
            }

            const data = res.data.result
            const avatar = await uploadAvatarUrl(data.avatar)

            const languagesText = data.top_languages?.length 
                ? data.top_languages.map(l => `  • ${l.language}: ${l.repos} repos`).join('\n')
                : '  • Sin datos'

            const reposText = data.top_repos?.length
                ? data.top_repos.map(r => 
                    `  📌 *${r.name}* (${r.language || 'N/A'})\n` +
                    `     ⭐ Stars: ${r.stars} | 🍴 Forks: ${r.forks}\n` +
                    `     📝 ${r.description || 'Sin descripción'}\n` +
                    `     🔗 ${r.url}`
                  ).join('\n\n')
                : '  • Sin repositorios destacados'

            const captionText = 
                `╭━━━〔 🐙 *GITHUB STALK* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 👤 *Usuario:* ${data.username}\n` +
                `┃ 📛 *Nombre:* ${data.name || 'No disponible'}\n` +
                `┃ 📝 *Biografía:* ${data.bio || 'Sin biografía'}\n` +
                `┃ 🏢 *Compañía:* ${data.company || 'No disponible'}\n` +
                `┃ 📍 *Ubicación:* ${data.location || 'No disponible'}\n` +
                `┃ 📧 *Correo:* ${data.email || 'No disponible'}\n` +
                `┃ 🌐 *Blog/Sitio:* ${data.blog || 'No disponible'}\n` +
                `┃ 🐦 *Twitter:* ${data.twitter || 'No disponible'}\n` +
                `┃ 🔗 *Perfil:* ${data.profile_url}\n` +
                `┃\n` +
                `┃ 📊 *ESTADÍSTICAS*\n` +
                `┃ • Seguidores: ${data.stats?.followers ?? 0}\n` +
                `┃ • Siguiendo: ${data.stats?.following ?? 0}\n` +
                `┃ • Repos Públicos: ${data.stats?.public_repos ?? 0}\n` +
                `┃ • Gists Públicos: ${data.stats?.public_gists ?? 0}\n` +
                `┃ • Estrellas Totales: ${data.stats?.total_stars ?? 0}\n` +
                `┃ • Forks Totales: ${data.stats?.total_forks ?? 0}\n` +
                `┃\n` +
                `┃ 📅 *DETALLES DE CUENTA*\n` +
                `┃ • Tipo: ${data.account?.type || 'User'}\n` +
                `┃ • Creada: ${data.account?.created_at ? new Date(data.account.created_at).toLocaleString() : 'N/A'}\n` +
                `┃ • Actualizada: ${data.account?.updated_at ? new Date(data.account.updated_at).toLocaleString() : 'N/A'}\n` +
                `┃\n` +
                `┃ 💻 *LENGUAJES PRINCIPALES*\n` +
                `${languagesText}\n` +
                `┃\n` +
                `┃ 🏆 *REPOSITORIOS DESTACADOS*\n` +
                `${reposText}\n` +
                `┃\n` +
                `🤖 Bot: *${botName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`

            return await conn.sendMessage(m.chat, {
                image: { url: avatar },
                caption: captionText
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en GitHub Stalk:', error)
            return m.reply('❌ Ocurrió un error al intentar consultar la cuenta de GitHub.')
        }
    }
}
