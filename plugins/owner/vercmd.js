/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/owner/vercmd.js
ʚĭɞ ೃ funcion :: Ver el codigo fuente de un comando
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
    command: ['vercmd', 'cmd', 'vercodigo'],

    async run(m, { conn, args }) {
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
            return m.reply('⚠️ Especifica el nombre del comando. Ejemplo: `.vercmd kick`')
        }

        const filePath = findPluginFile(cmdName)

        if (!filePath) {
            return m.reply(`❌ No se encontró ningún archivo asociado al comando *${cmdName}*.`)
        }

        try {
            const code = fs.readFileSync(filePath, 'utf-8')
            const relativePath = filePath.replace(process.cwd(), '')

            const response = 
                `📂 *ARCHIVO:* \`${relativePath}\`\n\n` +
                `\`\`\`javascript\n` +
                `${code}\n` +
                `\`\`\``

            return await conn.sendMessage(m.chat, { text: response }, { quoted: m })
        } catch (error) {
            console.error(error)
            return m.reply('❌ Ocurrió un error al intentar leer el archivo.')
        }
    }
}
