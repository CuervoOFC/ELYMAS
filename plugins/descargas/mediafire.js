/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/descargas/mediafire.js
ʚĭɞ funcion :: Descargador de archivos de MediaFire (APKs, ZIPs, Docs, etc.)
ʚĭɞ estado :: completo
──────✧✦✧──────
*/

import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const KEY_EVOGB = 'CuervoOFC'
const KEY_STELLAR = 'CuervoOFC'

export default {
    command: ['mediafire', 'mediafiredl', 'mf', 'mfdl'],

    async run(m, { conn, args }) {
        const text = args.join(' ')

        if (!text) {
            return m.reply(
                '╭─「 📦 *MEDIAFIRE DOWNLOADER* 」\n' +
                '│\n' +
                '│ ❌ Ingresa un enlace válido de MediaFire.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:*\n' +
                '│ • `.mf https://www.mediafire.com/file/xxxxxxxxxxxxx`\n' +
                '╰──────────────'
            )
        }

        if (!text.includes('mediafire.com')) {
            return m.reply('❌ El enlace ingresado no parece ser de MediaFire.')
        }

        await m.reply('⏳ *Obteniendo información del archivo de MediaFire...*')

        let name, size, dl, mimeType

        try {
            const res = await fetch(`https://api.evogb.org/dl/mediafire?url=${encodeURIComponent(text)}&key=${KEY_EVOGB}`)
            if (res.ok) {
                const json = await res.json()
                if (json.status && json.data) {
                    name = json.data.name || 'archivo'
                    size = json.data.size || 'Desconocido'
                    dl = json.data.dl
                }
            }
        } catch (e) {
            console.error('Fallo API EvoGB MediaFire, intentando respaldo...', e)
        }

        if (!dl) {
            try {
                const res = await fetch(`https://api.stellarwa.xyz/dl/mediafire?url=${encodeURIComponent(text)}&key=${KEY_STELLAR}`)
                if (res.ok) {
                    const json = await res.json()
                    if (json.status && json.result) {
                        name = json.result.filename || 'archivo'
                        size = json.result.filesize || 'Desconocido'
                        dl = json.result.download
                        mimeType = json.result.mimetype
                    }
                }
            } catch (e) {
                console.error('Fallo API Stellar MediaFire...', e)
            }
        }

        if (!dl) {
            return m.reply('❌ No se pudo extraer la descarga del enlace de MediaFire. Intenta nuevamente más tarde.')
        }

        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const infoMsg = 
            `╭─「 📁 *MEDIAFIRE* 」\n` +
            `│ 📄 *Nombre:* ${name}\n` +
            `│ ⚖️ *Tamaño:* ${size}\n` +
            `│ 🤖 *Bot:* ${botName}\n` +
            `╰──────────────\n\n` +
            `⏳ *Enviando archivo, por favor espera...*`

        await m.reply(infoMsg)

        try {
            let filename = name
            if (!filename.includes('.')) {
                filename += '.zip'
            }

            await conn.sendMessage(
                m.chat,
                {
                    document: { url: dl },
                    fileName: filename,
                    mimetype: mimeType || 'application/octet-stream'
                },
                { quoted: m }
            )

        } catch (error) {
            console.error('❌ Error enviando archivo de MediaFire:', error)
            return m.reply(
                '❌ El archivo es demasiado pesado o hubo un problema al transferirlo.\n\n' +
                `🔗 *Link de descarga directa:* ${dl}`
            )
        }
    }
}
