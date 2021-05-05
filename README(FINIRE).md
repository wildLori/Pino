

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

Client1 : decido di utilizzare Telegram in quanto client facilmente utilizzabile via smartphone
Client2 : decido di utilizzare un programma CLI che giri in background sul computer aziendale
Hosting Server: decido di crearlo in casa utilizzando un Raspberry

![Untitled Diagram-Copy of Copy of Struttura di Rete](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\Untitled Diagram-Copy of Copy of Struttura di Rete.svg)



## Attori di Sistema e Stack Tecnologie

Gli attori di Sistema sono i componenti fisici e non coinvolti nella parte sistemistica del progetto.

- **ROUTER E FIRMWARE :** AGTHP_2.1.0 (TIM HUB 2019)
- **SERVER** **E OS**: Raspberry Pi 4 (Modello 4GB di RAM) con Raspbian ARM 32-bit

- **dynDNS PROVIDER** : [No-IP](https://www.noip.com/)
- **SSL CERTIFICATE :** [Let's Encrypt](https://letsencrypt.org/)



## Diagramma di rete

![documentazione_telegram_schemi-Struttura di Rete](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\documentazione_telegram_schemi-Struttura di Rete.svg)

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



## Hosting e Webhook

Il Webhook è un metodo che permette di ricevere notifiche da un Server anzichè eseguire il polling su di esso. 
Nel progetto viene utilizzate per ricevere update da Telegram anzichè 
Il **vantaggio** sta nel **risparmio di chiamate HTTP superflue.**![telegram-getupdates-vs-setwebhook](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\telegram-getupdates-vs-setwebhook.png)



Per impostare il webhook con i server di Telegram sono necessarie due condizioni:

- **DOMINIO** REGISTRATO
- **CERTIFICATO SSL** VALIDO



### Dynamic DNS

Essendo il Server hostato su macchina locale (vedasi schema di rete) è necessario essere raggiungibili dall'esterno.
Per incontrare i requisiti elencati sopra nel progetto si utilizza la tecnologia di **Dynamic DNS.**

Un provider **DynamicDNS** è un fornitore di servizi che permette di registrare un proprio dominio che punti sempre all'indirizzo IP più aggiornato di una rete privata (l'**indirizzo IP  è assegnato dinamicamente dall'ISP**)

Sul router è installato uno script che, ad ogni nuovo ottenimento di indirizzo IP, comunica il proprio indirizzo al Provider di DynamicDNS.

![image-20210505083805480](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210505083805480.png)

Questa qua sopra è il **pannello di controllo di NO-IP**, permette di monitore gli hostname registrati con il loro provider.

Sul router, se lo supporta, è possibile **attivare il servizio di Dynamic DNS automaticamente**, inserendo le **credenziali** del provider a cui si è registrati.

![dyndns-attivazione-dns-smart-modem-tim](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\dyndns-attivazione-dns-smart-modem-tim.png)

> Dagli ulitmi FIRMWARE di router TIM è possibile attivare DynDNS automaticamente. In alternativa, è possibile installare un client su un dispositivo connesso alla rete locale (ad esempio un pc) e comunicare manualmente l'indirizzo ip pubblico della propria rete al provider.

### Certificato SSL e Port Forwarding

Una volta ottenuto un hostname, è possibile testare con un ping da CMD il nostro router finale,e verificare il percorso di rete eseguendo un tracer -t.

Dal browser tuttavia, non si ha nessuna risposta finchè non si soddisfano due requisiti:

- Avere un **server in ascolto sulla porta 80** (o altra porta specificata)
- Avere porta 80 (o altra porta specificata) aperta (**port forwarding**) sul router.
- Organizzazione delle **regole del Firewall** server del router.
- Avere un **server con indirizzo IP Statico in Rete Locale** per eseguire il port forwarding.

Si osservi nuovamente lo schema di rete:

![documentazione_telegram_schemi-Struttura di Rete](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\documentazione_telegram_schemi-Struttura di Rete.svg)

![Configurazione Port Mapping - Internet: Modem ADSL e Fibra TIM - Assistenza  Tecnica 187 Alice Telecom Italia.](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\technicolor_port_2)

> Gestione port forwarding su router TIM (immagine di esempio)

Una volta impostate le regole di rete e il server in ascolto sulla porta specificata è possibile utilizzare un tool per ottenere un certificato SSL da un provider riconosciuto.

### Let's Encrypt e Certbot

Let's Encrypt è un provider di certificati SSL.
Per verificare l'identità del server si appoggia a un **tool da command line, chiamato CERTBOT.**

Su piattaforma Linux, Certbot è distribuito attraverso Snapd

Certbot funziona in questo modo:

1. Si **installa** sul server
2. Si seguono le istruzioni da command line
3. Si **crea un file che soddisfi una challenge** (challenge è il termine per la verifica di un file)
4. Certbot chiede a Let's Encrypt di **eseguire una chiamata sul server per verificare la challenge**
5. Se la verifica va a buon fine, Certbot richiede un **certificato firmato da Let's Encrypt.**



![image-20210505084028878](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210505084028878.png)

### Creazione Server HTTPS

Il server funziona in HTTPS.
La chiave e il certificato sono salvati nella cartella ​📁​`private/`

- **Fullchain.pem** 

  > Fullchain.pem contiene sia la certificazione del server che la certificazione dell'ente che lo rilascia 

- **Privkey.pem**

Di seguito, una parte del codice utilizzato per inizializzare il server.

```js
//Entry point: bin/www
/**
 * Dotenv : porta del server + chiavi SSL
 */

require('dotenv').config({ path: path.resolve(__dirname, '../private/.env') })
var certificatePath = path.resolve(__dirname,'../private/fullchain.pem');  //SSL - Related
var privateKeyPath = path.resolve(__dirname,'../private/privkey.pem');
var port = process.env.PORT;
console.log(port);

app.set('port', port);

/*Crea Server in HTTPS*/

var server = https.createServer({
  key: fs.readFileSync(privateKeyPath), //KEY
  cert: fs.readFileSync(certificatePath) //CERTIFICATO
}, app)
.listen(port, function () {
console.log(`Attiva sulla porta ${port}! Test qua -> https://belfanti.ddns.net:8443`)
})

