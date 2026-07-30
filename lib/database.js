/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: lib/database.js
ʚĭɞ ೃ funcion :: creacion , edicion , lectura y guardado de .json necesarios para el bot
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/


import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.join(__dirname, '..')
const DATABASE_PATH = path.join(ROOT, 'database')

const FILES = {
usuarios: path.join(DATABASE_PATH, 'usuarios.json'),
grupos: path.join(DATABASE_PATH, 'grupos.json'),
subbots: path.join(DATABASE_PATH, 'subbots.json')
}

function ensureDatabase() {

if (!fs.existsSync(DATABASE_PATH)) {

    fs.mkdirSync(
        DATABASE_PATH,
        {
            recursive: true
        }
    )

}


const subbotsFolder =
    path.join(
        DATABASE_PATH,
        'subbots'
    )


if (!fs.existsSync(subbotsFolder)) {

    fs.mkdirSync(
        subbotsFolder,
        {
            recursive: true
        }
    )

}


if (!fs.existsSync(FILES.usuarios)) {

    saveJSON(
        FILES.usuarios,
        {}
    )

}


if (!fs.existsSync(FILES.grupos)) {

    saveJSON(
        FILES.grupos,
        {}
    )

}


if (!fs.existsSync(FILES.subbots)) {

    saveJSON(
        FILES.subbots,
        {}
    )

}

}

function loadJSON(file) {

try {

    if (!fs.existsSync(file)) {

        return {}

    }


    const data =
        fs.readFileSync(
            file,
            'utf8'
        )


    return JSON.parse(data)


} catch (error) {

    console.error(
        `❌ Error leyendo ${file}:`,
        error
    )


    return {}

}

}

function saveJSON(
file,
data
) {

try {

    fs.writeFileSync(

        file,

        JSON.stringify(
            data,
            null,
            2
        ),

        'utf8'

    )


    return true


} catch (error) {

    console.error(
        `❌ Error guardando ${file}:`,
        error
    )


    return false

}

}

function getUsers() {

ensureDatabase()

return loadJSON(
    FILES.usuarios
)

}

function saveUsers(
data
) {

ensureDatabase()

return saveJSON(
    FILES.usuarios,
    data
)

}

function getUser(
jid
) {

const users =
    getUsers()


if (
    !users[jid]
) {

    users[jid] = {

        id: jid,

        exp: 0,

        level: 1,

        coins: 0,

        bank: 0,

        premium: false,

        premiumTime: 0,

        registered: true,

        createdAt:
            Date.now(),

        lastDaily: 0,

        lastWork: 0

    }


    saveUsers(
        users
    )

}


return users[jid]

}

function getGroups() {

ensureDatabase()

return loadJSON(
    FILES.grupos
)

}

function saveGroups(
data
) {

ensureDatabase()

return saveJSON(
    FILES.grupos,
    data
)

}

function getGroup(
jid
) {

const groups =
    getGroups()


if (
    !groups[jid]
) {

    groups[jid] = {

        id: jid,

        welcome: true,

        antilink: false,

        nsfw: false,

        economy: true,

        createdAt:
            Date.now()

    }


    saveGroups(
        groups
    )

}


return groups[jid]

}

function getSubBots() {

ensureDatabase()

return loadJSON(
    FILES.subbots
)

}

function saveSubBots(
data
) {

ensureDatabase()

return saveJSON(
    FILES.subbots,
    data
)

}

ensureDatabase()

export {

FILES,

ensureDatabase,

loadJSON,

saveJSON,

getUsers,

saveUsers,

getUser,

getGroups,

saveGroups,

getGroup,

getSubBots,

saveSubBots

}
