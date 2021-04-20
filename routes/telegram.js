
var path = require('path');
var { Telegraf } = require('telegraf');
var gdrive_client = require('../helper/gdrive_client');
var axios = require('axios');
/**
 * Dotenv e variabili di ambiente
*/

require('dotenv').config({ path: path.resolve(__dirname, '../private/.env') })

/*
 * Configurazione del Bot Telegram
*/
var bot = new Telegraf(process.env.BOT_TOKEN)
console.log(`${process.env.APP_URL}${process.env.BOT_PATH}`);
//bot.telegram.setWebhook(`${process.env.APP_URL}${process.env.BOT_PATH}`)

/**
 * Comandi del Bot Telegram
 */
//bot.on('message',(ctx) => console.log(ctx))


bot.command('help', (ctx) => ctx.reply('Try send a sticker!'))
bot.on('sticker', (ctx) => ctx.reply('👍'))

/**
 * Gestione delle foto che mi manda.
 */
bot.on('photo', async (ctx) => {
    //Ottenggo Array di foto
    //Eseguo operazione per ogni array di foto
    var photos = ctx.update.message.photo;

    //Per ogni elemento dell'array di foto:
    //1. Estraggo fileID
    //2. Con l'oggetto Telegram creo l'URL per richiedere la foto
    //3. Con Axios ottengo la foto
    
        var myFileID = photos[0].file_id; //1. Ottengo ID File
        const fileUrl = await ctx.telegram.getFileLink(myFileID); //2. Ottengo URL download
        const response = await axios.get(fileUrl.toString()); //3. Scarico tramite Axios
        ctx.reply('I read the file for you! The contents were:...');
        gdrive_client.upload(response.data);
    
  });    
  

// EXPORT BOT
module.exports = bot.webhookCallback(`${process.env.BOT_PATH}`);