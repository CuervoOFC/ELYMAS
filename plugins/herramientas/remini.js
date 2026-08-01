/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/herramientas/remini.js
ʚĭɞ ೃ funcion :: mejorar calidad de imagen usando upload nativo
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { downloadMediaMessage } from '@itsliaaa/baileys'

const EVO_KEY = 'evogb-WzR3kPpa'
const STELLAR_KEY = 'api-COTah'

const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'

const MAX_SIZE_MB = 45

/**
 * Sube la imagen usando los hostings nativos del bot (EvoGB / StellarWA)
 */
async function uploadMedia(mediaBuffer, mime) {
    const ext = mime.split('/')[1]?.split(';')[0] || 'jpg'
    
    // 1. Intentar subir primero a EvoGB
    try {
        const formData = new FormData()
        const blob = new Blob([mediaBuffer], { type: mime })
        formData.append('file', blob, `file.${ext}`)

        const res = await fetch(`${EVO_UPLOAD_API}?key=${EVO_KEY}`, {
            method: 'POST',
            body: formData
        })

        if (res.ok) {
            const json = await res.json()
            if (json.status && json.url) return json.url
        }
    } catch (e) {
        console.log('⚠️ Error subiendo a EvoGB en remini, intentando StellarWA...', e.message)
    }

    // 2. Respaldo en StellarWA Hosting
    const formData = new FormData()
    const blob = new Blob([mediaBuffer], { type: mime })
    formData.append('file', blob, `file.${ext}`)

    const res = await fetch(STELLAR_UPLOAD_API, {
        method: 'POST',
        body: formData
    })

    if (!res.ok) throw new Error('No se pudo subir la imagen a los servidores de hosting.')

    const json = await res.json()
    if (!json.success || !json.file?.publicUrl) throw new Error('Respuesta inválida del hosting StellarWA.')

    return json.file.publicUrl
}

export default {
    command: ['remini', 'hd', 'upscale'],

    async run(m, { conn, args }) {
        const q = m.quoted ? m.quoted : m
        const rawMessage = q.message || q.msg || q

        const mime = (
            rawMessage.imageMessage?.mimetype ||
            q.mimetype ||
            ''
        )

        if (!mime || !mime.startsWith('image/')) {
            return m.reply(
                '╭─「 🖼️ *REMINI / UPSCALE* 」\n' +
                '│\n' +
                '│ ❌ Responde a una *imagen* o envía una con el comando.\n' +
                '│\n' +
                '│ 📌 *Opciones:*\n' +
                '│ .remini      ➔ Método 1 (EvoGB) con respaldo Método 2 (StellarWA)\n' +
                '│ .remini , 1  ➔ Método 1 (EvoGB)\n' +
                '│ .remini , 2  ➔ Método 2 (StellarWA)\n' +
                '╰──────────────'
            )
        }

        await m.reply('⏳ *Descargando e iniciando proceso de subida y mejora...*')

        try {
            // 1. Descargar Buffer usando Baileys
            let mediaBuffer
            try {
                mediaBuffer = await downloadMediaMessage(
                    q,
                    'buffer',
                    {},
                    { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
                )
            } catch (dlErr) {
                if (typeof q.download === 'function') {
                    mediaBuffer = await q.download()
                } else if (typeof conn.downloadMediaMessage === 'function') {
                    mediaBuffer = await conn.downloadMediaMessage(q)
                } else {
                    throw dlErr
                }
            }

            if (!mediaBuffer) {
                throw new Error('No se pudo descargar la imagen.')
            }

            // Validar límite máximo de 45 MB
            const fileSizeMB = mediaBuffer.length / (1024 * 1024)
            if (fileSizeMB > MAX_SIZE_MB) {
                return m.reply(`⚠️ La imagen supera el límite máximo de ${MAX_SIZE_MB} MB. (${fileSizeMB.toFixed(2)} MB)`)
            }

            // 2. Subir imagen a la nube
            const uploadedUrl = await uploadMedia(mediaBuffer, mime)

            // Detectar si el usuario usó `, 1` o `, 2`
            const text = args.join(' ')
            let selectedOption = 0
            if (text.includes('1')) selectedOption = 1
            if (text.includes('2')) selectedOption = 2

            let resultBuffer = null
            let methodUsed = ''

            // --- MÉTODO 1 (EvoGB Upscale) ---
            if (selectedOption === 1 || selectedOption === 0) {
                try {
                    const evoApi = `https://api.evogb.org/tools/upscale?method=url&url=${encodeURIComponent(uploadedUrl)}&key=${EVO_KEY}`
                    const res = await fetch(evoApi)
                    if (res.ok) {
                        const arrayBuf = await res.arrayBuffer()
                        resultBuffer = Buffer.from(arrayBuf)
                        methodUsed = 'método 1'
                    } else {
                        throw new Error('EvoGB API no disponible')
                    }
                } catch (err) {
                    console.log('⚠️ EvoGB Upscale falló, probando StellarWA...', err.message)
                }
            }

            // --- MÉTODO 2 (StellarWA Upscale) ---
            if (!resultBuffer && (selectedOption === 2 || selectedOption === 0)) {
                try {
                    const stellarApi = `https://api.stellarwa.xyz/tools/upscale?method=url&url=${encodeURIComponent(uploadedUrl)}&scale=4&key=${STELLAR_KEY}`
                    const res = await fetch(stellarApi)
                    if (res.ok) {
                        const arrayBuf = await res.arrayBuffer()
                        resultBuffer = Buffer.from(arrayBuf)
                        methodUsed = 'método 2'
                    } else {
                        throw new Error('StellarWA API no disponible')
                    }
                } catch (err) {
                    console.log('⚠️ StellarWA Upscale falló:', err.message)
                }
            }

            if (!resultBuffer) {
                throw new Error('No se pudo procesar la imagen en ninguna de las APIs de mejora.')
            }

            // 3. Enviar mensaje de respuesta
            const captionText = 
                '✨ *¡IMAGEN MEJORADA CON ÉXITO!*\n\n' +
                `⚙️ Subida y mejorada : ${methodUsed}\n` +
                `🔗 *URL Subida:* ${uploadedUrl}`

            return await conn.sendMessage(m.chat, {
                image: resultBuffer,
                caption: captionText
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en Remini:', error)
            return m.reply(
                '❌ Ocurrió un error al procesar la imagen.\n\n' +
                `📄 ${error instanceof Error ? error.message : 'Error desconocido'}`
            )
        }
    }
}
