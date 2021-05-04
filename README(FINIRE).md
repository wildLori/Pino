

# Documentazione Progetto Sistemi + Bot Telegram

LINK AL VIDEO : https://youtu.be/0O0BCj2DI0I

Ho deciso di creare un sistema che sfruttasse **Telegram** per semplificare il lavoro di organizzazione e sincronizzazione di immagini svolto da mio padre in azienda.
I suoi requisiti sono quelli di avere un sistema pratico e veloce che possa **classificare** ed eventualmente **aggiungere annotazioni** su **immagini**, per poi averle direttamente sul suo computer aziendale in una **specifica cartella.**

> La documentazione vuole comprendere tutte le tre materie di informatica, sistemi, e tpsit

## Indice

[TOC]

# Contesto

Con i due paragrafi seguenti si vogliono introdurre la situazione attuale e l'obiettivo del progettino.

## As Is - Situazione Pre-Progetto

> Vedasi prima le righe introduttive in cima al documento.

Al momento mio padre lavora in questo modo: 

1. Scende fisicamente dall'ufficio per andare in officina, scatta le foto sui pezzi meccanici che gli interessano e torna in ufficio.
2. **Collega** il cellulare al computer, **cerca** nella galleria, e **copia** le immagini che gli servono dal cellulare al computer
3. **Sistema** i file e li **carica** nella cartella di rete aziendale
4. **Apre** in *GIMP* le immagini per **aggiungere** **del testo** e per **compirmerle**, in modo da renderle più adatte ai documenti digitali in modo da non gravare troppo sulla dimensione finale dei documenti.

Il collo di bottiglia è ovviamente rappresentato dagli ultimi passaggi:

- **Tempo di organizzazione** dei file
- **Tempo di Apertura** in GIMP per operazioni ripetitive (compressione e aggiunta testi) 
- Le numerose foto **occupano** **spazio** sul cellulare e anche sui dischi



## To Be - Obiettivo Post-Progetto

L'obiettivo del progetto è quello di ottenere un sistema che migliori il processo attuale:

Deve:

- Sfruttare un **client** facilmente **fruibile** attraverso lo **smartphone** 

- **Comprimere** le immagini
- **Categorizzare** le immagini
- **Stampare** eventuali testi / annotazioni su immagini
- Rendere disponibili le **immagini in cloud** per un tot di tempo
- **Scaricare e Sincronizzare** le immagini su computer aziendale 



### Considerazioni

Client1 : decido di utilizzare Telegram in quanto
Client2 : decido di utilizzare un programma CLI che giri in background
Hosting Server: decido di crearlo in casa utilizzando un Raspberry

# Struttura Progetto

## Attori di Sistema e Stack Tecnologie

Gli attori di Sistema sono i componenti fisici e non coinvolti nella parte sistemistica del progetto.

- **ROUTER E FIRMWARE :** AGTHP_2.1.0 (TIM HUB 2019)
- **SERVER** **E OS**: Raspberry Pi 4 (Modello 4GB di RAM) con Raspbian ARM 32-bit

