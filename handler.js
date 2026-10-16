
/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es
Exclusivo Y Unico Para Este Bot Al
Clonar O Copiar Dejar Estos Creditos
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
CODIGO JAVASCRIPT
codigo :: handler.js
funcion :: obtencion de plugins, manejo de before(), baneo y comandos
──────✧✦✧──────
*/

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import config from './config.js'
import { getUser } from './lib/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginsPath = path.join(__dirname, 'plugins')

global.plugins = global.plugins || {}

function getAllFiles(directory) {
    const files = []

    if (!fs.existsSync(directory)) return files

    for (const item of fs.readdirSync(directory)) {
        const fullPath = path.join(directory, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            files.push(...getAllFiles(fullPath))
        } else {
            files.push(fullPath)
        }
    }

    return files
}

export async function loadPlugins() {
    if (!fs.existsSync(pluginsPath)) {
        fs.mkdirSync(pluginsPath, { recursive: true })
    }

    const files = getAllFiles(pluginsPath)
    let loaded = 0

    for (const file of files) {
        if (!file.endsWith('.js')) continue

        try {
            const fileUrl = pathToFileURL(file).href
            const imported = await import(`${fileUrl}?update=${Date.now()}`)
            const plugin = imported.default || imported
            const pluginName = path.relative(pluginsPath, file)

            global.plugins[pluginName] = plugin
            loaded++
        } catch (error) {
            console.error(`❌ Error cargando plugin: ${file}`, error)
        }
    }

    console.log(`✅ Plugins cargados: ${loaded}`)
}

function getMessageText(m) {
    const message = m.message
    if (!message) return ''

    if (message.conversation) return message.conversation

    if (message.extendedTextMessage) {
        return message.extendedTextMessage.text || ''
    }

    if (message.imageMessage) {
        return message.imageMessage.caption || ''
    }

    if (message.videoMessage) {
        return message.videoMessage.caption || ''
    }

    if (message.documentMessage) {
        return message.documentMessage.caption || ''
    }

    if (message.buttonsResponseMessage) {
        return message.buttonsResponseMessage.selectedButtonId || ''
    }

    if (message.listResponseMessage) {
        return message.listResponseMessage
            .singleSelectReply?.selectedRowId || ''
    }

    if (message.templateButtonReplyMessage) {
        return message.templateButtonReplyMessage.selectedId || ''
    }

    if (message.interactiveResponseMessage) {
        try {
            const params = JSON.parse(
                message.interactiveResponseMessage
                    ?.nativeFlowResponseMessage?.paramsJson || '{}'
            )

            return params.id || params.selectedId || ''
        } catch {
            return ''
        }
    }

    return ''
}

/*
 * Busca el documento dentro de los formatos de mensaje
 * citados y envueltos que puede entregar WhatsApp.
 */
function findDocumentMessage(message) {
    if (!message) return null

    if (message.documentMessage) {
        return message.documentMessage
    }

    const wrappers = [
        'ephemeralMessage',
        'viewOnceMessage',
        'viewOnceMessageV2',
        'documentWithCaptionMessage'
    ]

    for (const wrapper of wrappers) {
        const inner = message[wrapper]?.message
        if (!inner) continue

        const document = findDocumentMessage(inner)
        if (document) return document
    }

    return null
}

function getQuotedMessage(m) {
    const contextInfo =
        m.message?.extendedTextMessage?.contextInfo ||
        m.message?.imageMessage?.contextInfo ||
        m.message?.videoMessage?.contextInfo ||
        m.message?.documentMessage?.contextInfo ||
        m.message?.stickerMessage?.contextInfo

    if (!contextInfo?.quotedMessage) return null

    const quotedMessage = contextInfo.quotedMessage
    const document = findDocumentMessage(quotedMessage)

    return {
        key: {
            remoteJid: m.chat,
            fromMe: false,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant
        },

        // Mensaje original citado: necesario para descargar multimedia.
        message: quotedMessage,

        // Metadatos del documento, si se trata de un archivo.
        fileName: document?.fileName || '',
        mimetype: document?.mimetype || '',
        msg: document || null
    }
}

