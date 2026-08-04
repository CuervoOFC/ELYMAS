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
ʚĭɞ funcion :: Descargar videos de Facebook con seleccion de mejor calidad (1080p/720p)
──────✧✦✧──────
*/

const EVO_KEY = 'evogb-WzR3kPpa'
const STELLAR_KEY = 'api-COTah'

export default {
    command: ['fb', 'facebook', 'fbdl'],

    async run(m, { conn, args, text }) {
        const url = args[0] || text

        if (!url || !url.includes('facebook.com') && !url.includes('fb.watch')) {
            return m.reply(
                '╭─「 📘 *FACEBOOK DOWNLOADER* 」\n' +
                '│\n' +
                '│ ❌ Ingresa un enlace válido de Facebook.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:*\n' +
                '│ • `.fb https://www.facebook.com/share/r/xxxxxxx`\n' +
                '╰──────────────'
            )
        }

        await m.reply('⏳ *Descargando video de Facebook... Por favor espera.*')

        let videoUrl = null

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

        if (!videoUrl) {
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
        }

        if (!videoUrl) {
            return m.reply('❌ No se pudo extraer el video. Verifica que la publicación sea pública o el enlace sea correcto.')
        }

        try {
            return await conn.sendMessage(
                m.chat,
                {
                    video: { url: videoUrl },
                    caption: '✅ *¡Video de Facebook descargado con éxito!*'
                },
                { quoted: m }
            )
        } catch (error) {
            console.error('❌ Error al enviar video de Facebook:', error)
            return m.reply('❌ Ocurrió un error al enviar el video de Facebook.')
        }
    }
}
