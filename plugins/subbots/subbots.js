/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/subbots/bots.js
ʚĭɞ funcion :: Listar todos los Subbots registrados y su estado
──────✧✦✧──────
*/

import { getAllSubBots } from '../../lib/subbots.js'

export default {
    command: ['bots', 'subbots', 'misbots'],

    async run(m) {
        const subbotsObject = getAllSubBots() || {}
        
        // Convertir el objeto de subbots a una lista de valores (Array)
        const botsList = Object.values(subbotsObject)

        if (botsList.length === 0) {
            return m.reply('🤖 No hay subbots registrados actualmente.')
        }

        let texto = `╭─「 🤖 *SUBBOTS REGISTRADOS* 」\n│\n`

        let contador = 1

        for (const bot of botsList) {
            // Verificar estado de conexión
            const isConnected = bot.connected || bot.status === 'connected'
            const status = isConnected ? '🟢 Conectado' : '🔴 Desconectado'
            
            // Limpiar el JID para mostrar solo el número limpio
            const cleanJid = bot.jid ? bot.jid.split('@')[0] : 'Desconocido'

            texto += `│ ${contador}. wa.me/${cleanJid}\n`
            texto += `│    └ Estado: ${status}\n`

            contador++
        }

        texto += `│\n╰──────────────`

        await m.reply(texto)
    }
}
