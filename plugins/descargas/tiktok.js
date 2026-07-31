/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/descargas/tiktok.js
ʚĭɞ ೃ funcion :: descarga de tiktok
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

const EVO_KEY = 'evogb-WzR3kPpa'
const STELLAR_KEY = 'api-COTah'

const EVO_API = 'https://api.evogb.org/dl/tiktokv2'
const STELLAR_API = 'https://api.stellarwa.xyz/dl/tiktokv2'

export default {
    command: [
        'tiktok',
        'tt'
    ],

    async run(m, { conn, args }) {
        if (!args || args.length === 0) {
            return m.reply(
                '╭─「 🎵 *TIKTOK DOWNLOADER* 」\n' +
                '│\n' +
                '│ ❌ Escribe un enlace de TikTok.\n' +
                '│\n' +
                '│ Ejemplos:\n' +
                '│ .tiktok https://vm.tiktok.com/xxxxx\n' +
                '│ .tiktok https://vm.tiktok.com/xxxxx,1\n' +
                '│ .tiktok https://vm.tiktok.com/xxxxx,2\n' +
                '│\n' +
                '│ , 1 = EvoGB\n' +
                '│ , 2 = Stellar\n' +
                '│\n' +
                '│ Si no eliges API se usará Evo.\n' +
                '╰──────────────'
            )
        }

        let api = 1
        let url = args.join(' ').trim()

        if (url.endsWith(', 2')) {
            api = 2
            url = url.replace(/, 2$/, '').trim()
        } else if (url.endsWith(', 1')) {
            api = 1
            url = url.replace(/, 1$/, '').trim()
        }

        if (
            !url.includes('tiktok.com') &&
            !url.includes('vm.tiktok.com') &&
            !url.includes('vt.tiktok.com')
        ) {
            return m.reply('❌ Debes ingresar un enlace válido de TikTok.')
        }

        await m.reply(
            '📥 Descargando TikTok...\n\n' +
            `🌐 API: ${api === 1 ? 'EvoGB' : 'Stellar'}`
        )

        function buildURL(apiNumber) {
            if (apiNumber === 2) {
                return `${STELLAR_API}?url=${encodeURIComponent(url)}&key=${STELLAR_KEY}`
            }
            return `${EVO_API}?url=${encodeURIComponent(url)}&key=${EVO_KEY}`
        }

        try {
            let response
            let data

            try {
                response = await fetch(buildURL(api))
                data = await response.json()

                if (!response.ok || !data.status) {
                    throw new Error('API Error')
                }
            } catch {
                if (api === 1) {
                    await m.reply('⚠️ EvoGB no respondió.\nProbando Stellar...')
                    api = 2
                    response = await fetch(buildURL(2))
                    data = await response.json()

                    if (!response.ok || !data.status) {
                        return m.reply('❌ Ambas APIs fallaron.')
                    }
                } else {
                    return m.reply('❌ La API Stellar no respondió.')
                }
            }

            const video =
                data.data?.find(v => v.type === 'nowatermark_hd')?.url ||
                data.data?.find(v => v.type === 'nowatermark')?.url ||
                data.data?.find(v => v.type === 'watermark')?.url

            if (!video) {
                return m.reply('❌ No se encontró el video.')
            }

            const music = data.music_info?.url || null
            const likes = data.stats?.likes || '0'
            const views = data.stats?.views || '0'
            const comments = data.stats?.comment || '0'
            const shares = data.stats?.share || '0'
            const duration = data.duration || 'Desconocida'
            const author = data.author?.nickname || 'Desconocido'

            await conn.sendMessage(
                m.chat,
                {
                    video: { url: video },
                    mimetype: 'video/mp4',
                    fileName: 'tiktok.mp4',
                    caption:
                        '╭━━━〔 🎵 TIKTOK DOWNLOADER 〕━━━⬣\n' +
                        `┃ 👤 Autor: ${author}\n` +
                        `┃ ❤️ Likes: ${likes}\n` +
                        `┃ 👀 Vistas: ${views}\n` +
                        `┃ 💬 Comentarios: ${comments}\n` +
                        `┃ 🔄 Compartidos: ${shares}\n` +
                        `┃ ⏱️ Duración: ${duration}\n` +
                        `┃ 🎧 Música: ${data.music_info?.title || 'Sin información'}\n` +
                        `┃ 🌐 API: ${api === 1 ? 'EvoGB' : 'Stellar'}\n` +
                        '╰━━━━━━━━━━━━━━━━━━━━⬣'
                },
                { quoted: m }
            )

            if (music) {
                try {
                    await conn.sendMessage(
                        m.chat,
                        {
                            audio: { url: music },
                            mimetype: 'audio/mpeg',
                            ptt: false,
                            fileName: 'tiktok.mp3'
                        },
                        { quoted: m }
                    )
                } catch (audioError) {
                    console.log('⚠️ No se pudo enviar el audio de TikTok:', audioError.message)
                }
            }

        } catch (error) {
            console.error('❌ Error TikTok:', error)
            return m.reply(
                '❌ Ocurrió un error al descargar el TikTok.\n\n' +
                `📄 ${error?.message || 'Error desconocido'}`
            )
        }
    }
}
