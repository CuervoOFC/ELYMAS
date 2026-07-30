/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/descargas/play2.js
ʚĭɞ ೃ funcion :: descarga de youtube en mp4
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
    'https://api.evogb.org/dl/ytmp4'


const STELLAR_DOWNLOAD_API =
    'https://api.stellarwa.xyz/dl/ytmp4'


export default {

    command: [
        'play2',
        'playvideo'
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
                '╭─「 🎬 *YOUTUBE MP4* 」\n' +
                '│\n' +
                '│ ❌ Escribe el nombre del video.\n' +
                '│\n' +
                '│ 📌 Ejemplos:\n' +
                '│ .play2 nombre del video, 1\n' +
                '│ .play2 nombre del video, 2\n' +
                '│\n' +
                '│ 1️⃣ EvoGB\n' +
                '│ 2️⃣ StellarWA\n' +
                '╰──────────────'
            )

        }

        const fullText =
            args.join(' ')

        let apiNumber =
            1


        let query =
            fullText


        const apiMatch =
            fullText.match(
                /,\s*([12])\s*$/
            )


        if (
            apiMatch
        ) {

            apiNumber =
                Number(
                    apiMatch[1]
                )


            query =
                fullText
                    .replace(
                        /,\s*[12]\s*$/,
                        ''
                    )
                    .trim()

        }


        if (
            !query
        ) {

            return m.reply(
                '❌ Escribe el nombre del video.'
            )

        }

        const apiName =
            apiNumber === 2
                ? 'StellarWA'
                : 'EvoGB'


        await m.reply(

            `🔎 Buscando video en YouTube:\n\n` +

            `🎬 *${query}*\n` +

            `⚙️ API: *${apiName}*`

        )


        try {

            let video

            if (

                query.includes(
                    'youtube.com'
                ) ||

                query.includes(
                    'youtu.be'
                )

            ) {

                video = {

                    title:
                        'Video de YouTube',

                    autor:
                        'YouTube',

                    duration:
                        '',

                    views:
                        '',

                    banner:
                        '',

                    url:
                        query

                }

            }

            else {

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
                        `Error HTTP ${response.status}`
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
                        '❌ No se encontraron videos.'
                    )

                }

                video =
                    searchData.result[0]


            }

            await m.reply(

                '🎬 *Video encontrado*\n\n' +

                `📌 *Título:* ${
                    video.title ||
                    'Desconocido'
                }\n` +

                `👤 *Autor:* ${
                    video.autor ||
                    'Desconocido'
                }\n` +

                `⏱️ *Duración:* ${
                    video.duration ||
                    'Desconocida'
                }\n` +

                `👀 *Vistas:* ${
                    video.views ||
                    'Desconocidas'
                }\n\n` +

                `⚙️ *API:* ${apiName}\n\n` +

                '⏳ Descargando video...'

            )

            let downloadUrl


            if (
                apiNumber === 2
            ) {

                downloadUrl =

                    `${STELLAR_DOWNLOAD_API}` +

                    `?url=${encodeURIComponent(
                        video.url
                    )}` +

                    `&quality=auto` +

                    `&key=${STELLAR_KEY}`

            }

            else {

                downloadUrl =

                    `${EVO_DOWNLOAD_API}` +

                    `?url=${encodeURIComponent(
                        video.url
                    )}` +

                    `&quality=auto` +

                    `&key=${EVO_KEY}`

            }

            const downloadResponse =
                await fetch(
                    downloadUrl
                )


            if (
                !downloadResponse.ok
            ) {

                throw new Error(

                    `Error HTTP en ${apiName}: ` +

                    downloadResponse.status

                )

            }


            const downloadData =
                await downloadResponse.json()


            if (

                !downloadData.status ||

                !downloadData.data ||

                !downloadData.data.dl

            ) {

                return m.reply(

                    `❌ ${apiName} no pudo obtener el video.`

                )

            }


            const data =
                downloadData.data


            const title =
                data.title ||

                video.title ||

                'video'

            if (

                data.thumbnail

            ) {

                await conn.sendMessage(

                    m.chat,

                    {

                        image: {

                            url:
                                data.thumbnail

                        },


                        caption:

                            '╭━━━〔 🎬 MP4 DOWNLOADER 〕━━━⬣\n' +

                            `┃ 🎵 Título: ${
                                title
                            }\n` +

                            `┃ 🎥 Calidad: ${
                                data.quality ||
                                'Auto'
                            }\n` +

                            `┃ 📦 Formato: MP4\n` +

                            `┃ ⚙️ API: ${
                                apiName
                            }\n` +

                            '╰━━━━━━━━━━━━━━━━━━⬣'

                    },


                    {

                        quoted:
                            m

                    }

                )

            }

            await conn.sendMessage(

                m.chat,

                {

                    video: {

                        url:
                            data.dl

                    },


                    mimetype:
                        'video/mp4',


                    fileName:

                        `${sanitizeFileName(
                            title
                        )}.mp4`,


                    caption:

                        `🎬 ${
                            title
                        }\n\n` +

                        `🎥 Calidad: ${
                            data.quality ||
                            'Auto'
                        }\n` +

                        `⚙️ API: ${
                            apiName
                        }`

                },


                {

                    quoted:
                        m

                }

            )

            return m.reply(

                '✅ *VIDEO ENVIADO CORRECTAMENTE*\n\n' +

                `🎬 ${
                    title
                }\n` +

                `🎥 ${
                    data.quality ||
                    'Auto'
                }\n` +

                `⚙️ API: ${
                    apiName
                }`

            )


        }

        catch (

            error

        ) {

            console.error(

                `❌ Error en play2 usando ${apiName}:`,

                error

            )


            return m.reply(

                '❌ Ocurrió un error al buscar o descargar el video.\n\n' +

                `📄 ${
                    error?.message ||
                    'Error desconocido'
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

        'video'

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

        'video'

}