function normalizeMessage(conn, message) {
    const m = message

    m.id = m.key?.id
    m.chat = m.key?.remoteJid
    m.sender = m.key?.participant || m.key?.remoteJid
    m.fromMe = Boolean(m.key?.fromMe)
    m.text = getMessageText(m)
    m.quoted = getQuotedMessage(m)
    m.isGroup = Boolean(m.chat?.endsWith('@g.us'))
    m.isMainBot = Boolean(conn.isMainBot)
    m.isSubBot = !m.isMainBot

    m.reply = async (text, options = {}) => {
        return conn.sendMessage(
            m.chat,
            { text: String(text), ...options },
            { quoted: m }
        )
    }

    m.send = async (content, options = {}) => {
        return conn.sendMessage(
            m.chat,
            content,
            { quoted: m, ...options }
        )
    }

    m.react = async (emoji) => {
        return conn.sendMessage(m.chat, {
            react: {
                text: emoji,
                key: m.key
            }
        })
    }

    return m
}

function getPrefix(text) {
    const prefixes = config.prefixes || ['.', '#', '/', '!']

    for (const prefix of prefixes) {
        if (text.startsWith(prefix)) return prefix
    }

    return ''
}

export default async function handler(conn, message) {
    try {
        const m = normalizeMessage(conn, message)

        if (!m.chat) return

        const used = {
            conn,
            sock: conn,
            m,
            message,
            isMainBot: m.isMainBot,
            isSubBot: m.isSubBot
        }

        // 1. Eventos preventivos y generales.
        for (const [, plugin] of Object.entries(global.plugins)) {
            if (!plugin || plugin.disabled) continue

            if (typeof plugin.before === 'function') {
                try {
                    await plugin.before(m, used)
                } catch (error) {
                    console.error(
                        '❌ Error ejecutando plugin.before:',
                        error
                    )
                }
            }

            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all(m, used)
                } catch (error) {
                    console.error(
                        '❌ Error ejecutando plugin.all:',
                        error
                    )
                }
            }
        }

        // Los eventos anteriores también se ejecutan para multimedia.
        if (!m.text) return

        const text = m.text.trim()
        if (!text) return

        const prefix = getPrefix(text)

        // Solo se ejecutan comandos con prefijo.
        if (!prefix) return

        const body = text.slice(prefix.length).trim()
        if (!body) return

        const parts = body.split(/\s+/)
        const command = parts.shift().toLowerCase()
        const args = parts
        const textArgs = args.join(' ')

        used.args = args
        used.text = textArgs
        used.command = command
        used.usedPrefix = prefix
        used.prefix = prefix

        // 2. Verificación de usuario bloqueado.
        const user = getUser(m.sender)

        if (user && user.banned) {
            return m.reply(
                '🚫 *USUARIO BLOQUEADO*\n\n' +
                'Has sido baneado y no tienes permitido usar comandos en este bot.'
            )
        }

        // 3. Ejecución de comandos.
        for (const [, plugin] of Object.entries(global.plugins)) {
            if (!plugin || plugin.disabled || !plugin.command) continue

            const commands = Array.isArray(plugin.command)
                ? plugin.command
                : [plugin.command]

            const found = commands.some(
                cmd => String(cmd).toLowerCase() === command
            )

            if (!found) continue

            if (plugin.onlyMainBot && m.isSubBot) {
                return m.reply(
                    '❌ Este comando solo puede utilizarse en el bot principal.'
                )
            }

            if (plugin.onlySubBot && m.isMainBot) {
                return m.reply(
                    '❌ Este comando solo puede utilizarse en un subbot.'
                )
            }

            if (typeof plugin.run === 'function') {
                await plugin.run(m, used)
            }

            return
        }
    } catch (error) {
        console.error('❌ Error en handler:', error)
    }
}