- **dynDNS PROVIDER** : [No-IP](https://www.noip.com/)
- **SSL CERTIFICATE :** [Let's Encrypt](https://letsencrypt.org/)

### Certificato SSL

Let's Encrypt:

>A nonprofit Certificate Authority providing TLS certificates to **260 million** websites.



## Attori Software e Stack Tecnologie

- **DATABASE** : *Sqlite* 
- **RUNTIME** : *Node.js*
- **FRAMEWORK PRINCIPALE** :  *Express.js*
- **TEMPLATE ENGINE** : *Ejs*

Altre tecnologie :

- **CLOUD STORAGE** : *Google Drive API*
- **CLOUD AUTH** : *OAuth* *(gestito da GoogleAPIs - Node.js)*
- **AUTHENTICATION** : *JWT* (Json Web Token)
- **TELEGRAM API :** *Telegraf.js*
- **WEBHOOK :** (Vedi paragrafo successivo)
- **CHIAMATE HTTP DA CLI :** *Axios*
- **CHIAMATE HTTP DA WEB:** *AJAX (jQuery)*

> *Cito Axios perchè utilizzato esplicitamente nella CLI.*
> *Probabilmente compare già come dipendenza da parte di altre librerie che effettuano chiamate HTTP*



Il progetto parte dalla convenzione di progetti **node basati su Express.**
L'entry point è nella cartella `📂www/bin`

| ![image-20210504101510003](image-20210504101510003.png) | ![image-20210504101537364](image-20210504101537364.png) | ![image-20210504101555127](image-20210504101555127.png) | ![image-20210504101618809](image-20210504101618809.png) | ![image-20210504101656776](image-20210504101656776.png) |
| ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| Route                                                   | Views                                                   | Helper Class                                            | Private Data                                            | Public Data                                             |

### Creazione Server HTTPS

Il server funziona in HTTPS.
La chiave e il certificato sono salvati nella cartella ​📁​`private/`

- **Fullchain.pem** 

  > Fullchain.pem contiene sia la certificazione del server che la certificazione dell'ente che lo rilascia 

- **Privkey.pem**

```js
x //www/bin/** * Dotenv : porta del server + chiavi SSL */require('dotenv').config({ path: path.resolve(__dirname, '../private/.env') })var certificatePath = path.resolve(__dirname,'../private/fullchain.pem');  //SSL - Relatedvar privateKeyPath = path.resolve(__dirname,'../private/privkey.pem');var port = process.env.PORT;app.set('port', port);/** * Istanzia server HTTPS con Node */var server = https.createServer({  key: fs.readFileSync(privateKeyPath),![image-20210504101409010](D:\02 - Dev\04 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210504101409010.png)  cert: fs.readFileSync(certificatePath)}, app).listen(port, function () {console.log(`Attiva sulla porta ${port}!)})server.on('error', onError);server.on('listening', onListening);
```

![image-20210504101510003](D:\02 - Dev\04 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210504101510003.png)

![image-20210504101537364](D:\02 - Dev\04 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210504101537364.png)

![image-20210504101555127](D:\02 - Dev\04 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210504101555127.png)

![image-20210504101618809](D:\02 - Dev\04 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210504101618809.png)

![image-20210504101656776](D:\02 - Dev\04 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210504101656776.png)

![telegram-getupdates-vs-setwebhook](D:\02 - Dev\04 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\telegram-getupdates-vs-setwebhook.png)

![documentazione_telegram_schemi-Copy of Flusso CLI](D:\02 - Dev\04 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\documentazione_telegram_schemi-Copy of Flusso CLI.svg)

![documentazione_telegram_schemi-Struttura di Rete](D:\02 - Dev\04 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\documentazione_telegram_schemi-Struttura di Rete.svg)



## Route

Le route sono gestite in **app.js **

```js
//app.js - Gestione delle rotte
app.use('/auth', auth)
app.use('/officina', officina)
app.use('/cli', cli)
app.use(telegramManager); //la route corrispondente è gestita nel module.export() in Telegram.js
```



### /Auth e /Officina

### JWT

Ogni chiamata effettuata in questa sezione utilizza il JWT come middleware. 

1. CLIENT : Utente **effettua il login /auth**

2. SERVER : Controlla le **credenziali**

3. SERVER : Credenziali corrette. Genera un **Token JWT** che incapsula:

   ```js
   //Token JWT - Cosa incapsula?
   {
   	id_utente : {int32bit},
   	is_admin : {binary}
   }
   ```

4. SERVER : Genera un **cookie** in cui incapsulare il JWT

5. SERVER : Invia un **redirect** (302) alla pagina */officina* 

### EJS

```js
//app.js - settaggio del template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
```

Ejs è il **template engine** che permette di eseguire il **rendering delle pagine HTML** sfruttando la logica **embedded** direttamente nella pagina.
L'esempio qui sotto esegue il riempimento di una tabella senza utilizzare codice javascript esterno.

```ejs
//Inserimento di una tabella nell'HTML con EJS
<% for(var i=0; i<info.length; i++) {%>
                        <tr>

                            <td><%= info[i].id_utente %></td>
                            <td><%= info[i].nome %></td>
                            <%if (info[i].pending != 0) { %>
                            <td><button class="btn btn-outline-primary"
                                    onclick="accettaUtente('<%= info[i].id_utente%>',0)">Accetta</button>
                                <button class="btn"
                                    onclick="accettaUtente('<%= info[i].id_utente%>',1)">Rifiuta</button>
                            </td>
                            <% } %>

                        </tr>
                        <% } %>
```

> La pagina viene renderizzata lato server con la funzione `res.render(pagina,parametro)`	



## Telegram BOT

Il bot di Telegram è costruito con la libreria **Telegraf**.

Il bot **non utilizza il polling**, bensì utilizza un **Webhook** che punta a un **DynDNS** *(Vedi paragrafo di Sistemi per approfondimenti).*
L'utilizzo di Webhook, in relazione al compito e all'infrastruttura del bot, è stata la scelta migliore per risparmiare chiamate HTTP superflue.

### Funzionalità

Il bot presenta le seguenti funzionalità:

1. Stampa testo su **Immagine** 🀄
2. **Creazione** e **Impostazione Tags** 📑
3. Caricamento immagini 🔼

Il bot funziona interamente con **inline-keyboard**, così da semplificare l'esperienza di utilizzo per l'utente.



#### Cambio e creazione tag ⚙️

Il secondo elemento della Tastiera permette di creare e associare un nome/tag al **Reostato** (immagine appena caricata.)

![image-20210504094829412](image-20210504094829412.png)

Per **mantenere la consistenza** è possibile:

- **Creare nuovi** Tag Reostati ➕
- **Ri-utilizzare** Tag esistenti 🔁

![image-20210504095057749](image-20210504095057749.png)



#### Stampa Testo ⚙️

![image-20210504094744446](image-20210504094744446.png)



#### Upload ⚙️





# CLI

Flow della CLI





- 