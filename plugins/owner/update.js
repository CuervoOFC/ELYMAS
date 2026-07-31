/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/owner/update.js
ʚĭɞ ೃ funcion :: actualizar bot desde github
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

import { exec } from 'child_process'
import util from 'util'
import config from '../../config.js'

const execAsync = util.promisify(exec)

function extractPureNumber(target) {
    if (!target) return ''
    return String(target)
        .split('@')[0]
        .split(':')[0]
        .replace(/[^0-9]/g, '')
}

export default {
    command: [
        'update',
        'actualizar',
        'gitpull'
    ],

    async run(m, { conn }) {
        const senderJid =
            m?.sender ||
            m?.key?.participant ||
            m?.key?.remoteJid ||
            ''

        const senderNum = extractPureNumber(senderJid)

        const isMainOwner =
            Array.isArray(config?.owners) &&
            config.owners.some(
                owner => extractPureNumber(owner) === senderNum
            )

        if (!isMainOwner) {
            return m.reply('🚫 Este comando solo puede ser usado por el *Owner Global*.')
        }

        await m.reply('🔄 *Buscando nuevas actualizaciones...*\n\n⏳ Espera un momento.')

        try {
            await execAsync('git fetch origin')

            const { stdout: status } = await execAsync('git status -uno')

            const hasUpdates =
                status.includes('Your branch is behind') ||
                status.includes('Tu rama está detrás') ||
                status.includes('can be fast-forwarded') ||
                status.includes('puede ser actualizada')

            if (!hasUpdates) {
                return m.reply(
                    '✅ *ELYMAS-BOT YA ESTÁ ACTUALIZADO*\n\n' +
                    'No hay cambios nuevos disponibles en GitHub.'
                )
            }

            await m.reply(
                '📥 *Actualización encontrada.*\n\n' +
                '⬇️ Descargando cambios desde GitHub...'
            )

            let branch = 'main'

            try {
                const { stdout: currentBranch } = await execAsync('git branch --show-current')
                branch = currentBranch.trim() || 'main'
            } catch {
                branch = 'main'
            }

            const { stdout: pullOutput, stderr: pullError } = await execAsync(`git pull origin ${branch}`)

            if (pullError && !pullOutput) {
                return m.reply(
                    '❌ *ERROR AL ACTUALIZAR*\n\n' +
                    pullError
                )
            }

            const output = pullOutput.trim()

            if (
                output.includes('Already up to date.') ||
                output.includes('Already up-to-date')
            ) {
                return m.reply(
                    '✅ *ELYMAS-BOT YA ESTÁ ACTUALIZADO*\n\n' +
                    'No existen cambios nuevos en GitHub.'
                )
            }

            return m.reply(
                '✅ *BOT ACTUALIZADO CORRECTAMENTE*\n\n' +
                '```\n' +
                output +
                '\n```'
            )

        } catch (error) {
            console.error(error)
            return m.reply(
                '❌ *ERROR AL ACTUALIZAR*\n\n' +
                `📄 ${error.message}`
            )
        }
    }
}
