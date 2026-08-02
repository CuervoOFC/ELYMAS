/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/general/menu.js
ʚĭɞ ೃ funcion :: menu dinamico con lectura automatica de plugins
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import fs from 'fs'
import path from 'path'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

// Función para mapear iconos según el nombre de la carpeta
function getCategoryIcon(category) {
    const icons = {
        'general': '⚙️',
        'convertidores': '🖼️',
        'descargas': '📥',
        'grupos': '👥',
        'subbots': '🤖',
        'owner': '👑',
        'economia': '💰',
        'juegos': '🎮',
        'herramientas': '🛠️'
    }
    return icons[category.toLowerCase()] || '📁'
}

export default {
    command: ['menu', 'menú', 'help', 'inicio'],

    async run(m, { conn, usedPrefix = '.' }) {
        const nombre = m.pushName || 'Usuario'
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)

        const botName = botData.name || config.botName || 'Cuervo'
        const ownerName = botData.ownerName || config.ownerName || 'TheDevil'
        const botImage = botData.image

        // Ruta de la carpeta plugins
        const pluginsDir = path.join(process.cwd(), 'plugins')
        const categories = {}

        // Lectura dinámica de carpetas y comandos
        try {
            const folders = fs.readdirSync(pluginsDir)

            for (const folder of folders) {
                const folderPath = path.join(pluginsDir, folder)
                
                if (fs.statSync(folderPath).isDirectory()) {
                    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'))

                    for (const file of files) {
                        const filePath = path.join(folderPath, file)
                        try {
                            // Importar plugin para extraer sus comandos
                            const pluginModule = await import(`file://${filePath}`)
                            const plugin = pluginModule.default || pluginModule

                            if (plugin && plugin.command) {
                                if (!categories[folder]) {
                                    categories[folder] = []
                                }

                                // Si 'command' es un Array tomamos el primero, si es String lo usamos directo
                                const mainCmd = Array.isArray(plugin.command) ? plugin.command[0] : plugin.command
                                if (mainCmd) {
                                    categories[folder].push(mainCmd)
                                }
                            }
                        } catch (e) {
                            // En caso de que un plugin tenga error sintáctico, lo salta sin romper el menú
                            console.error(`Error al cargar el plugin ${file} para el menú:`, e)
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error al leer el directorio de plugins:', e)
        }

        // Construir encabezado
        let menuText = `╭━━━━━━━━━━━━━━━━━━╮\n`
        menuText += `┃ *${botName.toUpperCase()}*\n`
        menuText += `╰━━━━━━━━━━━━━━━━━━╯\n\n`
        menuText += `👋 Hola, *${nombre}*\n\n`
        menuText += `╭─〔 🤖 INFORMACIÓN 〕\n`
        menuText += `│ ⚡ Bot: ${botName}\n`
        menuText += `│ 👑 Owner: ${ownerName}\n`
        menuText += `│ 🔧 Versión: ${config.version || '1.0.0'}\n`
        menuText += `╰──────────────\n\n`

        // Construir secciones dinámicamente según las carpetas
        for (const [category, commands] of Object.entries(categories)) {
            if (commands.length === 0) continue

            const icon = getCategoryIcon(category)
            const catName = category.toUpperCase()

            menuText += `╭─〔 ${icon} ${catName} 〕\n`
            for (const cmd of commands) {
                menuText += `│ • ${usedPrefix}${cmd}\n`
            }
            menuText += `╰──────────────\n\n`
        }

        menuText += ` *${botName.toUpperCase()}*`

        // Envío de respuesta (con o sin imagen)
        if (botImage) {
            await conn.sendMessage(m.chat, {
                image: { url: botImage },
                caption: menuText
            }, { quoted: m })
        } else {
            await m.reply(menuText)
        }
    }
}
