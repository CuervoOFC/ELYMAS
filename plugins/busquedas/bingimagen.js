/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/busquedas/bingimage.js
ʚĭɞ funcion :: Búsqueda de imágenes con selección interactiva por número
──────✧✦✧──────
*/

const EVO_KEY = 'evogb-WzR3kPpa'
const STELLAR_KEY = 'api-COTah'

const API_EVO = 'https://api.evogb.org/search/bingimage'
const API_STELLAR = 'https://api.stellarwa.xyz/search/bingimage'

const imageCache = new Map()

async function fetchBingImages(query) {
    const encodedQuery = encodeURIComponent(query)
    try {
        const res = await fetch(`${API_EVO}?query=${encodedQuery}&key=${EVO_KEY}`)
        if (res.ok) {
            const json = await res.json()
            if (json && json.status && Array.isArray(json.result) && json.result.length > 0) {
                return json.result
            }
        }
    } catch (e) {
        console.error('⚠️ Error API EvoGB BingImage:', e.message)
    }

    try {
        const res = await fetch(`${API_STELLAR}?query=${encodedQuery}&key=${STELLAR_KEY}`)
        if (res.ok) {
            const json = await res.json()
            if (json && json.status && Array.isArray(json.result) && json.result.length > 0) {
                return json.result
            }
        }
    } catch (e) {
        console.error('⚠️ Error API StellarWA BingImage:', e.message)
    }

    return null
}

export default {
    command: ['bingimg', 'bingimage'],

    async run(m, { conn, text, usedPrefix, command }) {
        if (!text) {
            return m.reply(
                `💡 *Uso del comando:*\n` +
                `• \`${usedPrefix + command} <término a buscar>\`\n\n` +
                `*Ejemplo:* \`${usedPrefix + command} Waifu\``
            )
        }

        await m.reply('🔍 *Buscando imágenes, por favor espera...*')

        try {
            const results = await fetchBingImages(text)

            if (!results || results.length === 0) {
                return m.reply(`❌ No se encontraron imágenes para: *${text}*`)
            }

            const listLimit = results.slice(0, 10)
            imageCache.set(m.chat, listLimit)

            let txt = `╭─「 🖼️ *RESULTADOS DE BÚSQUEDA* 」\n`
            txt += `│ 📌 *Búsqueda:* ${text}\n`
            txt += `│ 🔢 *Resultados:* ${listLimit.length}\n`
            txt += `╰─────────────────────\n\n`
            txt += `💬 *Responde a este mensaje con un número (1-${listLimit.length}) para recibir la imagen:*\n\n`

            listLimit.forEach((item, index) => {
                txt += `*${index + 1}.* ${item.title || 'Imagen sin título'}\n`
            })

            const sentMsg = await m.reply(txt)

            setTimeout(() => {
                if (imageCache.has(m.chat)) imageCache.delete(m.chat)
            }, 5 * 60 * 1000)

        } catch (err) {
            console.error('⚠️ Error en comando BingImage:', err)
            m.reply('❌ Ocurrió un error inesperado al procesar la búsqueda de imágenes.')
        }
    },

    async before(m, { conn }) {
        if (!m.quoted || !imageCache.has(m.chat)) return

        const userChoice = parseInt(m.text?.trim())
        const storedImages = imageCache.get(m.chat)

        if (isNaN(userChoice) || userChoice < 1 || userChoice > storedImages.length) return

        const selectedImage = storedImages[userChoice - 1]
        if (!selectedImage || !selectedImage.image) return

        try {
            await conn.sendMessage(m.chat, {
                image: { url: selectedImage.image },
                caption: 
                    `🖼️ *${selectedImage.title || 'Imagen'}*\n\n` +
                    `🌐 *Fuente:* ${selectedImage.source || 'N/A'}`
            }, { quoted: m })

        } catch (e) {
            if (selectedImage.thumbnail) {
                await conn.sendMessage(m.chat, {
                    image: { url: selectedImage.thumbnail },
                    caption: `🖼️ *${selectedImage.title || 'Imagen'}* (Calidad reducida)\n\n🌐 *Fuente:* ${selectedImage.source || 'N/A'}`
                }, { quoted: m })
            } else {
                m.reply('❌ No se pudo descargar la imagen seleccionada.')
            }
        }
    }
}
