# Documentazione Progetto Sistemi + Bot Telegram

Ho deciso di creare un sistema che sfruttasse **Telegram** per semplificare il lavoro di organizzazione e sincronizzazione di immagini svolto da mio padre in azienda.
I suoi requisiti sono quelli di avere un sistema pratico e veloce che possa **classificare** ed eventualmente **aggiungere annotazioni** su **immagini**, per poi averle direttamente sul suo computer aziendale in una **specifica cartella.**

> La documentazione vuole comprendere tutte le tre materie di informatica, sistemi, e tpsit

## Indice

[TOC]

# Contesto

Con la seguente si introduce 

# Stack tecnologie

- 

# Struttura Progetto

### Attori Software

#### Stack Tecnologie Software

- **DATABASE** : *Sqlite* 
- **RUNTIME** : *Node.js*
- **FRAMEWORK PRINCIPALE** :  *Express.js*
- **TEMPLATE ENGINE** : *Ejs*

Altre tecnologie :

- **WEBHOOK :** *DynDNS (No-IP) + SSL (Let's Encrypt)*
- **CLOUD STORAGE** : *Google Drive API*
- **CLOUD AUTH** : *OAuth*
- **AUTHENTICATION** : *JWT*
- **TELEGRAM API :** *Telegraf.js*
- **CHIAMATE HTTP DA CLI :** *Axios*
- **CHIAMATE HTTP DA WEB:** *AJAX (jQuery)*

> *Cito Axios perchè utilizzato esplicitamente nella CLI.*
> *Probabilmente compare già come dipendenza da parte di altre librerie che effettuano chiamate HTTP*

### Attori Hardware

Gli attori Hardware sono i componenti fisici direttamente coinvolti nella struttura del progetto.

- ROUTER CASALINGO
- 

#### Stack Tecnologie Hardware

- OS SERVER : Raspbian ARM 32-bit
- 



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
//www/bin

/**
 * Dotenv : porta del server + chiavi SSL
 */

require('dotenv').config({ path: path.resolve(__dirname, '../private/.env') })
var certificatePath = path.resolve(__dirname,'../private/fullchain.pem');  //SSL - Related
var privateKeyPath = path.resolve(__dirname,'../private/privkey.pem');
var port = process.env.PORT;

app.set('port', port);

/**
 * Istanzia server HTTPS con Node
 */

var server = https.createServer({
  key: fs.readFileSync(privateKeyPath),
  cert: fs.readFileSync(certificatePath)
}, app)
.listen(port, function () {
console.log(`Attiva sulla porta ${port}!)
})

server.on('error', onError);
server.on('listening', onListening);
```



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





## Da Aggiungere / Sistemare ➕🔧

#### Aggiungere ➕

- Ricerca in lingua != Inglese al momento produce meno risultati. *Devo aggiustare coi parametri di ricerca nella query, quanto meno aggiungendo la voce it-IT.*

- Ricerca con Colore Personalizzato (non generato)
- Navigazione continua (possibilità di tornare indietro e avanti, con controllo sui parametri scelti)
- Link al fotografo anche nella galleria e sostituzione del

#### Sistemare 🔧

- **PROBLEMA** : Avrei voluto mettere il contenuto Dinamico dell'HTML in un JSON.
  Tuttavia, il JSON non accetta l'andare a capo. Mi sono reso conto dopo che avrei potuto mettere tutto su una riga e utilizzare una visualizzazione a parte per modificare a piacimento l'HTML.

- **Download** con bottone. Crossed Origin Download negato da politiche del browser.
  - Workaround: Anzichè eseguire un Download diretto, si viene re-indirizzati a una nuova tab.
- **Padding** e **Allineamento** della Galleria da Mobile.