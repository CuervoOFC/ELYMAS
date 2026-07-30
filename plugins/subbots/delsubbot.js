/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/subbots/delsubbot.js
ʚĭɞ ೃ funcion :: comando para el owner principal borrar subbots
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import fs from 'fs'
import path from 'path'
import config from '../../config.js'

function extractPureNumber(target) {
    if (!target) return ''
    return String(target).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
}

export default {
    command: ['delsubbot', 'deletebot', 'deletesubbot', 'delsessions'],

    async run(m, { conn, text, args }) {
        const senderJid = m?.sender || m?.key?.participant || m?.key?.remoteJid || ''
        const senderNum = extractPureNumber(senderJid)

        const isMainOwner = Array.isArray(config?.owners) && config.owners.some(
            owner => extractPureNumber(owner) === senderNum
        )

        if (!isMainOwner) {
            return m.reply('🚫 Este comando es exclusivo para el **Owner Global** del bot principal.')
        }

        let targetNumber = ''

        if (m.quoted && m.quoted.sender) {
            targetNumber = extractPureNumber(m.quoted.sender)
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetNumber = extractPureNumber(m.mentionedJid[0])
        } else if (text) {
            targetNumber = extractPureNumber(text)
        }

        if (!targetNumber || targetNumber.length < 10) {
            return m.reply(
                '❌ Debes especificar el número del subbot a eliminar.\n\n' +
                'Ejemplo:\n' +
                '• `.delsubbot 521XXXXXXXXXX`\n' +
                '• Responder al mensaje del subbot con `.delsubbot`\n' +
                '• Mencionar al subbot con `.delsubbot @subbot`'
            )
        }

        const botFolder = path.join(config.subbots.folder || './database/subbots', targetNumber)
        const configFile = './database/subbots_config.json'

        let report = `🗑️ *ELIMINANDO SUBBOT (${targetNumber})*\n\n`

        try {
            
            if (fs.existsSync(botFolder)) {
                fs.rmSync(botFolder, { recursive: true, force: true })
                report += '✅ Carpeta de sesión eliminada de la base de datos.\n'
            } else {
                report += '⚠️ No se encontró la carpeta de sesión física para este número.\n'
            }

            if (fs.existsSync(configFile)) {
                const subbotsConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'))
                
                if (subbotsConfig[targetNumber]) {
                    delete subbotsConfig[targetNumber]
                    fs.writeFileSync(configFile, JSON.stringify(subbotsConfig, null, 2))
                    report += '✅ Configuración personalizada eliminada.\n'
                } else {
                    report += 'ℹ️ No tenía personalización en `subbots_config.json`.\n'
                }
            }

            report += '\n✨ La sesión corrupta/desconectada ha sido limpiada con éxito. El usuario ya puede volver a generar un nuevo `.code`.'
            return m.reply(report)

        } catch (error) {
            console.error('❌ Error al eliminar subbot:', error)
            return m.reply(`❌ Ocurrió un error al intentar borrar los datos del subbot:\n\`\`\`${error.message}\`\`\``)
        }
    }
}
