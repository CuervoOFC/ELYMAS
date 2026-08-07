/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ 💤 CODIGO JAVASCRIPT ʚĭɞ 💤
ʚĭɞ 💤 codigo :: plugins/grupos/antinsfw.js
ʚĭɞ 💤 funcion :: AntiNSFW (Admins/Owners: borra mensaje | Usuarios: borra mensaje y expulsa)
──────✧✦✧──────
*/

import { downloadMediaMessage } from '@itsliaaa/baileys'
import { getGroup, getGroups, saveGroups } from '../../lib/database.js'
import config from '../../config.js'

const EVO_KEY = 'evogb-WzR3kPpa'
const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const EVO_CONVERTER_API = 'https://api.evogb.org/api/converter-img'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'

const MAX_SIZE_EVO = 150 * 1024 * 1024
const MAX_SIZE_STELLAR = 40 * 1024 * 1024

// Extraer número limpio sin dominio ni sufijos de dispositivos (LID)
function extractPureNumber(target) {
    if (!target) return ''
    if (Array.isArray(target)) target = target[0]
    return String(target)
        .split('@')[0]
        .split(':')[0]
        .replace(/[^0-9]/g, '')
}

// Comprobar si el usuario es Owner (vía config.js, global.owner o isOwner)
function checkIsOwner(senderNum, isOwnerParam) {
    if (isOwnerParam) return true

    const configOwners = config?.owners || []
    const isConfigOwner = Array.isArray(configOwners) && configOwners.some(owner => {
        const num = Array.isArray(owner) ? owner[0] : owner
        return extractPureNumber(num) === senderNum
    })

    const globalOwners = global.owner || []
    const isGlobalOwner = Array.isArray(globalOwners) && globalOwners.some(owner => {
        const num = Array.isArray(owner) ? owner[0] : owner
        return extractPureNumber(num) === senderNum
    })

    return isConfigOwner || isGlobalOwner
}

async function uploadToEvo(mediaBuffer, mime, fileSize) {
    if (fileSize > MAX_SIZE_EVO) throw new Error('Excede límite EvoGB')

    const formData = new FormData()
    let ext = mime.split('/')[1]?.split(';')[0] || 'webp'
    const blob = new Blob([mediaBuffer], { type: mime })
    formData.append('file', blob, `file.${ext}`)

    const res = await fetch(`${EVO_UPLOAD_API}?key=${EVO_KEY}`, {
        method: 'POST',
        body: formData
    })

    if (!res.ok) throw new Error(`HTTP Status ${res.status}`)
    const json = await res.json()
    if (!json.status || !json.url) throw new Error('URL Inválida de EvoGB')

    return json.url
}

async function uploadToStellar(mediaBuffer, mime, fileSize) {
    if (fileSize > MAX_SIZE_STELLAR) throw new Error('Excede límite StellarWA')

    const formData = new FormData()
    const ext = mime.split('/')[1]?.split(';')[0] || 'webp'
    const blob = new Blob([mediaBuffer], { type: mime })
    formData.append('file', blob, `file.${ext}`)

    const res = await fetch(STELLAR_UPLOAD_API, {
        method: 'POST',
        body: formData
    })

    if (!res.ok) throw new Error(`HTTP Status ${res.status}`)
    const json = await res.json()
    if (!json.success || !json.file?.publicUrl) throw new Error('URL Inválida de StellarWA')

    return json.file.publicUrl
}

async function convertMediaUrl(mediaUrl, targetFormat) {
    try {
        const convertUrl = `${EVO_CONVERTER_API}?method=url&url=${encodeURIComponent(mediaUrl)}&width=none&height=none&to=${targetFormat}&key=${EVO_KEY}`
        const res = await fetch(convertUrl)
        const json = await res.json()

        if (json && json.status && json.url) {
            return json.url
        }
        return mediaUrl
    } catch {
        return mediaUrl
    }
}

