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
ʚĭɞ 💤 funcion :: AntiNSFW compatible con stickers animados/movimiento y GIFs
──────✧✦✧──────
*/

import { downloadMediaMessage } from '@itsliaaa/baileys'
import { getGroup, getGroups, saveGroups } from '../../lib/database.js'

const EVO_KEY = 'evogb-WzR3kPpa'
const EVO_UPLOAD_API = 'https://api.evogb.org/tools/upload'
const EVO_CONVERTER_API = 'https://api.evogb.org/api/converter-img'
const STELLAR_UPLOAD_API = 'https://nube.stellarwa.xyz/upload'

const MAX_SIZE_EVO = 150 * 1024 * 1024
const MAX_SIZE_STELLAR = 40 * 1024 * 1024

// Subida a EvoGB
async function uploadToEvo(mediaBuffer, mime, fileSize) {
    if (fileSize > MAX_SIZE_EVO) throw new Error('Excede límite EvoGB')

    const formData = new FormData()
    let ext = mime.split('/')[1]?.split(';')[0] || 'bin'
    if (ext === 'webp') ext = 'webp'

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

// Subida de respaldo a StellarWA
async function uploadToStellar(mediaBuffer, mime, fileSize) {
    if (fileSize > MAX_SIZE_STELLAR) throw new Error('Excede límite StellarWA')

    const formData = new FormData()
    const ext = mime.split('/')[1]?.split(';')[0] || 'bin'
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

// Convertir imágenes/stickers/gifs usando la API de EvoGB
async function convertMedia(mediaUrl, targetFormat = 'mp4') {
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

// Resuelve JID real eliminando sufijos LID
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
            if (cleanQuery.length >= 8) {
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

async function processAntiNSFW(m, conn, isOwner) {
    if (!m || !m.isGroup) return

    const groupData = getGroup(m.chat)
    if (!groupData || !groupData.antinsfw) return

    const q = m.quoted ? m.quoted : m
    const rawMessage = q.message || q.msg || q

    // Detección exhaustiva de Mime Types (incluye stickers animados)
    const mime = (
        rawMessage.imageMessage?.mimetype ||
        rawMessage.videoMessage?.mimetype ||
        rawMessage.audioMessage?.mimetype ||
        rawMessage.documentMessage?.mimetype ||
        rawMessage.stickerMessage?.mimetype ||
        q.mimetype ||
        m.mimetype ||
        ''
    )

    const isAnimatedSticker = Boolean(rawMessage.stickerMessage?.isAnimated)

    // Validar si es imagen, video, gif o sticker
    if (!mime || (!mime.startsWith('image/') && !mime.startsWith('video/') && !mime.includes('webp'))) return

    try {
        // 1. Descarga del buffer del archivo
        let mediaBuffer
        try {
            mediaBuffer = await downloadMediaMessage(
                q,
                'buffer',
                {},
                { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
            )
        } catch (dlErr) {
            if (typeof q.download === 'function') {
                mediaBuffer = await q.download()
            } else if (typeof conn.downloadMediaMessage === 'function') {
                mediaBuffer = await conn.downloadMediaMessage(q)
            } else {
                return
            }
        }

        if (!mediaBuffer) return

        // 2. Subida del archivo original
        let mediaUrl = null
        const fileSize = mediaBuffer.length

        try {
            mediaUrl = await uploadToEvo(mediaBuffer, mime, fileSize)
        } catch {
            try {
                mediaUrl = await uploadToStellar(mediaBuffer, mime, fileSize)
            } catch {
                return
            }
        }

        if (!mediaUrl) return

        // 3. Conversión Adaptativa:
        // Si es un sticker animado o video/gif ➔ Convertir a MP4
        // Si es un sticker estático (WebP) ➔ Convertir a PNG
        if (isAnimatedSticker || mime.includes('gif')) {
            mediaUrl = await convertMedia(mediaUrl, 'mp4')
        } else if (mime.includes('webp')) {
            mediaUrl = await convertMedia(mediaUrl, 'png')
        }

        // 4. Consulta a la API AntiNSFW de EvoGB
        const apiEvo = `https://api.evogb.org/nsfw/detect?method=url&url=${encodeURIComponent(mediaUrl)}&frames=5&model=model-v3&key=${EVO_KEY}`
        const res = await fetch(apiEvo)
        const json = await res.json()

        if (!json || !json.status || !json.analysis) return

        // 5. Acción si es detectado como NSFW
        if (json.analysis.is_nsfw) {
            const senderRaw = m.sender || m.key.participant || m.participant
            const senderPn = m.key?.senderPn || m.key?.participantAlt
            const realJid = await resolveRealJid(senderRaw, senderPn, conn) || senderRaw
            const cleanNumber = realJid.split('@')[0].replace(/[^0-9]/g, '')

            // Eximir Administradores u Owners
            const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
            const participants = groupMetadata?.participants || []
            const isUserAdmin = participants.some(p => {
                const pNum = (p.id || p.jid || '').split(':')[0].split('@')[0]
                return pNum === cleanNumber && (p.admin === 'admin' || p.admin === 'superadmin')
            })

            if (isUserAdmin || isOwner) return

            // A. Eliminar el mensaje
            try {
                await conn.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat,
                        fromMe: m.key.fromMe || false,
                        id: m.key.id,
                        participant: senderRaw
                    }
                })
            } catch {
                await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
            }

            // B. Advertencia
            const flag = json.analysis.flag || 'NSFW'
            const confidence = json.analysis.confidence || '100%'

            await conn.sendMessage(m.chat, {
                text: `🔞 *@${cleanNumber}*, el sticker/contenido enviado fue detectado como explícito (*${flag}* - ${confidence}) y has sido eliminado.`,
                mentions: [realJid]
            }).catch(() => {})

            // C. Expulsión
            try {
                await conn.groupParticipantsUpdate(m.chat, [senderRaw], 'remove')
            } catch {
                if (realJid !== senderRaw) {
                    await conn.groupParticipantsUpdate(m.chat, [realJid], 'remove').catch(() => {})
                }
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

        let isAdmin = false
        try {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const participants = groupMetadata.participants || []
            const senderJid = (m.sender || m.key.participant || '').split(':')[0].split('@')[0]
            
            isAdmin = participants.some(p => {
                const pJid = (p.id || p.jid || '').split(':')[0].split('@')[0]
                return pJid === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
            })
        } catch (e) {
            console.error('Error metadata:', e)
        }

        if (!isAdmin && !isOwner) {
            return m.reply('❌ Este comando solo puede ser utilizado por los *Administradores* del grupo.')
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
