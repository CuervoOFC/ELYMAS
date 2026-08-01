/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: lib/welcome.js
ʚĭɞ ೃ funcion :: procesamiento de bienvenida y despedida (Fix JID split)
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { getGroup } from './database.js'
import { getSubbotConfig } from './subbotconfig.js'
import config from '../config.js'

const STELLAR_KEY = 'api-COTah'
const EVO_KEY = 'evogb-WzR3kPpa'

const STELLAR_BYE_API = 'https://api.stellarwa.xyz/generate/bye-image'
const EVO_WELCOME_API = 'https://api.evogb.org/generate/welcome-image'
const EVO_BYE_API = 'https://api.evogb.org/generate/bye-image'

const DEFAULT_AVATAR = 'https://nube.stellarwa.xyz/rf/HLC2aJy3eCRP.jpeg'
const DEFAULT_BG = 'https://nube.stellarwa.xyz/rf/HLC2aJy3eCRP.jpeg'

/**
 * Procesa las bienvenidas y despedidas de los miembros
 * @param {Object} conn - Instancia de conexión de Baileys
 * @param {Object} update - Objeto de actualización { id, participants, action }
 */
export async function processWelcome(conn, { id, participants, action }) {
    try {
        if (!id || !participants || !Array.isArray(participants)) return

        // 1. Validar en la base de datos si el grupo tiene la bienvenida activa
        const groupData = getGroup(id)
        if (!groupData || !groupData.welcome) return

        // 2. Extraer datos dinámicos del Subbot / Owner
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'
        const ownerName = botData.ownerName || config.ownerName || 'TheDevil'

        // 3. Obtener metadatos del grupo
        const groupMetadata = await conn.groupMetadata(id).catch(() => ({}))
        const groupName = groupMetadata.subject || 'el Grupo'
        const memberCount = groupMetadata.participants?.length || 0

        // Foto del Grupo
        let groupIcon = DEFAULT_BG
        try {
            groupIcon = await conn.profilePictureUrl(id, 'image')
        } catch {
            groupIcon = DEFAULT_BG
        }

        for (const item of participants) {
            // FIX: Normalizar jid si viene como string u objeto { id: '...' }
            const rawParticipant = typeof item === 'string' ? item : item?.id || item?.phoneNumber || ''
            if (!rawParticipant) continue

            const userJid = rawParticipant.includes('@') ? rawParticipant : `${rawParticipant}@s.whatsapp.net`
            const username = userJid.split('@')[0]

            // --- 🟢 MODO BIENVENIDA (ADD) ---
            if (action === 'add') {
                const welcomeText = `👋 *¡Bienvenido/a @${username}!*\n\nHola, soy *${botName}*, mi dueño es *${ownerName}*.\nEsperamos que disfrutes tu estadía en *${groupName}*.`

                let imageUrl = ''

                // 1. Intentar con StellarWA
                try {
                    const stellarUrl = `https://api.stellarwa.xyz/generate/welcome-image?username=${encodeURIComponent(username)}&guildName=${encodeURIComponent(groupName)}&guildIcon=${encodeURIComponent(groupIcon)}&memberCount=${memberCount}&avatar=${encodeURIComponent(DEFAULT_AVATAR)}&background=${encodeURIComponent(groupIcon)}&key=${STELLAR_KEY}`
                    
                    const checkRes = await fetch(stellarUrl, { method: 'HEAD' })
                    if (checkRes.ok) {
                        imageUrl = stellarUrl
                    } else {
                        throw new Error('StellarWA no disponible')
                    }
                } catch (err) {
                    // 2. Respaldo en EvoGB
                    imageUrl = `${EVO_WELCOME_API}?username=${encodeURIComponent(username)}&memberCount=${memberCount}&guildName=${encodeURIComponent(groupName)}&guildIcon=${encodeURIComponent(groupIcon)}&avatar=${encodeURIComponent(DEFAULT_AVATAR)}&background=${encodeURIComponent(groupIcon)}&key=${EVO_KEY}`
                }

                await conn.sendMessage(id, {
                    image: { url: imageUrl },
                    caption: welcomeText,
                    mentions: [userJid]
                }).catch(err => console.error('❌ Error enviando mensaje de bienvenida:', err))
            }

            // --- 🔴 MODO DESPEDIDA (REMOVE) ---
            if (action === 'remove') {
                const byeText = `👋 *¡Hasta luego @${username}!*\n\nUn miembro menos en *${groupName}*. Quedamos ${memberCount} miembros.`

                let imageUrl = ''

                // 1. Intentar con StellarWA
                try {
                    const stellarUrl = `${STELLAR_BYE_API}?username=${encodeURIComponent(username)}&guildName=${encodeURIComponent(groupName)}&guildIcon=${encodeURIComponent(groupIcon)}&memberCount=${memberCount}&avatar=${encodeURIComponent(DEFAULT_AVATAR)}&background=${encodeURIComponent(groupIcon)}&key=${STELLAR_KEY}`
                    
                    const checkRes = await fetch(stellarUrl, { method: 'HEAD' })
                    if (checkRes.ok) {
                        imageUrl = stellarUrl
                    } else {
                        throw new Error('StellarWA Bye no disponible')
                    }
                } catch (err) {
                    // 2. Respaldo en EvoGB
                    imageUrl = `${EVO_BYE_API}?username=${encodeURIComponent(username)}&memberCount=${memberCount}&guildName=${encodeURIComponent(groupName)}&guildIcon=${encodeURIComponent(groupIcon)}&avatar=${encodeURIComponent(DEFAULT_AVATAR)}&background=${encodeURIComponent(groupIcon)}&key=${EVO_KEY}`
                }

                await conn.sendMessage(id, {
                    image: { url: imageUrl },
                    caption: byeText,
                    mentions: [userJid]
                }).catch(err => console.error('❌ Error enviando mensaje de despedida:', err))
            }
        }
    } catch (error) {
        console.error('❌ Error en lib/welcome.js:', error)
    }
}
