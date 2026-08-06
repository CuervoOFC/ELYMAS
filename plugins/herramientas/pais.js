/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/herramientas/pais.js
ʚĭɞ ೃ funcion :: informacion detallada de paises via EvoGB Country API
──────✧✦✧──────
*/

import axios from 'axios'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'

export default {
    command: ['pais', 'country', 'paises', 'countryinfo'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const countryName = args.join(' ').trim()

        if (!countryName) {
            return m.reply(
                '╭─「 🌍 *COUNTRY INFO* 」\n' +
                '│\n' +
                '│ ❌ Ingresa el nombre de un país a consultar.\n' +
                '│\n' +
                '│ 📌 *Ejemplos:*\n' +
                '│ • `.pais Mexico`\n' +
                '│ • `.pais Argentina`\n' +
                '│ • `.pais Japan`\n' +
                '╰──────────────'
            )
        }

        await m.reply('🔍 *Buscando información del país...*')

        try {
            const apiUrl = `https://api.evogb.org/tools/country?name=${encodeURIComponent(countryName)}&mode=completa&key=${EVO_KEY}`
            const res = await axios.get(apiUrl, { timeout: 15000 })

            if (!res.data?.status || !res.data?.data) {
                return m.reply('❌ No se encontró información para el país especificado.')
            }

            const d = res.data.data
            const commonName = d.names?.native?.spa?.common || d.names?.common || countryName
            const officialName = d.names?.native?.spa?.official || d.names?.official || 'N/A'
            const capital = d.capitals?.[0]?.name || 'No disponible'
            const emojiFlag = d.flag?.emoji || '🌍'
            const currencies = d.currencies?.length
                ? d.currencies.map(c => `${c.name} (${c.symbol || ''}) [${c.code}]`).join(', ')
                : 'N/A'
            const languages = d.languages?.length
                ? d.languages.map(l => l.native_name || l.name).join(', ')
                : 'N/A'
            const borders = d.borders?.length ? d.borders.join(', ') : 'Sin fronteras terrestres'
            const areaKm = d.area?.kilometers ? d.area.kilometers.toLocaleString() + ' km²' : 'N/A'
            const population = d.population ? d.population.toLocaleString() : 'N/A'
            const mapLink = d.links?.google_maps || d.links?.open_street_maps || 'N/A'
            const wikiLink = d.links?.wikipedia || 'N/A'
            const flagImg = d.flag?.url_png || ''

            const captionText = 
                `╭━━━〔 ${emojiFlag} *${commonName.toUpperCase()}* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 📛 *Nombre Oficial:* ${officialName}\n` +
                `┃ 🏛️ *Capital:* ${capital}\n` +
                `┃ 🗺️ *Región:* ${d.region || 'N/A'} (${d.subregion || 'N/A'})\n` +
                `┃ 🗣️ *Idiomas:* ${languages}\n` +
                `┃ 💵 *Moneda:* ${currencies}\n` +
                `┃ 📞 *Prefijo:* +${d.calling_codes?.[0] || 'N/A'}\n` +
                `┃ 🌐 *Dominio (.tld):* ${d.tlds?.join(', ') || 'N/A'}\n` +
                `┃\n` +
                `┃ 📊 *DEMOGRAFÍA Y TERRITORIO*\n` +
                `┃ • Población: ${population} hab.\n` +
                `┃ • Superficie: ${areaKm}\n` +
                `┃ • Fronteras: ${borders}\n` +
                `┃ • Conducción: Lado ${d.cars?.driving_side === 'right' ? 'derecho 🚗' : 'izquierdo 🚗'}\n` +
                `┃ • Miembro ONU: ${d.classification?.un_member ? 'Sí ✅' : 'No ❌'}\n` +
                `┃ • G20 / OECD: ${d.memberships?.g20 ? 'G20 ✅' : 'G20 ❌'} | ${d.memberships?.oecd ? 'OECD ✅' : 'OECD ❌'}\n` +
                `┃\n` +
                `┃ 📍 *CÓDIGOS ISO*\n` +
                `┃ • Alfa-2: \`${d.codes?.alpha_2 || 'N/A'}\` | Alfa-3: \`${d.codes?.alpha_3 || 'N/A'}\`\n` +
                `┃\n` +
                `┃ 🔗 *ENLACES*\n` +
                `┃ • Google Maps: ${mapLink}\n` +
                `┃ • Wikipedia: ${wikiLink}\n` +
                `┃\n` +
                `🤖 Bot: *${botName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`

            if (flagImg) {
                return await conn.sendMessage(m.chat, {
                    image: { url: flagImg },
                    caption: captionText
                }, { quoted: m })
            } else {
                return m.reply(captionText)
            }

        } catch (error) {
            console.error('❌ Error en Country Info:', error)
            return m.reply('❌ Ocurrió un error al intentar consultar los datos del país.')
        }
    }
}
