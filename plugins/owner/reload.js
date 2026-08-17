/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/owner/reload.js
ʚĭɞ ೃ funcion :: Recargar plugins e iniciar reinicio en Pterodactyl Panel
──────✧✦✧──────
*/

import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import config from '../../config.js'

const PLUGINS_DIR = path.resolve('./plugins')

function extractPureNumber(target) {
    if (!target) return ''
    return String(target)
        .split('@')[0]
        .split(':')[0]
        .replace(/[^0-9]/g, '')
}

function getAllPluginFiles(dir) {
    let results = []
    const list = fs.readdirSync(dir)

    for (const file of list) {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllPluginFiles(fullPath))
        } else if (file.endsWith('.js')) {
            results.push(fullPath)
        }
    }
    return results
}

export default {
    command: ['reload', 'recargar', 'r'],

    async run(m, { conn }) {
        const senderJid = m?.sender || m?.key?.participant || m?.key?.remoteJid || ''
        const senderNum = extractPureNumber(senderJid)

        const isMainOwner =
            Array.isArray(config?.owners) &&
            config.owners.some(owner => extractPureNumber(owner) === senderNum)

        if (!isMainOwner) {
            return m.reply('🚫 Este comando solo puede ser usado por el *Owner Global*.')
        }

        await m.reply('🔄 *Iniciando recarga de plugins y comprobación de archivos...*')

        try {
            const pluginFiles = getAllPluginFiles(PLUGINS_DIR)
            let loadedCount = 0
            let errorCount = 0

            for (const filePath of pluginFiles) {
                try {
                    const fileUrl = `${pathToFileURL(filePath).href}?v=${Date.now()}`
                    await import(fileUrl)
                    loadedCount++
                } catch (e) {
                    errorCount++
                    console.error(`❌ Error cargando plugin ${filePath}:`, e)
                }
            }

            await m.reply(
                `📊 *RECARGA COMPLETADA*\n\n` +
                `✅ Plugins verificados/recargados: *${loadedCount}*\n` +
                `❌ Errores detectados: *${errorCount}*\n\n` +
                `♻️ *Reiniciando el panel Pterodactyl...*\n` +
                `_El bot estará de vuelta en unos segundos._`
            )

            setTimeout(() => {
                process.exit(0)
            }, 2000)

        } catch (error) {
            console.error('Error en comando reload:', error)
            return m.reply('❌ Ocurrió un error crítico durante la recarga de plugins.')
        }
    }
}