async function resolveRealJid(rawId, altPn, conn) {
    if (!rawId && !altPn) return null

    if (altPn) {
        const cleanPn = String(altPn).split('@')[0].replace(/[^0-9]/g, '')
        if (cleanPn) return `${cleanPn}@s.whatsapp.net`
    }

    const str = String(rawId || '').split(':')[0]
    if (str.endsWith('@s.whatsapp.net') && !str.includes('@lid')) return str

    if (conn && typeof conn.findUserId === 'function') {
        try {
            const cleanQuery = str.split('@')[0].replace(/[^0-9]/g, '')
            if (cleanQuery && cleanQuery.length >= 8) {
                const res = await conn.findUserId(cleanQuery)
                if (res?.phoneNumber) {
                    const pn = res.phoneNumber.split('@')[0].replace(/[^0-9]/g, '')
                    return `${pn}@s.whatsapp.net`
                }
            }
        } catch (e) {}
    }

    const cleanNumber = str.split('@')[0].replace(/[^0-9]/g, '')
    return cleanNumber ? `${cleanNumber}@s.whatsapp.net` : null
}

async function processAntiNSFW(m, conn, isOwnerParam) {
    if (!m || !m.isGroup) return

    const groupData = getGroup(m.chat)
    if (!groupData || !groupData.antinsfw) return

    // OBTENER INFORMACIÓN Y PRIVILEGIOS DEL REMITENTE
    const senderRaw = m.sender || m.key.participant || m.participant || ''
    const senderPn = m.key?.senderPn || m.key?.participantAlt
    const realJid = await resolveRealJid(senderRaw, senderPn, conn) || senderRaw
    const senderNum = extractPureNumber(realJid || senderRaw)

    const isBotOwner = checkIsOwner(senderNum, isOwnerParam)

    let isGroupAdmin = false
    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participants = groupMetadata?.participants || []
        isGroupAdmin = participants.some(p => {
            const pNum = extractPureNumber(p.id || p.jid || '')
            return pNum === senderNum && (p.admin === 'admin' || p.admin === 'superadmin')
        })
    } catch (e) {
        console.error('⚠️ Error consultando metadata del grupo:', e.message)
    }

    const isPrivilegedUser = isBotOwner || isGroupAdmin

    // LECTURA DEL ADJUNTO
    const q = m.quoted ? m.quoted : m
    const rawMessage = q.message || q.msg || q

    const stickerMsg = rawMessage?.stickerMessage || (q.mtype === 'stickerMessage' ? q : null)
    const mime = (
        rawMessage?.imageMessage?.mimetype ||
        rawMessage?.videoMessage?.mimetype ||
        rawMessage?.documentMessage?.mimetype ||
        stickerMsg?.mimetype ||
        q.mimetype ||
        m.mimetype ||
        ''
    )

    if (!mime || (!mime.startsWith('image/') && !mime.startsWith('video/') && !mime.includes('webp'))) return

    try {
        let mediaBuffer
        try {
            mediaBuffer = await downloadMediaMessage(
                q,
                'buffer',
                {},
                { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
            )
        } catch {
            if (typeof q.download === 'function') {
                mediaBuffer = await q.download()
            } else if (typeof conn.downloadMediaMessage === 'function') {
                mediaBuffer = await conn.downloadMediaMessage(q)
            } else {
                return
            }
        }

        if (!mediaBuffer) return

        let uploadedUrl = null
        const fileSize = mediaBuffer.length

        try {
            uploadedUrl = await uploadToEvo(mediaBuffer, mime, fileSize)
        } catch {
            try {
                uploadedUrl = await uploadToStellar(mediaBuffer, mime, fileSize)
            } catch {
                return
            }
        }

        if (!uploadedUrl) return

        let finalMediaUrl = uploadedUrl
        if (mime.includes('webp')) {
            finalMediaUrl = await convertMediaUrl(uploadedUrl, 'png')
        }

        const apiEvo = `https://api.evogb.org/nsfw/detect?method=url&url=${encodeURIComponent(finalMediaUrl)}&frames=5&model=model-v3&key=${EVO_KEY}`
        const res = await fetch(apiEvo)
        const json = await res.json()

        if (!json || !json.status || !json.analysis) return

        if (json.analysis.is_nsfw) {
            const flag = json.analysis.flag || 'NSFW'
            const confidence = json.analysis.confidence || '100%'

            // PASO 1: ELIMINAR EL CONTENIDO NSFW (Aplica a todos por igual)
            await conn.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: m.key.fromMe || false,
                    id: m.key.id,
                    participant: m.key.participant || senderRaw
                }
            }).catch(() => conn.sendMessage(m.chat, { delete: m.key }))

            // PASO 2: DIFERENCIAR SANCIÓN SEGÚN EL ROL
            if (isPrivilegedUser) {
                // ADMIN / OWNER: Solo se le avisa que el contenido fue borrado (NO SE LE EXPULSA)
                await conn.sendMessage(m.chat, {
                    text: `⚠️ *@${senderNum}*, tu contenido fue eliminado por ser detectado como no permitido (*${flag}* - ${confidence}). Al ser Administrador/Owner no fuiste expulsado del grupo.`,
                    mentions: [realJid]
                }).catch(() => {})
            } else {
                // USUARIO NORMAL: Notificación de sanción + Expulsión
                await conn.sendMessage(m.chat, {
                    text: `🔞 *@${senderNum}*, tu contenido fue detectado como prohibido (*${flag}* - ${confidence}) y has sido eliminado del grupo.`,
                    mentions: [realJid]
                }).catch(() => {})

                await conn.groupParticipantsUpdate(m.chat, [realJid], 'remove').catch(async () => {
                    await conn.groupParticipantsUpdate(m.chat, [senderRaw], 'remove').catch(() => {})
                })
            }
        }

    } catch (err) {
        console.error('⚠️ Error en AntiNSFW:', err.message || err)
    }
}

