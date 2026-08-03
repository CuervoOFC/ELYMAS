/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/subbots/code.js
ʚĭɞ ೃ funcion :: generar codigo para vinculacion de subbot con limpieza previa de sesion
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import fs from 'fs'
import path from 'path'
import {
    initializeSubBot,
    stopSubBot,
    createSubBotDirectory
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

        await m.reply(
            '⏳ Preparando el subbot...\n\n' +
            'Espera unos segundos mientras se genera el código.'
        )

        try {
            // 1. Intentar detener cualquier proceso activo o colgado
            await stopSubBot(jid)

            // 2. Limpiar las credenciales antiguas si la sesión dio error 401 (Unauthenticated)
            const subbotFolder = createSubBotDirectory(jid)
            if (fs.existsSync(subbotFolder)) {
                try {
                    fs.rmSync(subbotFolder, { recursive: true, force: true })
                } catch (e) {
                    console.error('Error al limpiar carpeta de subbot:', e)
                }
            }

            // 3. Inicializar nuevamente generando el código
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
                `5️⃣ Selecciona *Vincular con el número de teléfono*\n` +
                `6️⃣ Introduce el código anterior\n\n` +
                `⚠️ El código puede tardar unos segundos en funcionar.`
            )

        } catch (error) {
            console.error('❌ Error en code:', error)
            return m.reply('❌ Ocurrió un error generando el código.')
        }
    }
}