```





Il progetto utilizza la convenzione di progetti **node basati su Express.**
L'entry point è nella cartella `📂www/bin`

| ![image-20210504101510003](image-20210504101510003.png) | ![image-20210504101537364](image-20210504101537364.png) | ![image-20210504101555127](image-20210504101555127.png) | ![image-20210504101618809](image-20210504101618809.png) | ![image-20210504101656776](image-20210504101656776.png) |
| ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| Route                                                   | Views                                                   | Helper Class                                            | Private Data                                            | Public Data                                             |

## Database e Variabili d'ambiente

La cartella `private` contiene i **dati privati** (ignorati nella repo con un .gitignore)

### Model Manager (DB)

Il Database utilizzato è un DB creato con **Sqlite**. 

```sqlite
IMMAGINI (ID_IMMAGINE,ID_REOSTATO,LINK,DATA)
REOSTATI (ID_REOSTATO,NOME)
UTENTI (ID_UTENTE,NOME,IS_ADMIN,PENDING,PIN)
```

Il Package utilizzato per accede è **Sqlite3** : quest'ultimo NON supporta le promise, sono quindi implementate manualmente.

Qui sotto esempi di alcune chiamate al DB.
*(il DB rimane sempre aperto per motivazioni prestazionali e chiuso al momento di stop del server)*

```javascript
//modelmanager.js

exports.apriDB = function () {
    return new Promise(function (resolve) {
        this.db = new sqlite3.Database(db_path,
            function (err) {
                if (err) reject("Open error: " + err.message)
                else resolve(db)
            }
        )
    })
}

exports.chiudiDB = function (db) {
    return new Promise(function (resolve, reject) {
        this.db.close()
        resolve(true)
    })
}

exports.getUserAndRole = function (nome, pin) {
    return new Promise(function (resolve, reject) {
        var query = `SELECT nome,is_admin FROM utenti WHERE nome=? AND pin=?`
        this.db.get(query, [nome, pin], function (err, row) {
            console.log(err, row);
            if (err) {
                reject(false)
                console.error("Errore nell'ottenere l'utente con questo ID " + id_utente);
            } else {
                if (!row) {
                    console.log(row);
                    resolve(false);
                } else {
                    console.log("Si ho trovato l'utente " + row)
                    resolve(row);
                }

            }
        })
    })
}
```



### DotEnv (variabili d'ambiente)

Le variabili d'ambiente sono richiamate grazie al package dotenv, che accede a file privati present in un file .env (anch'esso nella cartella private/)

```js
/**
 * Dati dell'account di Google Drive
 */
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; //Callback
const REDIRECT_URI_PLAYGROUND = process.env.GOOGLE_REDIRECT_URI_PLAYGROUND;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const driveAuth = new google.auth.OAuth2( //Il mio Oggetto che espone i dati del client
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI_PLAYGROUND //Callback, Redirect
);

const folderUrl = "1rQ_OIjeQAhV7pORaOfe_uijHiNUYANJ-";
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



