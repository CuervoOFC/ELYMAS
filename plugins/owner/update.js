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

    async run(
        m,
        {
            conn
        }
    ) {

        // ==========================================
        // VERIFICAR OWNER GLOBAL
        // ==========================================

        const senderJid =
            m?.sender ||
            m?.key?.participant ||
            m?.key?.remoteJid ||
            ''

        const senderNum =
            extractPureNumber(senderJid)

        const isMainOwner =
            Array.isArray(config?.owners) &&
            config.owners.some(
                owner =>
                    extractPureNumber(owner) === senderNum
            )

        if (
            !isMainOwner
        ) {

            return m.reply(

                '🚫 Este comando solo puede ser usado por el *Owner Global*.'

            )

        }

        await m.reply(

            '🔄 *Buscando nuevas actualizaciones...*\n\n' +

            '⏳ Espera un momento.'

        )

        try {

            // ==========================================
            // ACTUALIZAR INFORMACIÓN REMOTA
            // ==========================================

            await execAsync(
                'git fetch origin'
            )

            const {

                stdout: status

            } = await execAsync(

                'git status -uno'

            )
