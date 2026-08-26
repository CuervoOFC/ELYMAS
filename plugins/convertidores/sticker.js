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
                `• \`${usedPrefix + command} Memes\` (Buscar paquetes)\n` +
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

        let rawJson = null
        let proveedor = ''

        // 1. Intentar con Evogb API
        try {
            const urlEvogb = `${API_EVOGB}/${tipoConsulta}?${esUrl ? 'url' : 'query'}=${encodeURIComponent(textoLimpio)}&key=${EVOGB_KEY}`
            rawJson = await pedirDatos(urlEvogb)

            if (rawJson && (rawJson.status === true || rawJson.code === 200)) {
                proveedor = 'Evogb'
            } else {
                throw new Error('Respuesta inválida en Evogb')
            }
        } catch (eEvogb) {
            console.warn('⚠️ Falló API Evogb, activando respaldo Stellar...', eEvogb.message)

            // 2. Intentar con Stellar API (Respaldo)
            try {
                const urlStellar = `${API_STELLAR}/${tipoConsulta}?${esUrl ? 'url' : 'query'}=${encodeURIComponent(textoLimpio)}&key=${STELLAR_KEY}`
                rawJson = await pedirDatos(urlStellar)

                if (rawJson && (rawJson.status === true || rawJson.code === 200)) {
                    proveedor = 'Stellar'
                } else {
                    throw new Error('Respuesta inválida en Stellar')
                }
            } catch (eStellar) {
                console.error('❌ Ambas APIs fallaron:', eStellar.message)
                return m.reply('❌ Ocurrió un error o no se encontraron resultados en ninguna de las fuentes.')
            }
        }

        try {
            // BUSQUEDA DE PAQUETES (Search)
            if (!esUrl) {
                const listaBusqueda = rawJson.result || rawJson.resultados || rawJson.detalles || (Array.isArray(rawJson) ? rawJson : [])

                if (!Array.isArray(listaBusqueda) || listaBusqueda.length === 0) {
                    return m.reply(`❌ No se encontraron paquetes para: *${text}*`)
                }

                const lista = listaBusqueda.slice(0, 5)
                let caption = `╭━━━〔 📦 *STICKER.LY SEARCH* 〕━━━⬣\n`
                caption += `┃ 🔎 *Búsqueda:* ${text}\n`
                caption += `┃ 🌐 *Fuente:* ${proveedor}\n`
                caption += `╰━━━━━━━━━━━━━━━━━━━━⬣\n\n`

                lista.forEach((item, index) => {
                    const nombre = item.title || item.name || 'Sin título'
                    const autor = typeof item.author === 'object' ? item.author?.name : (item.author || item.creator || 'Desconocido')
                    const link = item.url || item.link || ''

                    caption += `*${index + 1}. ${nombre}*\n`
                    caption += `👤 *Autor:* ${autor}\n`
                    caption += `🔗 *Link:* ${link}\n\n`
                })

                caption += `📌 *Para descargar un pack usa:* \`${usedPrefix + command} <URL>\``
                return await m.reply(caption.trim())
            }

            // DESCARGA DE DETALLES DEL PACK (Detail)
            const detalles = rawJson.detalles || rawJson.result || rawJson
            const stickersList = detalles.stickers || rawJson.stickers || []

            if (!Array.isArray(stickersList) || stickersList.length === 0) {
                return m.reply('❌ No se pudieron extraer los stickers de esta URL.')
            }

            // Extraer nombre del paquete y nombre del autor desde el JSON
            const packname = detalles.name || defaultPackname
            const author = detalles.author?.name || detalles.author || defaultAuthor

            await m.reply(`✅ *Paquete encontrado:* "${packname}" (${stickersList.length} stickers).\nEnviando stickers...`)

            // Limitar a 10 stickers por envío para evitar lag/spam
            const enviarMax = stickersList.slice(0, 10)

            for (const item of enviarMax) {
                // Extraer la URL de la imagen del objeto devuelto por la API ({ imageUrl: '...' })
                const urlDirecta = typeof item === 'string' ? item : item.imageUrl || item.url || item.link

                if (!urlDirecta) continue

                try {
                    await conn.sendMessage(m.chat, {
                        sticker: { url: urlDirecta },
                        packname: packname,
                        author: author
                    }, { quoted: m })
                } catch (errSticker) {
                    console.error(`Error enviando sticker (${urlDirecta}):`, errSticker.message)
                }
            }

        } catch (error) {
            console.error('❌ Error procesando los stickers:', error)
            return m.reply('❌ Ocurrió un fallo al procesar los archivos del paquete.')
        }
    }
}
