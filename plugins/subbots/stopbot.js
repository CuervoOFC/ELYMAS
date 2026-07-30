/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/subbots/stopbot.js
ʚĭɞ ೃ funcion :: apagar bot 
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import {
    stopSubBot,
    getSubBot,
    getActiveSubBot
} from '../../lib/subbots.js'

export default {

    command: [
        'stopbot',
        'stop',
        'pararbot'
    ],

    async run(
        m,
        {
            args
        }
    ) {

        if (
            !args ||
            !args.length
        ) {

            return m.reply(
                '❌ Debes indicar el número del subbot.\n\n' +
                '📌 Ejemplo:\n' +
                '.stop 521XXXXXXXXXX'
            )

        }

        const number =
            String(
                args[0]
            )
            .replace(
                /[^0-9]/g,
                ''
            )


        if (
            !number
        ) {

            return m.reply(
                '❌ Número inválido.'
            )

        }

        const jid =
            number.includes(
                '@s.whatsapp.net'
            )

                ? number

                : `${number}@s.whatsapp.net`

        const bot =
            getSubBot(
                jid
            )


        const activeBot =
            getActiveSubBot(
                jid
            )


        if (
            !bot &&
            !activeBot
        ) {

            return m.reply(
                '❌ No encontré un subbot con ese número.\n\n' +
                `📱 Número buscado: ${number}`
            )

        }

        try {

            const stopped =
                await stopSubBot(
                    jid
                )


            if (
                !stopped
            ) {

                return m.reply(
                    '⚠️ El subbot existe, pero actualmente no aparece como conectado.'
                )

            }


            return m.reply(
                '🛑 *SUBBOT DETENIDO*\n\n' +
                `📱 Número: ${number}\n` +
                '✅ La conexión del subbot fue cerrada correctamente.'
            )


        } catch (
            error
        ) {

            console.error(
                '❌ Error deteniendo subbot:',
                error
            )


            return m.reply(
                '❌ Ocurrió un error al detener el subbot.'
            )

        }

    }

}
