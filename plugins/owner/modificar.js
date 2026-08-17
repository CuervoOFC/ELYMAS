/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/owner/modificar.js
ʚĭɞ ೃ funcion :: Modificar el codigo de un comando existente
──────✧✦✧──────
*/

import fs from 'fs'
import config from '../../config.js'
import { findPluginFile } from '../../lib/cmdHelper.js'

function extractPureNumber(target) {
    if (!target) return ''
    return String(target)
        .split('@')[0]
        .split(':')[0]
        .replace(/[^0-9]/g, '')
}

export default {
    command: ['modificar', 'mod', 'editcmd'],

    async run(m, { conn, args, text }) {
        const senderJid = m?.sender || m?.key?.participant || m?.key?.remoteJid || ''
        const senderNum = extractPureNumber(senderJid)

        const isMainOwner =
            Array.isArray(config?.owners) &&
            config.owners.some(owner => extractPureNumber(owner) === senderNum)

        if (!isMainOwner) {
            return m.reply('🚫 Este comando solo puede ser usado por el *Owner Global*.')
        }

        const cmdName = args[0]?.toLowerCase().replace(/^[!#.]/, '')
        if (!cmdName) {
            return m.reply('⚠️ Especifica el comando que deseas modificar. Ejemplo: `.mod kick` (Respondiendo al nuevo código)')
        }

        const filePath = findPluginFile(cmdName)
        if (!filePath) {
            return m.reply(`❌ No se encontró ningún comando con el nombre *${cmdName}*.`)
        }

        let newCode = m.quoted ? m.quoted.text : text.replace(args[0], '').trim()

        if (newCode.startsWith('```javascript')) {
            newCode = newCode.replace(/^```javascript\n/, '').replace(/\n```$/, '')
        } else if (newCode.startsWith('```')) {
            newCode = newCode.replace(/^```\n/, '').replace(/\n```$/, '')
        }

        if (!newCode) {
            return m.reply('⚠️ Debes responder a un mensaje que contenga el nuevo código o escribirlo junto al comando.')
        }

        try {
            fs.writeFileSync(filePath, newCode, 'utf-8')
            const relativePath = filePath.replace(process.cwd(), '')

            return m.reply(
                `✅ *COMANDO MODIFICADO EXITOSAMENTE*\n\n` +
                `📌 *Comando:* \`.${cmdName}\`\n` +
                `📂 *Ruta:* \`${relativePath}\`\n\n` +
                `💡 _Los cambios se aplicarán en el siguiente reinicio o recarga de plugins._`
            )
        } catch (error) {
            console.error(error)
            return m.reply('❌ Error al escribir los cambios en el disco.')
        }
    }
}
