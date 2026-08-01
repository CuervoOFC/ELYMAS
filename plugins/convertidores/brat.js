/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/convertidores/brat.js
ʚĭɞ ೃ funcion :: generar sticker brat con texto estático
ʚĭɞ ೃ estado :: completo
──────✧✦✧──────
*/

const EVO_KEY = 'evogb-WzR3kPpa'

export default {
    command: ['brat'],

    async run(m, { conn, args, text }) {
        let txt = text || (m.quoted ? m.quoted.text : '')

        if (!txt) {
            return m.reply(
                '╭─「 🟩 *BRAT STICKER* 」\n' +
                '│\n' +
                '│ ❌ Por favor, ingresa el texto para crear el sticker.\n' +
                '│\n' +
                '│ 📌 *Ejemplo:*\n' +
                '│ .brat Hola bro\n' +
                '│ (O responde a un mensaje con *.brat*)\n' +
                '╰──────────────'
            )
        }

        await m.reply(
            '╭━━━〔 ⏳ *GENERANDO* 〕━━━⬣\n' +
            '┃ 🟩 Creando sticker Brat...\n' +
            '╰━━━━━━━━━━━━━━━━━━━━⬣'
        )

        try {
            const apiUrl = `https://api.evogb.org/tools/brat?text=${encodeURIComponent(txt)}&animated=false&key=${EVO_KEY}`
            const res = await fetch(apiUrl)

            if (!res.ok) throw new Error('Error al conectar con la API de Brat.')

            const arrayBuf = await res.arrayBuffer()
            const imageBuffer = Buffer.from(arrayBuf)

            return await conn.sendMessage(m.chat, {
                sticker: imageBuffer
            }, { quoted: m })

        } catch (error) {
            console.error('❌ Error en Brat:', error)
            return m.reply(
                '╭─「 ❌ *ERROR EN BRAT* 」\n' +
                '│\n' +
                '│ Ocurrió un error al generar el sticker Brat.\n' +
                `│ 📄 ${error instanceof Error ? error.message : 'Error desconocido'}\n` +
                '╰──────────────'
            )
        }
    }
}
