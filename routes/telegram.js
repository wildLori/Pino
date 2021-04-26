var path = require('path');
var fs = require('fs');

const Telegraf = require('telegraf');
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

var gdrive_client = require('../helper/gdrive_client');
var imageManager = require('../helper/imageManager');
var modelManager = require('../helper/modelManager');
const {
  randomInt
} = require('crypto');
const {
  aggiungiTesto
} = require('../helper/imageManager');
const Jimp = require('jimp');
const {
  fstat
} = require('fs');

var areUsersLoaded = false;


/**
 * Dotenv e variabili di ambiente
 */

require('dotenv').config({
  path: path.resolve(__dirname, '../private/.env')
})

const comandi = {
  start: "/start",
  help: "/help",
  lista: "/lista_file"
}


var utentiAttivi = {};

setup();

/**
 * L'utilità di setup apre il Database ed esegue le operazioni preliminari
 */
async function setup() {
  console.log(await modelManager.apriDB());
  var utenti = await modelManager.getAllUsers();
  areUsersLoaded = true;
  //CARICO TUTTI GLI UTENTI DAL DB AL JSON IN MEMORIA
  for (let index = 0; index < utenti.length; index++) {
    let utente = utenti[index].id_utente
    aggiungiUtenteAttivo(utente);
    console.log(utente);
  }
  //utenti.forEach((x) => console.log(x.value))
  console.log(await modelManager.chiudiDB())
}


//TODO: Mostra lista comandi
const helpMsg = `Command reference:
/start - Start bot (mandatory in groups)
/inc - Increment default counter
/inc1 - Increment counter 1
/incx - Increment counter x (replace x with any number)
/dec - Decrement counter
/decx - Decrement counter x
/reset - Reset counter back to 0
/resetx - Reset counter x back to 0
/set y - Set counter to y [/set y]
/setx y - Set counter x to y [/setx y]
/get - Show current counter
/getx - Show value of counter x
/getall - Show all counters
/stop - Attemt to stop bot
/about - Show information about the bot
/help - Show this help page
Tip: You can also use e.g. '/inc2 5' to increase counter two by five counts.`;



/*
 * 0️⃣ Configurazione del Bot Telegram
 */
var bot = new Telegraf(process.env.BOT_TOKEN)


bot.use(async (ctx, next) => {
  if (areUsersLoaded) {
    try {
      if (ctx.from.id) { //Il messaggio arriva da un utente Telegram?
        let id_utente = ctx.from.id;
        if (utentiAttivi.hasOwnProperty(id_utente)) { //L'utente che ha mandato il messaggio è nella lista degli utenti attivi?
          console.log(id_utente + " è già attivo.");
          // STATUS : Sta inserendo un nuovo reostato?
          if (utentiAttivi[id_utente].is_adding_new_reostato == true) { //L'utente è nello status di "Sto per aggiungere un reostato?""
            let new_reostato = ctx.message;
            console.log(new_reostato);
            ctx.reply("Inserisco " + new_reostato.nome + " nel Database 🔄");
            setIsAddingNewReostato(id_utente, false); //Aggiorno lo stato is_adding_new_reostato a false
            await modelManager.addReostato(new_reostato).then((res) => ctx.reply("Ho aggiunto il reostato!"));
            modelManager.chiudiDB();
            // STATUS : Sta scegliendo un reostato?
          } else if (utentiAttivi[id_utente].is_choosing_reostato == true) { //Se l'utente sta scegliendo il reostato
            if (ctx.message.text != '➕ Aggiungi') {
              let reostato_scelto = ctx.message.text;
              let res_test = await setUltimoReostatoUsato(id_utente, reostato_scelto);
              ctx.reply(utentiAttivi[id_utente].last_reostato_usato + ' impostato ☑', Markup.removeKeyboard().extra())
            }
          }
        } else {
          aggiungiUtenteAttivo(id_utente); //Se non è attivo, aggiungo l'utente nel JSON
          console.log(id_utente + " attivato ORA");
          console.log("ID CHAT : " + ctx.from.id + "\n" + ctx.chat.id);
        }
      }
    } catch (err) {
      console.log("ERRORE?" + ctx.message);

      console.log(err);
    }
  }

  await next();
})


console.log(`${process.env.APP_URL}${process.env.BOT_PATH}`);



/**
 * Comandi del Bot Telegram
 */


bot.start((ctx) => ctx.reply('Ciao!'))