Ogni rotta è gestita da una classe Javascript istanza di Router.



### Route /auth e /officina (Dashboard Web)

![image-20210505101329940](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210505101329940.png)

Dalla dashboard è possibile **accettare** o **rifiutare** un utente. L'aggiunta avviene ogni volta che un utente non autorizzato avvia il bot.

### JWT

Ogni chiamata effettuata in questa sezione utilizza il JWT come middleware. 

![documentazione_telegram_schemi-Copy of Flusso CLI](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\documentazione_telegram_schemi-Copy of Flusso CLI.svg)

1. CLIENT : Utente **effettua il login /auth**

```js
//LATO CLIENT : Pagina web di login, invio del FORM

function makeRequest(username, pin) {
        var form = new FormData();
        form.append("username", username);
        form.append("pin", pin);

        var settings_LOGIN = {
            "url": "https://belfanti.ddns.net:8443/auth/login",
            "method": "POST",
            "timeout": 0,
            "processData": false,
            "mimeType": "multipart/form-data",
            "contentType": false,
            "data": form
        };

        var settings_OFFICINA = {
            "url": "https://belfanti.ddns.net:8443/officina",
            "method": "GET",
            "timeout": 0,
            "xhrFields": {
                "withCredentials": true
            }
        };

        $.ajax(settings_LOGIN).done(function (response) {
            var json_data = response
            location.href = "https://belfanti.ddns.net:8443/officina"
            if (json_data.error) {
                alert("Errore! " + json_data.error)
            } else {

            }


        });
    }

```



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

Qui sotto il codice lato server.

```js
//Route auth.js (AUTH/LOGIN)
router.post('/login', async (req, res) => {
    // leggo user e password dal body
    const username = req.body.username;
    const pin = req.body.pin;
    if (username != "" && pin != "") {
        const user = await modelManager.getUserAndRole(username, pin); //cerco nel DB
        if (user) {
            // Genero JWT
            const accessToken = jwt.sign({
                nome: user.nome,
                admin: user.is_admin
            }, privateKey);

            res.cookie('jwt', accessToken, { //inserisco jwt nel cookie
                httpOnly: true
            });
            res.send(200); //invio risposta all'utente
        } else {
            res.json({
                error: "Error"
            });
        }
    } else(res.json({
        error: "Error"
    }))
});
```

Ogni chiamata successiva verso la route /officina passa attraverso la funzione che verifica il JWT

```js
//route -> officina.js 
const authenticateJWT = (req, res, next) => {

    var login_cookie = req.cookies.jwt; //leggo il cookie e ottengo jwt
    if (login_cookie === undefined) {
        res.redirect("/auth"); //non hai un cookie, redirect a /auth
    } else {
        console.log(login_cookie);
        jwt.verify(login_cookie, privateKey, (err, user) => {
            if (err) {
                return res.sendStatus(403); //il cookie / jwt non è valido
            }
            console.log("Utente " + user + "valido");
            req.user = user;
            next();
        })
    }
}
```



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



![image-20210505101406707](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\image-20210505101406707.png)

Questo è lo script che avviene ogni volta che si preme il bottone

```js
<script>
    function accettaUtente(id_utente, new_state) {
        $.ajax({
            url: "https://belfanti.ddns.net:8443/officina/accettaUtente",
            type: "GET", //invia attraverso 
            data: {
                id_utente: id_utente,
                new_state: new_state
            },
            success: function (response) {
                alert(id_utente + " " + new_state)
            },
            error: function (xhr) {
                console.log("errore" + xhr)
                alert("Errore")
                //Do Something to handle error
            }
        });

    }
</script>
```



## Telegram BOT

Il bot di Telegram è costruito con la libreria **Telegraf**. 

> La scelta di utilizzare una versione più datata della libreria è legata alla presenza di maggiore documentazione rispetto a quella nuova, più complessa per chi è alle prime armi con Javascript e il funzionamento di Telegram.

Il bot **non utilizza il polling**, bensì utilizza un **Webhook** che punta a un **DynDNS** *(Vedi paragrafo di Sistemi per approfondimenti).*
L'utilizzo di Webhook, in relazione al compito e all'infrastruttura del bot, è stata la scelta migliore per risparmiare chiamate HTTP superflue.

### Funzionalità

Il bot presenta le seguenti funzionalità:

1. Stampa testo su **Immagine** 🀄
2. **Creazione** e **Impostazione Tags** 📑
3. Caricamento immagini 🔼

Il bot funziona interamente con **inline-keyboard**, così da semplificare l'esperienza di utilizzo per l'utente.

### 

#### Cambio e creazione tag ⚙️

