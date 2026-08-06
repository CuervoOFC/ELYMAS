/*
•❅──────✧✦✧──────❅•
Codigo Creado Por CUERVO-TEAM-SUPREME
Para Elymas-Bot Este Codigo Es 
Exclusivo Y Unico Para Este Bot Al 
Clonar O Copiar Dejar Estos Creditos 
De Cuervo-Team-Supreme
━━━━━ ☾☽ ━━━━━
ʚĭɞ ೃ CODIGO JAVASCRIPT ʚĭɞ ೃ
ʚĭɞ ೃ codigo :: plugins/herramientas/traductor.js
ʚĭɞ ೃ funcion :: traductor multilingüe vía EvoGB API y lista de códigos ISO
──────✧✦✧──────
*/

import axios from 'axios'
import config from '../../config.js'
import { getSubbotConfig } from '../../lib/subbotconfig.js'

const EVO_KEY = 'evogb-WzR3kPpa'

const LANG_CODES = {
    'abjasio': 'ab', 'achenés': 'ace', 'acholí': 'ach', 'afrikaans': 'af', 'albanés': 'sq',
    'alur': 'alz', 'amárico': 'am', 'árabe': 'ar', 'armenio': 'hy', 'asamés': 'as',
    'awadhi': 'awa', 'aimara': 'ay', 'azerí': 'az', 'balinés': 'ban', 'bambara': 'bm',
    'baskir': 'ba', 'euskara': 'eu', 'karo': 'btx', 'simalungun': 'bts', 'toba': 'bbc',
    'bielorruso': 'be', 'bemba': 'bem', 'bengalí': 'bn', 'betawi': 'bew', 'bhojpuri': 'bho',
    'bikol': 'bik', 'bosnio': 'bs', 'bretón': 'br', 'búlgaro': 'bg', 'buriato': 'bua',
    'cantonés': 'yue', 'catalán': 'ca', 'cebuano': 'ceb', 'chichewa': 'ny', 'chino': 'zh-CN',
    'chino-tradicional': 'zh-TW', 'chuvasio': 'cv', 'corso': 'co', 'croata': 'hr', 'checo': 'cs',
    'danés': 'da', 'dinka': 'din', 'divehi': 'dv', 'dogri': 'doi', 'holandés': 'nl',
    'dzongkha': 'dz', 'inglés': 'en', 'esperanto': 'eo', 'estonio': 'et', 'ewe': 'ee',
    'fiyiano': 'fj', 'filipino': 'fil', 'finés': 'fi', 'francés': 'fr', 'frisón': 'fy',
    'fula': 'ff', 'gallego': 'gl', 'ganda': 'lg', 'georgiano': 'ka', 'alemán': 'de',
    'griego': 'el', 'guaraní': 'gn', 'guyaratí': 'gu', 'haitiano': 'ht', 'hausa': 'ha',
    'hawaiano': 'haw', 'hebreo': 'he', 'hiligainón': 'hil', 'hindi': 'hi', 'hmong': 'hmn',
    'húngaro': 'hu', 'islandés': 'is', 'igbo': 'ig', 'ilocano': 'ilo', 'indonesio': 'id',
    'irlandés': 'ga', 'italiano': 'it', 'japonés': 'ja', 'javanés': 'jv', 'canarés': 'kn',
    'kazajo': 'kk', 'jemer': 'km', 'coreano': 'ko', 'krio': 'kri', 'kurdo': 'ku',
    'kirguizo': 'ky', 'laosiano': 'lo', 'latín': 'la', 'letón': 'lv', 'lingala': 'ln',
    'lituano': 'lt', 'luxemburgués': 'lb', 'macedonio': 'mk', 'malgache': 'mg', 'malayo': 'ms',
    'malabar': 'ml', 'maltés': 'mt', 'maorí': 'mi', 'maratí': 'mr', 'mongol': 'mn',
    'birmano': 'my', 'nepalí': 'ne', 'noruego': 'no', 'occitano': 'oc', 'odia': 'or',
    'oromo': 'om', 'papiamento': 'pap', 'pastún': 'ps', 'persa': 'fa', 'polaco': 'pl',
    'portugués': 'pt', 'punyabí': 'pa', 'quechua': 'qu', 'rumano': 'ro', 'ruso': 'ru',
    'samoano': 'sm', 'sánscrito': 'sa', 'serbio': 'sr', 'sesoto': 'st', 'shona': 'sn',
    'sindhi': 'sd', 'cingalés': 'si', 'eslovaco': 'sk', 'esloveno': 'sl', 'somalí': 'so',
    'español': 'es', 'sundanés': 'su', 'suajili': 'sw', 'sueco': 'sv', 'tayiko': 'tg',
    'tamil': 'ta', 'tártaro': 'tt', 'telugu': 'te', 'tailandés': 'th', 'tigrinya': 'ti',
    'turco': 'tr', 'turkmeno': 'tk', 'ucraniano': 'uk', 'urdu': 'ur', 'uigur': 'ug',
    'uzbeko': 'uz', 'vietnamita': 'vi', 'galés': 'cy', 'xhosa': 'xh', 'yiddish': 'yi',
    'yoruba': 'yo', 'maya': 'yua', 'zulú': 'zu'
}

