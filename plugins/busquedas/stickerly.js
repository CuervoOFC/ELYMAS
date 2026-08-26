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
ʚĭɞ funcion :: Descarga de Sticker.ly enviando el paquete completo (Sticker Pack Natively)
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

        // 1. Petición API Principal Evogb
        try {
            const urlEvogb = `${API_EVOGB}/${tipoConsulta}?${esUrl ? 'url' : 'query'}=${encodeURIComponent(textoLimpio)}&key=${EVOGB_KEY}`
            rawJson = await pedirDatos(urlEvogb)

            if (rawJson && (rawJson.status === true || rawJson.code === 200)) {
                proveedor = 'Evogb'
            } else {
                throw new Error('Sin respuesta en Evogb')
            }
        } catch (eEvogb) {
            console.warn('⚠️ Falló API Evogb, activando respaldo Stellar...', eEvogb.message)

            // 2. Petición API Respaldo Stellar
            try {
                const urlStellar = `${API_STELLAR}/${tipoConsulta}?${esUrl ? 'url' : 'query'}=${encodeURIComponent(textoLimpio)}&key=${STELLAR_KEY}`
                rawJson = await pedirDatos(urlStellar)

                if (rawJson && (rawJson.status === true || rawJson.code === 200)) {
                    proveedor = 'Stellar'
                } else {
                    throw new Error('Sin respuesta en Stellar')
                }
            } catch (eStellar) {
                console.error('❌ Ambas APIs fallaron:', eStellar.message)
                return m.reply('❌ Ocurrió un error o no se encontraron resultados en ninguna de las fuentes.')
            }
        }

        try {
            // MODO BÚSQUEDA
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

            // MODO DESCARGA Y ENVÍO DE STICKER PACK NATIVO
            const detalles = rawJson.detalles || rawJson.result || rawJson
            const stickersList = detalles.stickers || rawJson.stickers || []

            if (!Array.isArray(stickersList) || stickersList.length === 0) {
                return m.reply('❌ No se pudieron extraer los stickers de esta URL.')
            }

            const packname = detalles.name || defaultPackname
            const author = detalles.author?.name || detalles.author || defaultAuthor

            // Mapear el array de stickers según la estructura requerida por @itsliaaa/baileys
            const stickersArray = stickersList.map(item => {
                const link = typeof item === 'string' ? item : (item.imageUrl || item.url || item.link)
                return {
                    data: { url: link }
                }
            }).filter(s => s.data.url)

            if (stickersArray.length === 0) {
                return m.reply('❌ No se encontraron URLs válidas de stickers.')
            }

            // Seleccionar la primera imagen como portada (cover)
            const coverUrl = stickersArray[0].data.url

            await m.reply(`📦 *Enviando Paquete de Stickers:* "${packname}" (${stickersArray.length} stickers)...`)

            // Enviar mensaje como Sticker Pack Oficial
            return await conn.sendMessage(m.chat, {
                cover: { url: coverUrl },
                stickers: stickersArray,
                name: packname,
                publisher: author,
                description: 'Descargado vía Sticker.ly'
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error enviando el paquete de stickers:', error)
            return m.reply('❌ Ocurrió un fallo al procesar y enviar el paquete de stickers.')
        }
    }
}
