/**
 * 1️⃣ Configurazione dei Comandi
 */

/*bot.command('help', (ctx) => {
  var lista_comandi = "";
  for (const key in comandi) {
    lista_comandi = lista_comandi.concat(comandi[key].toString(), "<br>");
  }

  console.log(lista_comandi);
  ctx.replyWithHTML(lista_comandi)
})*/

bot.command(comandi.lista, async (ctx) => ctx.reply(await gdrive_client.list()));


/**
 * Gestione delle foto che mi manda. 📸
 * @photo
 */
bot.on('photo', async (ctx) => {

    var id_utente = ctx.from.id;
    var photos = ctx.update.message.photo;
    var telegram_file_id = photos[(photos.length - 1)].file_id; //1. Ottengo ID File
    var url_download_foto = await ctx.telegram.getFileLink(telegram_file_id); //2. Ottengo URL download
    const fileUrlString = url_download_foto.toString();
    console.log(url_download_foto);

    ctx.reply('Immagine ricevuta 🖼');
    aggiungiUrlImmagine(ctx.from.id, fileUrlString)

    let last_reostato_usato = await ottieniUltimoReostatoUsato(id_utente);
    if (last_reostato_usato == "") {
        last_reostato_usato = "Nessunos"
    }
    ctx.reply('<b>Quale azione vuoi eseguire sulla foto?</b>', Extra.HTML().markup((m) =>
        m.inlineKeyboard([
            [m.callbackButton('✍ Aggiungi testo sulla foto (Default Data e ora)', 'aggiungiTesto')],
            [m.callbackButton('⚙️ Cambia il tipo di Reostato (Ultimo :' + last_reostato_usato + ')', 'scegliReostato')],
            [m.callbackButton('✖ Annulla', 'annullaUpload')]
        ]).resize()))

    setIsChoosingOption();
});

/**
 * STATUS:
 * - IS CHOOSING OPTION
 *  - IS CHOOSING REOSTATO
 *  - IS ADDING REOSTATO
 *  - IS ADDING TEXT
 *
 * Nel bot.use ... ogni volta controllo lo stato.
 * Per esempio : IF(ISCHOOSINGOPTION){ IF(MESSAGE.TEXT != ...)}
 */

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
    let id_utente = ctx.from.id;
    ctx.reply('Cosa vuoi scrivere sulla foto?', Markup.forceReply().extra());
    setIsAddingText(id_utente, true); //Imposto il flag che l'utente attuale sta scegliendo, così il Middleware intercetterà il prossimo messaggio
})

bot.action('carica', async (ctx) => {
    let id_utente = ctx.from.id;

    try {

        let dati_for_upload = await ottieniDatiForUpload(id_utente);

        let url = dati_for_upload.last_photo_url;
        let text = dati_for_upload.last_testo_su_immmagine;
        let nome_file_reostato = dati_for_upload.last_reostato_usato;

        if (text != nome_file_reostato == "" || nome_file_reostato == undefined) {
            console.log("Non ho trovato il testo oppure non è stato impostato");
            let data = new Date();
            text = data.toLocaleDateString();
        }

        if (nome_file_reostato == "" || nome_file_reostato == undefined) {
            console.log("Non ho trovato il nome del reostato oppure non è stato impostato");
            nome_file_reostato = "Nuovo Reostato " + data;
        }
        var buffer = await imageManager.aggiungiTesto(url, text);
        var res = await gdrive_client.uploadFromBuffer(nome_file_reostato, buffer);
        console.log("Upload terminato!" /*+ res*/ );
        ctx.reply(res);
        ctx.reply("Immagine salvata correttamente ☑");
    } catch (error) {
        ctx.reply(error);
    } finally {
        resetUtenteAttivo(id_utente)
    }

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