/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ 💤 CODIGO JAVASCRIPT ʚĭɞ 💤
ʚĭɞ 💤 codigo :: plugins/busquedas/cosplay.js
ʚĭɞ 💤 funcion :: Cosplay y Girl NSFW (Requiere modo NSFW activo)
──────✧✦✧──────
*/

import fs from 'fs'
import path from 'path'
import { getGroup } from '../../lib/database.js'

const STELLAR_KEY = 'CuervoOFC'
const EVO_KEY = 'CuervoOFC'

const API_COSPLAY = 'https://api.stellarwa.xyz/search/cosplaytele'
const API_CONVERTER = 'https://api.evogb.org/api/converter-img'
const API_UPLOAD = 'https://api.evogb.org/tools/upload'

const DB_PATH = path.join(process.cwd(), 'database', 'cosplay_gallery.json')

// Caché temporal para paginación (5 minutos de duración)
const cosplayCache = new Map()

// Asegurar existencia del archivo JSON local
function initDatabase() {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify([]))
    }
}

function getLocalGallery() {
    initDatabase()
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8')
        return JSON.parse(data) || []
    } catch {
        return []
    }
}

function saveToLocalGallery(newUrls) {
    initDatabase()
    const current = getLocalGallery()
    const merged = Array.from(new Set([...current, ...newUrls]))
    fs.writeFileSync(DB_PATH, JSON.stringify(merged, null, 2))
}

// Convertir imagen WebP a PNG mediante la API de EvoGB
async function convertToPng(imageUrl) {
    try {
        const convertUrl = `${API_CONVERTER}?method=url&url=${encodeURIComponent(imageUrl)}&width=none&height=none&to=png&key=${EVO_KEY}`
        const res = await fetch(convertUrl)
        const json = await res.json()
        if (json && json.status && json.url) {
            return json.url
        }
    } catch (e) {
        console.error('⚠️ Error convirtiendo imagen:', e.message)
    }
    return imageUrl
}

// Subir imagen al servidor de EvoGB fijando vigencia de 1 año (365 días)
async function uploadToEvo1Year(mediaBuffer, mime = 'image/png') {
    try {
        const formData = new FormData()
        const blob = new Blob([mediaBuffer], { type: mime })
        formData.append('file', blob, 'cosplay.png')
        formData.append('expiration', '365d')

        const res = await fetch(`${API_UPLOAD}?key=${EVO_KEY}`, {
            method: 'POST',
            body: formData
        })

        if (res.ok) {
            const json = await res.json()
            if (json && json.status && json.url) {
                return json.url
            }
        }
    } catch (e) {
        console.error('⚠️ Error re-subiendo archivo a EvoGB:', e.message)
    }
    return null
}

// Descargar, convertir, re-subir a 1 año y guardar en la base local
async function processAndStoreImage(imageUrl) {
    try {
        const pngUrl = await convertToPng(imageUrl)
        const res = await fetch(pngUrl)
        if (!res.ok) return imageUrl

        const buffer = await res.arrayBuffer()
        const uploadedUrl = await uploadToEvo1Year(Buffer.from(buffer))

        const finalUrl = uploadedUrl || pngUrl
        saveToLocalGallery([finalUrl])
        return finalUrl
    } catch {
        return imageUrl
    }
}

async function sendBatchImages(m, conn, chatJid) {
    const session = cosplayCache.get(chatJid)
    if (!session) return

    const { images, index, title } = session
    const batch = images.slice(index, index + 5)

    if (batch.length === 0) {
        cosplayCache.delete(chatJid)
        return conn.sendMessage(chatJid, { text: '🏁 *Has llegado al final de la galería de este cosplay.*' }, { quoted: m })
    }

    await conn.sendMessage(chatJid, {
        text: `📸 *Enviando imágenes (${index + 1} - ${index + batch.length} de ${images.length})*...`
    }, { quoted: m })

    const processedBatch = []

    for (const imgUrl of batch) {
        const finalUrl = await processAndStoreImage(imgUrl)
        processedBatch.push(finalUrl)

        await conn.sendMessage(chatJid, {
            image: { url: finalUrl },
            caption: `🎭 *${title}*\n🖼️ Imagen ${session.index + processedBatch.length}/${images.length}`
        })
    }

    session.index += batch.length

    if (session.index < images.length) {
        await conn.sendMessage(chatJid, {
            text: `📌 Escribe *'siguiente'* para ver las próximas 5 imágenes.\n⏳ *Expira en 5 minutos.*`
        })
    } else {
        cosplayCache.delete(chatJid)
    }
}

