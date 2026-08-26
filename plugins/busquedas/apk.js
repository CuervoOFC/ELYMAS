/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ CODIGO JAVASCRIPT ʚĭɞ
ʚĭɞ codigo :: plugins/busquedas/apk.js
ʚĭɞ funcion :: Búsqueda y envío directo de archivos APK
──────✧✦✧──────
*/

const EVO_KEY = 'CuervoOFC'
const STELLAR_KEY = 'CuervoOFC'

const API_EVO = 'https://api.evogb.org/search/apk'
const API_STELLAR = 'https://api.stellarwa.xyz/search/apk'

async function fetchApkData(query) {
    const encodedQuery = encodeURIComponent(query)

    try {
        const res = await fetch(`${API_EVO}?query=${encodedQuery}&key=${EVO_KEY}`)
        if (res.ok) {
            const json = await res.json()
            if (json && json.status && json.data) {
                return json.data
            }
        }
    } catch (e) {
        console.error('⚠️ Error API EvoGB APK:', e.message)
    }
    try {
        const res = await fetch(`${API_STELLAR}?query=${encodedQuery}&key=${STELLAR_KEY}`)
        if (res.ok) {
            const json = await res.json()
            if (json && json.status && json.data) {
                return json.data
            }
        }
    } catch (e) {
        console.error('⚠️ Error API StellarWA APK:', e.message)
    }

    return null
}

export default {
    command: ['apk', 'apksearch', 'descargarapk', 'dapk'],

    async run(m, { conn, text, usedPrefix, command }) {
        if (!text) {
            return m.reply(
                `💡 *Uso del comando:*\n` +
                `• \`${usedPrefix + command} <nombre de la app>\`\n\n` +
                `*Ejemplo:* \`${usedPrefix + command} MediaFire\``
            )
        }

        await m.reply('🔍 *Buscando aplicación, por favor espera...*')

        try {
            const apk = await fetchApkData(text)

            if (!apk || !apk.dl) {
                return m.reply(`❌ No se encontraron resultados para: *${text}*`)
            }

            const fileName = `${apk.name || 'Aplicacion'}.apk`

            const caption = 
                `╭─「 📦 *DESCARGA DE APK* 」\n` +
                `│\n` +
                `│ 🏷️ *Nombre:* ${apk.name || 'Desconocido'}\n` +
                `│ 🆔 *Paquete:* \`${apk.package || 'N/A'}\`\n` +
                `│ ⚖️ *Tamaño:* ${apk.size || 'Desconocido'}\n` +
                `│ 📅 *Última act:* ${apk.lastUpdated || 'No disponible'}\n` +
                `│\n` +
                `│ ⏳ *Enviando archivo APK al chat...*\n` +
                `╰──────────────`
            if (apk.banner) {
                await conn.sendMessage(m.chat, {
                    image: { url: apk.banner },
                    caption: caption
                }, { quoted: m })
            } else {
                await m.reply(caption)
            }

            await conn.sendMessage(m.chat, {
                document: { url: apk.dl },
                mimetype: 'application/vnd.android.package-archive',
                fileName: fileName,
                caption: `✅ *${apk.name || 'Aplicación'}* descargada correctamente.`
            }, { quoted: m })

        } catch (err) {
            console.error('⚠️ Error en comando APK:', err)
            m.reply('❌ Ocurrió un error inesperado al descargar/enviar la aplicación.')
        }
    }
}
