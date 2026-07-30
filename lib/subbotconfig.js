/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: lib/subbotconfig
ʚĭɞ ೃ funcion :: edicion de los subbots
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import fs from 'fs'
import path from 'path'
import config from '../config.js'

const DB_PATH = './database/subbots_config.json'

// Asegurar que exista la carpeta y el archivo JSON
if (!fs.existsSync('./database')) {
    fs.mkdirSync('./database', { recursive: true })
}
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}))
}

// Obtener la configuración del subbot
export function getSubbotConfig(botJid, defaultConfig) {
    try {
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
        return data[botJid] || {
            name: defaultConfig?.botName || 'Cuervo',
            ownerName: defaultConfig?.ownerName || 'Damian',
            image: null
        }
    } catch {
        return {
            name: defaultConfig?.botName || 'Cuervo',
            ownerName: defaultConfig?.ownerName || 'TheDevil',
            image: null
        }
    }
}

// Guardar la configuración del subbot
export function saveSubbotConfig(botJid, newConfig) {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    data[botJid] = { ...data[botJid], ...newConfig }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

/**
 * Función auxiliar para extraer de forma segura identificadores (JID, LID o Números)
 */
function decodeIdentifier(target) {
    if (!target) return ''
    const str = String(target)
    // Extrae la parte antes del '@' o del ':'
    const id = str.split('@')[0].split(':')[0]
    return id.replace(/[^0-9]/g, '')
}

// Validar que sea un Subbot y que el ejecutor sea Owner
export function validateSubbotOwner(m, conn) {
    // 1. Obtener identificadores del bot actual (JID y LID si existen)
    const botJid = conn?.user?.jid || conn?.user?.id || ''
    const botLid = conn?.user?.lid || ''
    const mainBotSession = String(config?.sessionName || '')

    // 2. Determinar si la conexión actual es un Subbot
    const isSubbot = Boolean(conn?.isSubbot) || (botJid !== '' && !botJid.includes(mainBotSession))

    if (!isSubbot) {
        return {
            allowed: false,
            reason: '⚠️ Este comando solo se puede utilizar dentro de la sesión de un **Subbot**.'
        }
    }

    // 3. Extraer identificadores del remitente (JID, LID o número)
    const senderJid = m?.sender || m?.key?.participant || m?.key?.remoteJid || ''
    const senderNumber = decodeIdentifier(senderJid)

    // Identificadores del bot actual
    const botNumber = decodeIdentifier(botJid)
    const botLidNumber = decodeIdentifier(botLid)

    // Identificadores del creador del subbot
    const creatorRaw = conn?.subbotOwner || ''
    const creatorNumber = decodeIdentifier(creatorRaw)

    // 4. Validar si es Owner Principal en config.js (comparación por JID directo o por número)
    const ownersList = Array.isArray(config?.owners) ? config.owners : []
    const isMainOwner = ownersList.some(owner => {
        const ownerNum = decodeIdentifier(owner)
        return ownerNum !== '' && (ownerNum === senderNumber || owner === senderJid)
    })

    // 5. Validar coincidencia por JID, LID o Números de teléfono
    const isSubbotOwner = 
        // Coincide el número con el del creador
        (senderNumber !== '' && senderNumber === creatorNumber) ||
        // Coincide el número con el bot
        (senderNumber !== '' && senderNumber === botNumber) ||
        // Coincide con el LID del bot
        (senderNumber !== '' && senderNumber === botLidNumber) ||
        // Coincidencia exacta de strings completos (JIDs/LIDs completos)
        (senderJid !== '' && (senderJid === creatorRaw || senderJid === botJid || senderJid === botLid))

    if (!isMainOwner && !isSubbotOwner) {
        return {
            allowed: false,
            reason: '🚫 Solo el **Owner principal** o el **Dueño del Subbot** pueden modificar esta configuración.'
        }
    }

    return { allowed: true }
}