export default {
    command: ['cosplay', 'girl', 'cosplaysearch'],

    async run(m, { conn, text, usedPrefix, command }) {
        // 🛑 VALIDACIÓN OBLIGATORIA NSFW EN GRUPOS
        if (m.isGroup) {
            const groupData = getGroup(m.chat) || {}
            if (!groupData.nsfw) {
                return m.reply(
                    '🔞 *El modo NSFW está DESACTIVADO en este grupo.*\n\n' +
                    'Un Administrador debe activarlo primero usando:\n' +
                    '👉 `.nsfw on`'
                )
            }
        }

        // Modo 1: Enviar imagen aleatoria desde el JSON local (.girl o .cosplay sin texto)
        if (!text || command === 'girl') {
            const gallery = getLocalGallery()
            if (gallery.length === 0) {
                return m.reply(`❌ La galería local está vacía. Realiza una búsqueda usando:\n\`${usedPrefix}cosplay search <personaje/waifu>\``)
            }

            const randomUrl = gallery[Math.floor(Math.random() * gallery.length)]
            return conn.sendMessage(m.chat, {
                image: { url: randomUrl },
                caption: `✨ *Cosplay / Girl Random*\n🖼️ Galería local: ${gallery.length} fotos`
            }, { quoted: m })
        }

        // Modo 2: Búsqueda interactiva de cosplay (.cosplay search <query>)
        const query = text.replace(/^search\s+/i, '').trim()
        await m.reply('🔍 *Buscando cosplay y preparando galería...*')

        try {
            const res = await fetch(`${API_COSPLAY}?query=${encodeURIComponent(query)}&key=${STELLAR_KEY}`)
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`)

            const json = await res.json()
            if (!json || !json.status || !json.results?.images || json.results.images.length === 0) {
                return m.reply(`❌ No se encontraron resultados de cosplay para: *${query}*`)
            }

            const images = json.results.images
            const title = json.title || 'Cosplay Tele'

            // Guardar sesión en caché por 5 minutos
            cosplayCache.set(m.chat, {
                title,
                images,
                index: 0,
                timer: setTimeout(() => {
                    if (cosplayCache.has(m.chat)) cosplayCache.delete(m.chat)
                }, 5 * 60 * 1000)
            })

            await sendBatchImages(m, conn, m.chat)

        } catch (err) {
            console.error('⚠️ Error en búsqueda de cosplay:', err)
            m.reply('❌ Ocurrió un error al procesar la búsqueda del cosplay.')
        }
    },

    // Escuchador para avanzar de lote con la palabra "siguiente"
    async before(m, { conn }) {
        if (!m.text || !cosplayCache.has(m.chat)) return

        const word = m.text.trim().toLowerCase()
        if (word === 'siguiente' || word === 'sig') {
            // Verificar estado NSFW antes de enviar el siguiente lote
            if (m.isGroup) {
                const groupData = getGroup(m.chat) || {}
                if (!groupData.nsfw) {
                    cosplayCache.delete(m.chat)
                    return m.reply('🔞 *El modo NSFW fue desactivado.* Se canceló la sesión.')
                }
            }

            const session = cosplayCache.get(m.chat)
            clearTimeout(session.timer)
            session.timer = setTimeout(() => {
                if (cosplayCache.has(m.chat)) cosplayCache.delete(m.chat)
            }, 5 * 60 * 1000)

            await sendBatchImages(m, conn, m.chat)
        }
    }
}
