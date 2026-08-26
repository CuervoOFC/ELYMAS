/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/busquedas/stickerly.js
ʚĭɞ funcion :: Búsqueda y descarga de paquetes de Sticker.ly con API de respaldo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVOGB_KEY = 'CuervoOFC'
const STELLAR_KEY = 'CuervoOFC'

const API_EVOGB = 'https://api.evogb.org/stickerly'
const API_STELLAR = 'https://api.stellarwa.xyz/stickerly'

function esUrlValida(texto) {
    try {
        const url = new URL(texto)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

async function pedirDatos(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP Error status: ${res.status}`)
    return await res.json()
}

export default {
    command: ['stickerly', 'stikerly', 'stpack'],

    async run(m, { conn, text, usedPrefix, command }) {
        if (!text) {
            return m.reply(
                `📦 *Ingresa un término de búsqueda o un enlace de Sticker.ly.*\n\n` +
                `📌 *Ejemplos:*\n` +
                `• \`${usedPrefix + command} Cuervo\` (Buscar paquetes)\n` +
                `• \`${usedPrefix + command} https://sticker.ly/s/M40ZVI\` (Descargar pack)`
            )
        }

        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const defaultPackname = botData.name || config.botName || 'Cuervo'
        const defaultAuthor = botData.ownerName || config.ownerName || 'TheDevil'

        const textoLimpio = text.trim()
        const esUrl = esUrlValida(textoLimpio)
        const tipoConsulta = esUrl ? 'detail' : 'search'

        await m.reply(esUrl ? '📥 *Obteniendo paquete de stickers...*' : '🔍 *Buscando paquetes en Sticker.ly...*')

        let data = null
        let proveedor = ''

        try {
            const urlEvogb = `${API_EVOGB}/${tipoConsulta}?${esUrl ? 'url' : 'query'}=${encodeURIComponent(textoLimpio)}&key=${EVOGB_KEY}`
            const json = await pedirDatos(urlEvogb)

            if (json && (json.status !== false || json.code === 200)) {
                data = json.detalles || json.result || json.resultados || json
                proveedor = 'Evogb'
            } else {
                throw new Error('Sin resultados en Evogb')
            }
        } catch (eEvogb) {
            console.warn('⚠️ Falló API Evogb, activando respaldo Stellar...', eEvogb.message)

            try {
                const urlStellar = `${API_STELLAR}/${tipoConsulta}?${esUrl ? 'url' : 'query'}=${encodeURIComponent(textoLimpio)}&key=${STELLAR_KEY}`
                const jsonStellar = await pedirDatos(urlStellar)

                if (jsonStellar && (jsonStellar.status !== false || jsonStellar.code === 200)) {
                    data = jsonStellar.detalles || jsonStellar.result || jsonStellar.resultados || jsonStellar
                    proveedor = 'Stellar'
                } else {
                    throw new Error('Sin resultados en Stellar')
                }
            } catch (eStellar) {
                console.error('❌ Ambas APIs fallaron:', eStellar.message)
                return m.reply('❌ Ocurrió un error o no se encontraron resultados en ninguna de las fuentes.')
            }
        }

        try {
            // Caso de Búsqueda (Search)
            if (!esUrl && Array.isArray(data)) {
                if (data.length === 0) return m.reply(`❌ No se encontraron paquetes para: *${text}*`)

                const lista = data.slice(0, 5)
                let caption = `╭━━━〔 📦 *STICKER.LY SEARCH* 〕━━━⬣\n`
                caption += `┃ 🔎 *Búsqueda:* ${text}\n`
                caption += `┃ 🌐 *Fuente:* ${proveedor}\n`
                caption += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`

                lista.forEach((item, index) => {
                    caption += `*${index + 1}. ${item.title || item.name || 'Sin título'}*\n`
                    caption += `👤 *Autor:* ${item.author?.name || item.author || 'Desconocido'}\n`
                    caption += `🔗 *Link:* ${item.url || item.link}\n\n`
                })

                caption += `📌 *Para descargar un pack usa:* \`${usedPrefix + command} <URL>\``
                return await m.reply(caption.trim())
            }

            // Caso de Detalle / Descarga de Pack (Detail)
            const stickersList = data.stickers || data.stickerUrls || (Array.isArray(data) ? data : [])

            if (!stickersList || stickersList.length === 0) {
                return m.reply('❌ No se pudieron extraer los stickers de esta URL.')
            }

            // Extraer nombre del pack y autor si la API los provee
            const packname = data.name || defaultPackname
            const author = data.author?.name || defaultAuthor

            await m.reply(`✅ *Paquete encontrado:* "${packname}" (${stickersList.length} stickers).\nEnviando los primeros 10...`)

            const enviarMax = stickersList.slice(0, 10)

            for (const item of enviarMax) {
                // Mapeo adaptado a la propiedad imageUrl enviada por tu API
                const urlDirecta = typeof item === 'string' ? item : (item.imageUrl || item.url || item.link)

                if (!urlDirecta) continue

                try {
                    await conn.sendMessage(m.chat, {
                        sticker: { url: urlDirecta },
                        packname: packname,
                        author: author
                    }, { quoted: m })
                } catch (errSticker) {
                    console.error(`Error enviando sticker individual (${urlDirecta}):`, errSticker.message)
                }
            }

        } catch (error) {
            console.error('❌ Error enviando stickers:', error)
            return m.reply('❌ Ocurrió un fallo al procesar los archivos del paquete.')
        }
    }
}
