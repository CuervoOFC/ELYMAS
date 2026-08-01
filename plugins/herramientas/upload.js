/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/herramientas/upload.js
ʚĭɞ ೃ funcion :: subida de archivos a la nube (Tourl / Host)
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

const EVO_KEY = 'evogb-WzR3kPpa'
const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'

const MAX_SIZE_EVO = 150 * 1024 * 1024  // 150 MB
const MAX_SIZE_STELLAR = 40 * 1024 * 1024 // 40 MB

export default {
    command: [
        'upload',
        'tourl',
        'host'
    ],

    async run(m, { conn, args }) {
        
        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || quoted.mtype || ''

        
        if (!mime || mime === 'conversation') {
            return m.reply(
                '╭─「 ☁️ *UPLOADER / TOURL* 」\n' +
                '│\n' +
                '│ ❌ Responde a una *imagen, video, audio, documento o sticker*.\n' +
                '│\n' +
                '│ 📌 *Opciones de Servidor:*\n' +
                '│ .upload      ➔ EvoGB (por defecto | máx 150MB)\n' +
                '│ .upload , 1  ➔ Servidor EvoGB (máx 150MB)\n' +
                '│ .upload , 2  ➔ Servidor StellarWA (máx 40MB)\n' +
                '╰──────────────'
            )
        }

        const text = args.join(' ')
        let selectedServer = 1

        if (text.includes('2')) {
            selectedServer = 2
        }

        await m.reply('⏳ *Descargando archivo y procesando subida...*')

        try {
            
            const mediaBuffer = await quoted.download()
            if (!mediaBuffer) throw new Error('No se pudo descargar el archivo del mensaje.')

            const fileSize = mediaBuffer.length

            
            async function uploadToEvo() {
                if (fileSize > MAX_SIZE_EVO) {
                    throw new Error(`El archivo supera el límite de 150 MB de EvoGB. (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)
                }

                const formData = new FormData()
                const extension = mime.split('/')[1]?.split(';')[0] || 'bin'
                const blob = new Blob([mediaBuffer], { type: mime })
                formData.append('file', blob, `file.${extension}`)

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
                    name: json.data?.name || 'Archivo',
                    expires: json.data?.expires_at ? new Date(json.data.expires_at).toLocaleDateString() : '7 Días'
                }
            }

            
            async function uploadToStellar() {
                if (fileSize > MAX_SIZE_STELLAR) {
                    throw new Error(`El archivo supera el límite de 40 MB de StellarWA. (${(fileSize / 1024 / 1024).toFixed(2)} MB)`)
                }

                const formData = new FormData()
                const extension = mime.split('/')[1]?.split(';')[0] || 'bin'
                const blob = new Blob([mediaBuffer], { type: mime })
                formData.append('file', blob, `file.${extension}`)

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
                    name: json.file.filename || 'Archivo',
                    expires: 'Permanente'
                }
            }

            let fileData = null

            if (selectedServer === 2) {
                fileData = await uploadToStellar()
            } else {
                try {
                    fileData = await uploadToEvo()
                } catch (error) {
                    console.log('⚠️ EvoGB falló o excedió tamaño, intentando respaldo con StellarWA...', error.message)
                    fileData = await uploadToStellar()
                }
            }

            return m.reply(
                '╭━━━〔 ☁️ FILE UPLOADED 〕━━━⬣\n' +
                `┃ 📄 *Nombre:* ${fileData.name}\n` +
                `┃ 📦 *Tamaño:* ${fileData.size}\n` +
                `┃ ⏳ *Expiración:* ${fileData.expires}\n` +
                '╰━━━━━━━━━━━━━━━━━━━━⬣\n\n' +
                `🔗 *Enlace:* ${fileData.url}`
            )

        } catch (error) {
            console.error('❌ Error en upload:', error)
            return m.reply(
                '❌ Ocurrió un error al subir el archivo.\n\n' +
                `📄 ${error instanceof Error ? error.message : 'Error desconocido'}`
            )
        }
    }
}