export default {
    command: ['antinsfw', 'anti-nsfw'],

    async run(m, { conn, args, isOwner }) {
        if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')

        const senderJid = m?.sender || m?.key?.participant || ''
        const senderNum = extractPureNumber(senderJid)

        const isBotOwner = checkIsOwner(senderNum, isOwner)

        let isAdmin = false
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const participants = groupMetadata?.participants || []
            isAdmin = participants.some(p => {
                const pNum = extractPureNumber(p.id || p.jid || '')
                return pNum === senderNum && (p.admin === 'admin' || p.admin === 'superadmin')
            })
        } catch (e) {
            console.error('Error al obtener la metadata:', e)
        }

        if (!isAdmin && !isBotOwner) {
            return m.reply('❌ Este comando solo puede ser utilizado por los *Administradores* del grupo o el *Owner Global*.')
        }

        const option = args[0]?.toLowerCase()
        const groupData = getGroup(m.chat) || {}
        const allGroups = getGroups() || {}

        if (option === 'on' || option === 'enable' || option === '1') {
            groupData.antinsfw = true
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('✅ *AntiNSFW ACTIVADO* para este grupo.')
        } else if (option === 'off' || option === 'disable' || option === '0') {
            groupData.antinsfw = false
            allGroups[m.chat] = groupData
            saveGroups(allGroups)

            return m.reply('❌ *AntiNSFW DESACTIVADO* para este grupo.')
        } else {
            return m.reply(
                '╭─「 🔞 *CONFIGURACIÓN DE ANTINSFW* 」\n' +
                '│\n' +
                `│ 📌 Estado actual: *${groupData.antinsfw ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*\n` +
                '│\n' +
                '│ 💡 *Uso:*\n' +
                '│ • `.antinsfw on` ➔ Activar AntiNSFW\n' +
                '│ • `.antinsfw off` ➔ Desactivar AntiNSFW\n' +
                '╰──────────────'
            )
        }
    },

    async before(m, { conn, isOwner }) {
        await processAntiNSFW(m, conn, isOwner)
    },

    async all(m, { conn, isOwner }) {
        await processAntiNSFW(m, conn, isOwner)
    }
}
