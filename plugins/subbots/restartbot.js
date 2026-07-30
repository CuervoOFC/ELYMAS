/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/subbots/restartbot.js
ʚĭɞ ೃ funcion :: reiniciar subbot
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import {
    restartSubBot,
    getSubBot,
    getActiveSubBot
} from '../../lib/subbots.js'

export default {

    command: [
        'restartbot',
        'reiniciarbot',
        'restartsubbot',
        'restart'
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
                '.restart 521XXXXXXXXXX'
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
            `${number}@s.whatsapp.net`

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


        await m.reply(
            '🔄 *REINICIANDO SUBBOT*\n\n' +
            `📱 Número: ${number}\n` +
            '⏳ Espera un momento...'
        )


        try {

            const restarted =
                await restartSubBot(
                    jid
                )


            if (
                !restarted
            ) {

                return m.reply(
                    '❌ No se pudo reiniciar el subbot.'
                )

            }


            return m.reply(
                '✅ *SUBBOT REINICIADO*\n\n' +
                `📱 Número: ${number}\n` +
                '🔄 La conexión está siendo iniciada nuevamente.'
            )


        } catch (
            error
        ) {

            console.error(
                '❌ Error reiniciando subbot:',
                error
            )


            return m.reply(
                '❌ Ocurrió un error al reiniciar el subbot.'
            )

        }

    }

}
