
var path = require('path');
var Telegraf = require('telegraf');

/**
 * Dotenv e variabili di ambiente
*/

require('dotenv').config({ path: path.resolve(__dirname, '../private/.env') })

/**
 * Configurazione del Bot Telegram
*/
var bot = new Telegraf(process.env.BOT_TOKEN)
bot.telegram.setWebhook(`${process.env.APP_URL}${process.env.BOT_PATH}`)

/**
 * Comandi del Bot Telegram
 */
bot.command('help', (ctx) => ctx.reply('Try send a sticker!'))
bot.on('sticker', (ctx) => ctx.reply('👍'))

// EXPORT BOT
module.exports = bot.webhookCallback(`${process.env.BOT_PATH}`);