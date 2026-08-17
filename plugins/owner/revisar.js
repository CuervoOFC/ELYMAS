/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/owner/revisar.js
ʚĭɞ ೃ funcion :: Verifica errores de sintaxis o de importacion en un comando
──────✧✦✧──────
*/

import { pathToFileURL } from 'url'
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
    command: ['revisar', 'checkcmd', 'testcmd'],

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
            return m.reply('⚠️ Especifica el comando que deseas revisar. Ejemplo: `.revisar kick`')
        }

        const filePath = findPluginFile(cmdName)
        if (!filePath) {
            return m.reply(`❌ No se encontró ningún archivo para el comando *${cmdName}*.`)
        }

        try {
            const fileUrl = `${pathToFileURL(filePath).href}?v=${Date.now()}`
            const plugin = await import(fileUrl)

            if (!plugin.default || !plugin.default.command || typeof plugin.default.run !== 'function') {
                return m.reply('⚠️ El comando no tiene errores de sintaxis, pero le falta la estructura correcta (`command` o función `run`).')
            }

            return m.reply(
                `✅ *REVISIÓN COMPLETADA*\n\n` +
                `📌 *Comando:* \`.${cmdName}\`\n` +
                `✨ *Estado:* Sin errores de sintaxis detectados.`
            )

        } catch (error) {
            const stackLines = error.stack ? error.stack.split('\n') : []
            const errorDetail = stackLines.slice(0, 5).join('\n')

            return m.reply(
                `❌ *ERROR DETECTADO EN EL COMANDO*\n\n` +
                `📌 *Comando:* \`.${cmdName}\`\n` +
                `🚨 *Detalle:* ${error.message}\n\n` +
                `🔍 *Rastreador de Línea:* \n\`\`\`\n${errorDetail}\n\`\`\``
            )
        }
    }
}