/**
 * 1️⃣ Configurazione dei Comandi
 */

bot.command('help', (ctx) => {
  var lista_comandi = "";
  for (const key in comandi) {
    lista_comandi = lista_comandi.concat(comandi[key].toString(), "<br>");
  }

  console.log(lista_comandi);
  ctx.replyWithHTML(lista_comandi)
})

bot.command(comandi.lista, async (ctx) => ctx.reply(await gdrive_client.list()));


/**
 * Gestione delle foto che mi manda. 📸
 * @photo
 */
bot.on('photo', async (ctx) => {

  var photos = ctx.update.message.photo;
  var telegram_file_id = photos[(photos.length - 1)].file_id; //1. Ottengo ID File
  var url_download_foto = await ctx.telegram.getFileLink(telegram_file_id); //2. Ottengo URL download
  const fileUrlString = url_download_foto.toString();
  console.log(url_download_foto);

  ctx.reply('Immagine ricevuta 🖼');
  //TODO: Questo è da inserire
  //var res = await gdrive_client.upload(fileUrlString); //Aspetto che drive carichi l'immagine
  //await ctx.reply(res.webViewLink);
  aggiungiUrlImmagine(ctx.from.id, fileUrlString)

  let last_reostato_usato = await ottieniUltimoReostatoUsato(ctx.from.id);
  if (last_reostato_usato == "") {
    last_reostato_usato = "Nessunos"
  }
  ctx.reply('<b>Quale azione vuoi eseguire sulla foto?</b>', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      [m.callbackButton('✍ Aggiungi testo sulla foto (Default Data e ora)', 'aggiungiTesto')],
      [m.callbackButton('⚙️ Cambia il tipo di Reostato (Ultimo :' + last_reostato_usato + ')', 'scegliReostato')],
      [m.callbackButton('✖ Annulla', 'annullaUpload')]
    ]).resize()))

});

bot.action('scegliReostato', async (ctx) => {

  await modelManager.apriDB();
  ctx.deleteMessage();
  let last_reostati = await modelManager.getAllReostati();
  setIsChoosingReostato(ctx.from.id, true)
  var buttons = [];
  for (let i = 0; i < last_reostati.length; i++) {
    let temp = last_reostati[i].nome;
    buttons.push(temp);
  }

  return ctx.reply('Elenco dei Reostati:', Markup
    .keyboard([
      buttons,
      ['➕ Aggiungi'] //Row 1
    ])
    .oneTime()
    .resize()
    .extra()
  )
})

bot.action('annullaUpload', (ctx) => {
  let id_utente = ctx.from.id;
  setIsAddingNewReostato(id_utente, false);
  setIsChoosingReostato(id_utente, false);
  console.log(ctx.message);
  //ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.id);
})

bot.hears('➕ Aggiungi', async (ctx) => {
  let id_utente = ctx.from.id;
  ctx.reply('Quale nome vuoi impostare?', Markup.forceReply().extra());
  setIsAddingNewReostato(id_utente, true); //Imposto il flag che l'utente attuale sta scegliendo, così il Middleware intercetterà il prossimo messaggio
})

bot.action('aggiungiTesto', async (ctx) => {
  //🔴 TODO: Questo è solo un test, la funzione per uploadare deve essere spotata su un bottone apposito!!!!!!!
  let file_name = "test";
  let data = Date.now().toString();
  let url = await ottieniUltimoLink(ctx.from.id);
  ctx.reply(url);
  var buffer = await imageManager.aggiungiTesto(url);
  var res = await gdrive_client.uploadFromBuffer(file_name, buffer);
  console.log("Upload terminato!" /*+ res*/ );
  ctx.reply(res);
  //await modelManager.apriDB();

  //4. Carica su Drive

})

bot.action('carica', async (ctx) => {
  let id_utente = ctx.from.id;
  gdrive_client.uploadFromBuffer()
  try {

  } catch (error) {

  } finally {
    resetUtenteAttivo(id_utente)
  }
  ctx.reply("Immagine salvata correttamente ☑");


})

bot.command('broadcast', ctx => {
  if (ctx.from.id == config.adminChatId) {
    var words = ctx.message.text.split(' ');
    words.shift(); //remove first word (which ist "/broadcast")
    if (words.length == 0) //don't send empty message
      return;
    var broadcastMessage = words.join(' ');
    var userList = dataService.getUserList();
    console.log("Sending broadcast message to", userList.length, "users:  ", broadcastMessage);
    userList.forEach(userId => {
      console.log(">", {
        id: userId
      }, broadcastMessage);
      ctx.telegram.sendMessage(userId, broadcastMessage);
    });
  }
});