export default {
    command: ['traducir', 'translate', 'tr', 'traducirlist'],

    async run(m, { conn, args }) {
        const rawJid = conn?.user?.jid || conn?.user?.id || conn?.subBotJid || ''
        const botData = getSubbotConfig(rawJid, config)
        const botName = botData.name || config.botName || 'Cuervo'

        const fullText = m.text.trim()
        const isListCommand = fullText.toLowerCase().includes('list') || m.command === 'traducirlist'

        // 1. Mostrar lista de idiomas soportados
        if (isListCommand) {
            let listText = 
                `╭━━━〔 🌐 *IDIOMAS Y CÓDIGOS ISO* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 📌 *Uso:* \`.traducir [código] [texto]\`\n` +
                `┃ 📌 *Ejemplo:* \`.traducir en Hola mundo\`\n` +
                `┃\n`

            const entries = Object.entries(LANG_CODES)
            entries.forEach(([lang, code]) => {
                const nameCapitalized = lang.charAt(0).toUpperCase() + lang.slice(1)
                listText += `┃ • *${nameCapitalized}:* \`${code}\`\n`
            })

            listText += `┃\n🤖 Bot: *${botName}*\n╰━━━━━━━━━━━━━━━━━━━━⬣`
            return m.reply(listText)
        }

        // 2. Extraer idioma destino y texto a traducir
        let targetLang = args[0]?.toLowerCase()
        let textToTranslate = args.slice(1).join(' ').trim()

        // Si responde a un mensaje, toma el texto citado si no mandó texto explícito
        if (!textToTranslate && m.quoted) {
            textToTranslate = m.quoted.text || m.quoted.caption || ''
        } else if (!textToTranslate && targetLang && !Object.values(LANG_CODES).includes(targetLang) && targetLang.length > 3) {
            // Si solo mandó texto directo sin código de idioma, traduce a español por defecto
            textToTranslate = args.join(' ').trim()
            targetLang = 'es'
        }

        if (!targetLang || !textToTranslate) {
            return m.reply(
                '╭─「 🌐 *TRADUCTOR SYSTEM* 」\n' +
                '│\n' +
                '│ ❌ Forma de uso incorrecta.\n' +
                '│\n' +
                '│ 📌 *Ejemplos:*\n' +
                '│ • `.traducir en Hola como estas`\n' +
                '│ • `.traducir es Hello my friend`\n' +
                '│ • `.traducirlist` (Ver lista de códigos)\n' +
                '╰──────────────'
            )
        }

        await m.reply('🌐 *Traduciendo texto...*')

        try {
            const apiUrl = `https://api.evogb.org/tools/translate?text=${encodeURIComponent(textToTranslate)}&to=${encodeURIComponent(targetLang)}&key=${EVO_KEY}`
            const res = await axios.get(apiUrl, { timeout: 15000 })

            if (!res.data?.status || !res.data?.data) {
                return m.reply('❌ No se pudo realizar la traducción en este momento.')
            }

            const { message, detected_lang, target_lang } = res.data.data

            const captionText = 
                `╭━━━〔 🌐 *TRADUCCIÓN* 〕━━━⬣\n` +
                `┃\n` +
                `┃ 🔤 *Origen:* \`${detected_lang || 'Auto'}\`\n` +
                `┃ 🎯 *Destino:* \`${target_lang}\`\n` +
                `┃\n` +
                `┃ 📥 *Texto Original:*\n` +
                `┃ ${textToTranslate}\n` +
                `┃\n` +
                `┃ 📤 *Traducción:*\n` +
                `┃ ${message}\n` +
                `┃\n` +
                `🤖 Bot: *${botName}*\n` +
                `╰━━━━━━━━━━━━━━━━━━━━⬣`

            return m.reply(captionText)

        } catch (error) {
            console.error('❌ Error en traductor:', error)
            return m.reply('❌ Ocurrió un error al procesar la traducción.')
        }
    }
}
