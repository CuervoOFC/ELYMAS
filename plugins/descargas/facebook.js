/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/descargas/facebook.js
ʚĭɞ funcion :: Descargar videos de Facebook y subir el archivo al host (Upload)
──────✧✦✧──────
*/

const EVO_KEY = 'CuervoOFC'
const STELLAR_KEY = 'CuervoOFC'

const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'

const MAX_SIZE_EVO = 150 * 1024 * 1024  // 150 MB
const MAX_SIZE_STELLAR = 40 * 1024 * 1024 // 40 MB

// Función para subir el Buffer a EvoGB
async function uploadToEvo(buffer, mime = 'video/mp4') {
    const fileSize = buffer.length
    if (fileSize > MAX_SIZE_EVO) {
        throw new Error(`El video supera el límite de 150 MB de EvoGB. (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)
    }

    const formData = new FormData()
    const blob = new Blob([buffer], { type: mime })
    formData.append('file', blob, 'facebook_video.mp4')

    const res = await fetch(`${EVO_UPLOAD_API}?key=${EVO_KEY}`, {
        method: 'POST',
        body: formData
    })

    if (!res.ok) throw new Error(`HTTP Status ${res.status}`)

    const json = await res.json()
    if (!json.status || !json.url) throw new Error('EvoGB no devolvió una URL válida.')

    return {
        url: json.url,
        size: json.data?.size || `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
        name: json.data?.name || 'facebook_video.mp4',
        expires: json.data?.expires_at ? new Date(json.data.expires_at).toLocaleDateString() : '7 Días'
    }
}

// Función para subir el Buffer a StellarWA
async function uploadToStellar(buffer, mime = 'video/mp4') {
    const fileSize = buffer.length
    if (fileSize > MAX_SIZE_STELLAR) {
        throw new Error(`El video supera el límite de 40 MB de StellarWA. (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)
    }

    const formData = new FormData()
    const blob = new Blob([buffer], { type: mime })
    formData.append('file', blob, 'facebook_video.mp4')

    const res = await fetch(STELLAR_UPLOAD_API, {
        method: 'POST',
        body: formData
    })

    if (!res.ok) throw new Error(`HTTP Status ${res.status}`)

    const json = await res.json()
    if (!json.success || !json.file?.publicUrl) throw new Error('StellarWA no devolvió una URL válida.')

    return {
        url: json.file.publicUrl,
        size: `${(json.file.size / 1024 / 1024).toFixed(2)} MB`,
        name: json.file.filename || 'facebook_video.mp4',
        expires: 'Permanente'
    }
}

export default {
    command: ['fb', 'facebook', 'fbdl'],

    async run(m, { conn, args, text }) {
        const url = args[0] || text

        if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
            return m.reply(
                '╭─「 📘 *FACEBOOK DOWNLOADER* 」\n' +
                '│\n' +
                '│ ❌ Ingresa un enlace válido de Facebook.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:*\n' +
                '│ • `.fb https://www.facebook.com/share/r/1BtPzMGNZQ/`\n' +
                '╰──────────────'
            )
        }

        await m.reply('⏳ *Obteniendo y subiendo video de Facebook... Por favor espera.*')

        let videoUrl = null

        // 1. Extraer URL directa con API Stellar
        try {
            const stellarApi = `https://api.stellarwa.xyz/dl/facebook?url=${encodeURIComponent(url)}&key=${STELLAR_KEY}`
            const res = await fetch(stellarApi)
            const data = await res.json()

            if (data?.status && Array.isArray(data.resultados) && data.resultados.length > 0) {
                const preferred = data.resultados.find(v => v.quality?.includes('1080p')) ||
                                  data.resultados.find(v => v.quality?.includes('720p')) ||
                                  data.resultados.find(v => v.url && v.url !== '/')

                if (preferred && preferred.url && preferred.url !== '/') {
                    videoUrl = preferred.url.replace(/&amp;/g, '&')
                }
            }
        } catch (e) {
            console.error('❌ Error en API Stellar Facebook:', e)
        }

        // 2. Extraer URL directa con API EvoGB (Respaldo)
        if (!videoUrl) {
            try {
                const evoApi = `https://api.evogb.org/dl/facebook?url=${encodeURIComponent(url)}&key=${EVO_KEY}`
                const res = await fetch(evoApi)
                const data = await res.json()

                if (data?.status && Array.isArray(data.resultados) && data.resultados.length > 0) {
                    const preferred = data.resultados.find(v => v.quality?.includes('1080p')) ||
                                      data.resultados.find(v => v.quality?.includes('720p')) ||
                                      data.resultados.find(v => v.url && v.url !== '/')

                    if (preferred && preferred.url && preferred.url !== '/') {
                        videoUrl = preferred.url.replace(/&amp;/g, '&')
                    }
                }
            } catch (e) {
                console.error('❌ Error en API EvoGB Facebook:', e)
            }
        }

        if (!videoUrl) {
            return m.reply('❌ No se pudo extraer el video. Verifica que la publicación sea pública o el enlace sea correcto.')
        }

        try {
            // Descargar el video como Buffer
            const videoRes = await fetch(videoUrl)
            if (!videoRes.ok) throw new Error('No se pudo descargar el buffer del video de Facebook.')
            
            const arrayBuffer = await videoRes.arrayBuffer()
            const videoBuffer = Buffer.from(arrayBuffer)

            // Subir al host (EvoGB primero, si falla intenta StellarWA)
            let fileData = null
            try {
                fileData = await uploadToEvo(videoBuffer)
            } catch (error) {
                console.log('⚠️ EvoGB falló en FB Upload. Probando StellarWA...', error.message)
                fileData = await uploadToStellar(videoBuffer)
            }

            // Responder con los datos del servidor de subida
            return m.reply(
                '╭━━━〔 ☁️ FACEBOOK 〕━━━⬣\n' +
                `┃ 📄 *Nombre:* ${fileData.name}\n` +
                `┃ 📦 *Tamaño:* ${fileData.size}\n` +
                '╰━━━━━━━━━━━━━━━━━━━━⬣\n\n' +
                `🔗 *Enlace:* ${fileData.url}`
            )

        } catch (error) {
            console.error('❌ Error al subir video de Facebook:', error)
            return m.reply(`❌ Ocurrió un error al procesar y subir el video: ${error.message}`)
        }
    }
}