/**
 * 
 * Funzioni di @utilità
 * 
 */

/**
 * Resetta tutti i valori dell'utente dopo che ha caricato correttamente l'immagine
 * @param {*} id_utente 
 */
async function resetUtenteAttivo(id_utente) {
  if (utentiAttivi.hasOwnProperty(id_utente)) {
    utentiAttivi[id_utente].last_photo_url = "";
    utentiAttivi[id_utente].to_delete_message = "";
    utentiAttivi[id_utente].is_choosing_reostato = false;
  }
}

/**
 * Questa funzione mi serve per aggiungere agli utenti attivi un Model di utente attivo
 * @utente
 * @status
 * @ultimo
 */
async function aggiungiUtenteAttivo(id_utente) {
  var utente_attivo = {
    last_reostato_usato: "",
    last_photo_url: "",
    last_testo_su_immmagine: "",
    is_choosing_reostato: false,
    is_adding_new_reostato: false,
    to_delete_message: ""
  };
  utentiAttivi[id_utente] = utente_attivo;
}
/*
async function caricaReostato(nome_reostato) {
  var reostato = {

  };
  utentiAttivi[id_utente] = utente_attivo;
}
*/
async function rimuoviUtenteAttivo(id_utente) {
  delete utentiAttivi[id_utente]
}


/**
 * Aggiunge url dell'immagine all'utente attivo 🔗
 * @id_utente
 * @url_immagine
 */
async function aggiungiUrlImmagine(id_utente, url_immagine) {
  if (utentiAttivi.hasOwnProperty(id_utente)) {
    utentiAttivi[id_utente].last_photo_url = url_immagine;
  }
}

/**
 * Aggiunge titolo alla immagine (questo titolo verrà visualizzato su Drive) 
 * @id_utente
 * @testo_su_immagine
 */
async function aggiungiDataSuImmagine(id_utente, data) {
  if (utentiAttivi.hasOwnProperty(id_utente)) {
    utentiAttivi[id_utente].last_testo_su_immmagine = testo_su_immagine;
  }
  await imageManager.aggiungiTesto(data)
  return "Edit Terminato!";
}

/**
 * Ottiene l'ultimo URL associato all'utente 🔗
 * @id_utente
 */
async function ottieniUltimoLink(id_utente) {
  if (utentiAttivi.hasOwnProperty(id_utente)) {
    let url = await utentiAttivi[id_utente].last_photo_url;
    return url
  }
}

/**
 * Ottiene l'ultimo Titolo utilizzato dall'utente ✍
 * @id_utente
 */
async function ottieniUltimoReostatoUsato(id_utente) {
  if (utentiAttivi.hasOwnProperty(id_utente)) {
    let nome_usato = await utentiAttivi[id_utente].last_reostato_usato;
    return nome_usato
  }
}

/**
 * Imposta il Nome dell'ultimo reostato utilizzato dall'utente 
 * @id_utente
 */
async function setUltimoReostatoUsato(id_utente, new_reostato) {
  return new Promise(function (resolve, reject) {
    if (utentiAttivi.hasOwnProperty(id_utente)) {
      utentiAttivi[id_utente].last_reostato_usato = new_reostato;
      resolve(utentiAttivi[id_utente].last_reostato_usato);
    } else {
      reject("ERRORE?");
      console.log("errore")
    }
  })

}

/**
 * Imposta se l'utente sta aggiungendo o meno un nuovo reostato
 * @id_utente
 * @new_state
 */
async function setIsAddingNewReostato(id_utente, new_State) {
  if (utentiAttivi.hasOwnProperty(id_utente)) {
    utentiAttivi[id_utente].is_adding_new_reostato = new_State;
    return true;
  }
}

/**
 * Imposta se l'utente sta scegliendo o meno un nuovo reostato
 * @id_utente
 * @new_state
 */
async function setIsChoosingReostato(id_utente, new_State) {
  if (utentiAttivi.hasOwnProperty(id_utente)) {
    utentiAttivi[id_utente].is_choosing_reostato = new_State;
    return true;
  }
}

async function setToDeleteMessage(id_utente, id_messaggio) {

}





// EXPORT BOT
module.exports = bot.webhookCallback(`${process.env.BOT_PATH}`); //Nella route di express comparirà il link impostato come webhook