/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/descargas/play.js
ʚĭɞ ೃ funcion :: descarga de youtube en mp3
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

const EVO_KEY =
    'evogb-WzR3kPpa'

const STELLAR_KEY =
    'api-COTah'


const SEARCH_API =
    'https://api.evogb.org/search/yt'


const EVO_DOWNLOAD_API =
    'https://api.evogb.org/dl/ytmp3'


const STELLAR_DOWNLOAD_API =
    'https://api.stellarwa.xyz/dl/ytmp3'


export default {

    command: [
        'play',
        'playaudio'
    ],


    async run(
        m,
        {
            conn,
            args
        }
    ) {

        if (
            !args ||
            args.length === 0
        ) {

            return m.reply(
                '╭─「 🎵 *YOUTUBE PLAY* 」\n' +
                '│\n' +
                '│ ❌ Escribe el nombre de una canción.\n' +
                '│\n' +
                '│ 📌 Ejemplo:\n' +
                '│ .play nombre de la canción\n' +
                '│\n' +
                '│ 🎧 EvoGB:\n' +
                '│ .play nombre de la canción, 1\n' +
                '│\n' +
                '│ ⚡ StellarWA:\n' +
                '│ .play nombre de la canción, 2\n' +
                '╰──────────────'
            )

        }

        const fullText =
            args.join(' ')

        let apiNumber =
            1


        let query =
            fullText


        const parts =
            fullText.split(',')


        if (
            parts.length > 1
        ) {

            const possibleApi =
                parts[
                    parts.length - 1
                ].trim()


            if (
                possibleApi === '1' ||
                possibleApi === '2'
            ) {

                apiNumber =
                    Number(
                        possibleApi
                    )


                parts.pop()


                query =
                    parts.join(
                        ','
                    ).trim()

            }

        }


        if (
            !query
        ) {

            return m.reply(
                '❌ Escribe el nombre de la canción.'
            )

        }

        await m.reply(
            `🔎 Buscando en YouTube:\n\n` +
            `🎵 *${query}*\n\n` +
            `🌐 API seleccionada: ${
                apiNumber === 1
                    ? 'EvoGB'
                    : 'StellarWA'
            }`
        )


        try {

            const searchUrl =
                `${SEARCH_API}` +
                `?query=${encodeURIComponent(
                    query
                )}` +
                `&key=${EVO_KEY}`


            const response =
                await fetch(
                    searchUrl
                )


            if (
                !response.ok
            ) {

                throw new Error(
                    `Error HTTP búsqueda ${response.status}`
                )

            }


            const searchData =
                await response.json()


            if (
                !searchData.status ||
                !Array.isArray(
                    searchData.result
                ) ||
                searchData.result.length === 0
            ) {

                return m.reply(
                    '❌ No se encontraron resultados.'
                )

            }

            const first =
                searchData.result[0]


            const second =
                searchData.result[1]


            let resultText =
                '╭━━━〔 🎵 RESULTADOS 〕━━━⬣\n\n'


            resultText +=
                `1️⃣ *${first.title}*\n` +
                `👤 ${first.autor || 'Desconocido'}\n` +
                `⏱️ ${first.duration || 'Desconocida'}\n` +
                `👀 ${first.views || 'Desconocidas'}\n\n`


            if (
                second
            ) {

                resultText +=
                    `2️⃣ *${second.title}*\n` +
                    `👤 ${second.autor || 'Desconocido'}\n` +
                    `⏱️ ${second.duration || 'Desconocida'}\n` +
                    `👀 ${second.views || 'Desconocidas'}\n\n`

            }


            resultText +=
                `🌐 API: ${
                    apiNumber === 1
                        ? 'EvoGB'
                        : 'StellarWA'
                }\n\n` +

                `📌 Para elegir:\n` +

                `.play ${query} 1\n` +

                `.play ${query} 2\n\n` +

                `⚠️ La selección de API se hace así:\n` +

                `.play ${query}, 1\n` +

                `.play ${query}, 2\n` +

                '╰━━━━━━━━━━━━━━━━━━⬣'

            const video =
                first


            await m.reply(
                '🎵 *Resultado encontrado*\n\n' +

                `📌 *Título:* ${
                    video.title
                }\n` +

                `👤 *Autor:* ${
                    video.autor ||
                    'Desconocido'
                }\n` +

                `⏱️ *Duración:* ${
                    video.duration ||
                    'Desconocida'
                }\n\n` +

                `🌐 *API:* ${
                    apiNumber === 1
                        ? 'EvoGB'
                        : 'StellarWA'
                }\n\n` +

                '⏳ Descargando audio...'
            )

            if (
                apiNumber === 1
            ) {

                const downloadUrl =
                    `${EVO_DOWNLOAD_API}` +
                    `?url=${encodeURIComponent(
                        video.url
                    )}` +
                    `&key=${EVO_KEY}`


                const downloadResponse =
                    await fetch(
                        downloadUrl
                    )


                if (
                    !downloadResponse.ok
                ) {

                    throw new Error(
                        `Error EvoGB HTTP ${
                            downloadResponse.status
                        }`
                    )

                }


                const downloadData =
                    await downloadResponse.json()


                if (
                    !downloadData.status ||
                    !downloadData.data ||
                    !downloadData.data.dl
                ) {

                    throw new Error(
                        'EvoGB no devolvió el audio'
                    )

                }


                const data =
                    downloadData.data


                await conn.sendMessage(

                    m.chat,

                    {

                        audio: {
                            url:
                                data.dl
                        },

                        mimetype:
                            'audio/mpeg',

                        fileName:
                            `${sanitizeFileName(
                                data.title ||
                                video.title
                            )}.mp3`,

                        ptt:
                            false

                    },

                    {

                        quoted:
                            m

                    }

                )

            }
            
            else {

                const downloadUrl =
                    `${STELLAR_DOWNLOAD_API}` +
                    `?url=${encodeURIComponent(
                        video.url
                    )}` +
                    `&key=${STELLAR_KEY}`


                const downloadResponse =
                    await fetch(
                        downloadUrl
                    )


                if (
                    !downloadResponse.ok
                ) {

                    throw new Error(
                        `Error StellarWA HTTP ${
                            downloadResponse.status
                        }`
                    )

                }


                const downloadData =
                    await downloadResponse.json()


                if (
                    !downloadData.status ||
                    !downloadData.data ||
                    !downloadData.data.dl
                ) {

                    throw new Error(
                        'StellarWA no devolvió el audio'
                    )

                }


                const data =
                    downloadData.data


                await conn.sendMessage(

                    m.chat,

                    {

                        audio: {
                            url:
                                data.dl
                        },

                        mimetype:
                            'audio/mpeg',

                        fileName:
                            `${sanitizeFileName(
                                data.title ||
                                video.title
                            )}.mp3`,

                        ptt:
                            false

                    },

                    {

                        quoted:
                            m

                    }

                )

            }

            return m.reply(

                '✅ *AUDIO ENVIADO CORRECTAMENTE*\n\n' +

                `🎵 ${
                    video.title
                }\n\n` +

                `🌐 API utilizada: ${
                    apiNumber === 1
                        ? 'EvoGB'
                        : 'StellarWA'
                }`

            )


        } catch (
            error
        ) {


            console.error(
                '❌ Error en play:',
                error
            )


            return m.reply(

                '❌ Ocurrió un error al buscar o descargar el audio.\n\n' +

                `📄 ${
                    error instanceof Error
                        ? error.message
                        : 'Error desconocido'
                }`

            )

        }

    }

}

function sanitizeFileName(
    input
) {

    return String(
        input ||
        'audio'
    )

        .replace(
            /[<>:"/\\|?*\u0000-\u001f]/g,
            ''
        )

        .replace(
            /\s+/g,
            ' '
        )

        .trim()

        .slice(
            0,
            100
        ) ||

        'audio'

                  }