Il secondo elemento della Tastiera permette di creare e associare un nome/tag al **Reostato** (immagine appena caricata.)

![image-20210504094829412](image-20210504094829412.png)

Per **mantenere la consistenza** è possibile:

- **Creare nuovi** Tag Reostati ➕
- **Ri-utilizzare** Tag esistenti 🔁

![image-20210504095057749](image-20210504095057749.png)





#### Stampa Testo

![image-20210504094744446](image-20210504094744446.png)

```js
//imageManager.js

async function aggiungiTesto(url, testo) {
    var myBuffer;
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); //carica font
    console.log("Ho caricato il font");
    var image = await Jimp.read(url);
    console.log("Ho scaricato il file")
    console.log(image.bitmap.width, image.bitmap.height, testo);
    
    await image.print(font, 30, 30, testo); //3. Scrivo su immagine
    await image.getBuffer(image.getMIME().toString(), (err, buffer) => {
      if (err) console.log(err)
      if (buffer) console.log("Buffer ottenuto correttamente");
      myBuffer = buffer;
    })

    return myBuffer

  }
```

I file vengono scambiati come buffer.

#### Upload ⚙️

```js
async function uploadFromBuffer(nome_file, buffer) {

  const mimeType = "image/jpeg";
  const filename = nome_file + Date.now().toString();

  /**
   * Imposto Credenziali con l'acccessToken
   */
  driveAuth.setCredentials({
    refresh_token: REFRESH_TOKEN
  })
  const drive = await google.drive({
    version: 'v3',
    auth: driveAuth
  });


  let bufferStream = new stream.PassThrough(); //creo buffer leggibile
  await bufferStream.end(buffer);
  return (await drive.files.create({ //imposto chiamata a Google Drive API
    resource: {
      name: filename,
      originalFilename: filename,
      parents: [folderUrl]
    },
    media: {
      mimeType: mimeType,
      body: bufferStream,
    },
    fields: '*'
  })).data
}
```



# CLI

Il programma da linea di comando utilizza solamente tre pacchetti:

- Axios (chiamate HTTP)
- Readline (I/O utente)
- Node-Downloader (Download sequenziale agevolato)



La **CLI** ha questo flow.

1. Utente imposta la **cartella di storage**
2. Utente **avvia** il programma
3. Client inizia il **polling** ogni 5 minuti sul server 
4. Client invia **GET** al server con **parametro la data dell'ultimo update ricevuto**
5. Server riceve chiamata ed esegue una chiamata all'API di google Drive con una **Query per ottenere le ultime immagini caricate dall'ultimo update**
6. Il Server risponde al client con un **array degli URL** delle immagini 
7. Il Client avvia il **download** sequenziale degli URL forniti e salva nella cartella di destinazione.

```js
//LASTO SERVER : route -> cli.js
router.get('/', async function (req, res) {
    var last_data = req.query.data; //ottengo parametro
    var last_images = await gDriveClient.listFiles(last_data); //ottengo array ultime immagini
    return res.json(last_images);
})
```

```js
//LATO SERVER : gDriveClient.js 

async function listFiles(dataUTC) {
  return new Promise(async function (resolve, reject) {
    driveAuth.setCredentials({
      refresh_token: REFRESH_TOKEN
    })
    const drive = await google.drive({
      version: 'v3',
      auth: driveAuth
    });

    console.log(dataUTC);
    //Richiedo lista
    drive.files.list({
      folderId: folderUrl,
      fields: "files/webContentLink",
      q: `modifiedTime > '${dataUTC}'` //Query per ottenere le immagini più nuove
    }, (err, res) => {
      /**
       * Callback
       */
      if (err) return console.log(dataUTC + ' The API returned an error: ' + err);
      var arr_file = [];
      const files = res.data.files;
      if (files.length) {
        /**
         * Se è stato trovato almeno un file...
         */
        console.log('Files:');
        files.map((file) => {
          console.log(file);
          arr_file.push(file.webContentLink);
        });
      } else {
        console.log('No files found.');
      }
      resolve(arr_file);
    });
  })

}
```



# Conclusione

Riguardando lo schema di rete inzialmente presentato, è possibile capire meglio la struttura del progetto.

![Untitled Diagram-Copy of Copy of Struttura di Rete](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\Untitled Diagram-Copy of Copy of Struttura di Rete.svg)



![documentazione_telegram_schemi-Struttura di Rete](C:\Users\Lorenzo\Documents\02 - Dev\02 - Scuola\00 - Pratiche\02 - Tpsit\000 - Teoria\docs\documentazione_telegram_schemi-Struttura di Rete.svg)