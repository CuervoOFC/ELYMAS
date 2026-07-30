/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/descargas/ytmp3.js
ʚĭɞ ೃ funcion :: descarga audio de youtube
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


const API =
    'https://api.delirius.store/download/ytmp3'

export default {

    command: [
        'ytmp3',
        'mp3'
    ],

    async run(
        m,
        {
            conn,
            args
        }
    ) {

        if (
            !args.length
        ) {

            return m.reply(

                '╭─「 🎵 *YTMP3* 」\n' +

                '│\n' +

                '│ ✦ Descargar audio de YouTube\n' +

                '│\n' +

                '│ 📌 Uso:\n' +

                '│ .ytmp3 <url>\n' +

                '│\n' +

                '│ Ejemplo:\n' +

                '│ .ytmp3 https://youtu.be/xxxx\n' +

                '╰──────────────'

            )

        }


        const url =
            args[0]


        if (

            !url.includes(
                'youtube.com'
            ) &&

            !url.includes(
                'youtu.be'
            )

        ) {

            return m.reply(
                '❌ Debes enviar un enlace válido de YouTube.'
            )

        }

        await m.reply(
            '🎧 Descargando audio...'
        )


        try {

            const response =
                await fetch(

                    `${API}?url=${encodeURIComponent(
                        url
                    )}`

                )


            if (
                !response.ok
            ) {

                throw new Error(
                    `HTTP ${response.status}`
                )

            }


            const result =
                await response.json()


            if (

                !result.status ||

                !result.data ||

                !result.data.download

            ) {

                return m.reply(
                    '❌ No se pudo obtener el audio.'
                )

            }

            if (
                result.data.image
            ) {

                await conn.sendMessage(

                    m.chat,

                    {

                        image: {

                            url:
                                result.data.image

                        },

                        caption:

                            '╭━━━〔 🎵 YTMP3 〕━━━⬣\n' +

                            `┃ 🎵 ${result.data.title}\n` +

                            `┃ 👤 ${result.data.author}\n` +

                            `┃ 📺 ${result.data.channel}\n` +

                            `┃ 👀 ${result.data.views}\n` +

                            `╰━━━━━━━━━━━━━━━━━━⬣`

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

                    audio: {

                        url:
                            result.data.download

                    },

                    mimetype:
                        'audio/mpeg',

                    fileName:
                        `${sanitizeFileName(
                            result.data.title
                        )}.mp3`,

                    ptt:
                        false

                },

                {

                    quoted:
                        m

                }

            )

            return m.reply(

                '✅ *AUDIO ENVIADO*\n\n' +

                `🎵 ${result.data.title}`

            )


        } catch (
            error
        ) {

            console.error(
                'Error YTMP3:',
                error
            )


            return m.reply(

                '❌ Error al descargar el audio.\n\n' +

                `${error.message || error}`

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
