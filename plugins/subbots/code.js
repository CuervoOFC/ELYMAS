•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/subbots/code.js
ʚĭɞ ೃ funcion :: generar codigo para vinculacion de subbot
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import {
    initializeSubBot,
    getSubBot
} from '../../lib/subbots.js'

export default {
    command: [
        'code',
        'codigo',
        'código'
    ],

    async run(m, { args }) {

        const numero = args
            ?.join('')
            ?.replace(/[^0-9]/g, '')

        if (!numero) {
            return m.reply(
                '❌ Debes ingresar el número del teléfono.\n\n' +
                'Ejemplo:\n' +
                '.code 521XXXXXXXXXX'
            )
        }

        const jid = `${numero}@s.whatsapp.net`

        const existing = getSubBot(jid)

        if (existing && existing.connected) {
            return m.reply('⚠️ Este número ya tiene un subbot conectado.')
        }

        await m.reply(
            '⏳ Preparando el subbot...\n\n' +
            'Espera unos segundos mientras se genera el código.'
        )

        try {

            const result = await initializeSubBot(
                jid,
                {
                    generatePairingCode: true,
                    phoneNumber: numero,
                    subbotOwner: m.sender
                }
            )

            if (!result || !result.pairingCode) {
                return m.reply(
                    '❌ No se pudo generar el código de vinculación.\n\n' +
                    'Intenta nuevamente en unos segundos.'
                )
            }

            return m.reply(
                `🔐 *CÓDIGO DE VINCULACIÓN*\n\n` +
                `*${result.pairingCode}*\n\n` +
                `📱 En el teléfono *${numero}* realiza lo siguiente:\n\n` +
                `1️⃣ Abre WhatsApp\n` +
                `2️⃣ Ve a *Ajustes*\n` +
                `3️⃣ Entra en *Dispositivos vinculados*\n` +
                `4️⃣ Pulsa *Vincular un dispositivo*\n` +
                `5️⃣ Selecciona *Vincular con número de teléfono*\n` +
                `6️⃣ Introduce el código anterior\n\n` +
                `⚠️ El código puede tardar unos segundos en funcionar.`
            )

        } catch (error) {
            console.error('❌ Error en code:', error)
            return m.reply('❌ Ocurrió un error generando el código.')
        }
    }
}
