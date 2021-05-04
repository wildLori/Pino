# Documentazione Bot Telegram.

Ho deciso di creare un sistema che sfruttasse **Telegram** per semplificare il lavoro di organizzazione e sincronizzazione di immagini svolto da mio padre in azienda.
I suoi requisiti sono quelli di avere un sistema pratico e veloce che possa **classificare** ed eventualmente **aggiungere annotazioni** su **immagini**, e averle direttamente sul suo computer aziendale in una **specifica cartella.**

## Indice
[TOC]

# Stack tecnologie

### Strumenti 📏

- **DATABASE** : Sqlite 
- **RUNTIME** : Node.js
- **FRAMEWORK PRINCIPALE** :  Express.js
- **TEMPLATE ENGINE** : Ejs

Altre tecnologie :

- **CLOUD STORAGE** : Google Drive API
- **CLOUD AUTH** : OAuth
- **AUTHENTICATION** : JWT
- **TELEGRAM API :** Telegraf.js



# Attori Software

I componenti con cui interfacciarsi al sistema sono 3:

- Telegram BOT (Telegraf)
- SitoWeb
- CLI

## Telegram BOT

Il bot di Telegram è costruito con la libreria **Telegraf**.

Il bot **non utilizza il polling**, bensì utilizza un **Webhook** che punta a un **DynDNS** (Vedi paragrafo di Sistemi per approfondimenti).
L'utilizzo di Webhook, in relazione al compito e all'infrastruttura del bot, è stata la scelta migliore per risparmiare chiamate HTTP superflue.



L'applicazione presenta le seguenti funzionalità:

1. Stampa testo su **Immagine** 🀄
2. Creazione e Impostazione Tags 📑
3. Caricamento immagini 

Il bot funziona interamente con **inline-keyboard**, così da semplificare l'esperienza di utilizzo per l'utente.

### Funzionalità

Il bot di Telegram espone le seguenti funzionalità:

- GESTIONE **UTENTI AUTORIZZATI** 
- **STAMPA TESTO** SU IMMAGINE
- CREAZIONE E IMPOSTAZIONE DI **TAG** 
- SALVATAGGIO IMMAGINI IN **CLOUD** GOOGLE DRIVE



### Navigazione 🧭

La navigazione

Per intenderci, di seguito un esempio.

```
http://127.0.0.1:5500/#0 -> Animazione Iniziale 
http://127.0.0.1:5500/#1 -> Scelta Colore
http://127.0.0.1:5500/#2 -> Scelta Orientamento Schermo
http://127.0.0.1:5500/#3 -> Galleria Immagini
```

> Il contenuto dell'HTML viene cambiato dinamicamente in base alla location.hash



# Funzionalità

3. 

### Inserimento testo su Immagine 🎨

```
http://127.0.0.1:5500/#1 -> Scelta Colore
```

L'applicazione permette la generazione randomica di colori.
Ogni colore generato viene applicato al tema della pagina tramite variabile CSS.

![Inizio Schermata Generazione Colore](https://raw.githubusercontent.com/wildLori/Sfondino/main/assets/screen/image-20201208171000855.png)

Il colore può essere copiato in memoria con il click. [Vedi Codice per funzione di copia automatica]

![Copia Colore](https://raw.githubusercontent.com/wildLori/Sfondino/main/assets/screen/image-20201208171236893.png)

Il cambio di colore è dato da due funzioni:



### Classificazione Tag Reostati

```
http://127.0.0.1:5500/#2 -> Scelta Orientamento Schermo
```

La seconda schermata permette di scegliere il dispositivo per il quale cercare sfondi. Essenzialmente, questo permette di filtrare per sfondi **Landscape** (rapporto larghezza/altezza > 1) o sfondi **Portrait** (rapporto larghezza/altezza < 1). 

![image-20201208215035846](https://raw.githubusercontent.com/wildLori/Sfondino/main/assets/screen/sceglidispositivo.png)

### Ricerca 🔎

```
http://127.0.0.1:5500/#3 -> Durante il caricamento della terza sezione avviene la ricerca
```

Le precedenti scelte vanno ad aggiornare un JSON `Scelte`.

```json
var scelte = {
	keyword: "PAROLA PER RICERCA"
    colore: "#CODICE_ESADECIMALE_DEL_COLORE",
    orientation: "LANDSCAPE / PORTRAIT"
};
```

Questi parametri sono quelli che utilizzo personalmente al momento per 

#### Query ⚙️

La Stringa di Query che si crea, accetta i seguenti parametri.

```
 🔐 API KEY (obbligatorio) 	
```

> La API_KEY è univoca e personale. Viene fornita registrandosi alle API di Pexels.
> La API_KEY viene mandata nell'Header ogni volta che si effettua una richiesta.

```
🔖 KEYWORD (obbligatorio) :
```

> La Keyword predefinita è "Wallpaper". L'API richiede questo parametro obbligatoriamente.

```
🎨 COLORE (opzionale) : 
```

> Il colore è un parametro opzionale per l'API.
> Va inserito nel formato esadecimale #AABBCC senza l'Hashtag.

```
🔁 ORIENTAMENTO (opzionale):	
```

> L'orientamento è un parametro opzionale per l'API.
> Accetta come parametri le parole `landscape` (orizzontale) o `portrait` (verticale).

```
💯 QUANTITA IMMAGINI (opzionale, default = 15)
```

> La quantità di immagini returnate da ogni richiesta è un parmetro opzionale per l'API.
> Per permettere di navigare tra un numero sufficiente di immagini prima di eseguire una nuova richiesta all'API, utilizzo 15 immagini di default, in accordo con la documentazione dell'API.

#### Chiamata Ajax ⚙️

Sulla base dei parametri precedenti, viene effettuata una chiamata AJAX verso l'API di Pexels.

```javascript
function getQuery(keyword, verso, colore, next) {
    var testo = keyword;
    var mUrl;
    var mColore = colore.substr(1); //Colore senza "#"
	var testo = "wallpaper";
    
    mUrl = "https://api.pexels.com/v1/search?query=" + testo + "&color=" + mColore 			+ "&orientation=" + verso + "&per_page=15";
        //Creo richiesta GET asincrona [ AJAX ]
    $.ajax({
    	//Parametro 1: Tipo Richiesta
        method: 'GET',
        //Parametro 2: Inserisco nell'Header la CHIAVE DELL'API
        beforeSend: function(xhr) {
			xhr.setRequestHeader("Authorization", API_KEY);
        },
		//Parametro 3: URL
		url: mUrl,
        //Parametro 4 e 5: Callback Successo e Errore
        success: function(risposta) {
			mostrarispostaJSON(risposta);
            $("#immagineAttiva").fadeTo(400, 1.0)
        },
        error: function(errore) {
			console.log(errore);
		}
	});
```

#### Risposta API ⚙️

L'elaborazione della richiesta avviene Lato-Server dall'API. Di seguito un esempio di risposta dal Server

```json
{
  "id": 2014422,
  "width": 3024,
  "height": 3024,
  "url": "https://www.pexels.com/photo/brown-rocks-during-golden-hour-2014422/",
  "photographer": "Joey Farina",
  "photographer_url": "https://www.pexels.com/@joey",
  "photographer_id": 680589,
  "src": {
    "original": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg",
    "large2x": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?				auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "large": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?				auto=compress&cs=tinysrgb&h=650&w=940",
    "medium": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?				auto=compress&cs=tinysrgb&h=350",
    "small": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?				auto=compress&cs=tinysrgb&h=130",
    "portrait": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?			auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    "landscape": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?			auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    "tiny": "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?				auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280"
  }
}
```

Per semplicità, i parametri da me considerati sono i seguenti:

- Fotografo e URL del Fotografo
- Link alla versione originale, large e medium dell'immagine.

```json
{
  "photographer": "NOME_FOTOGRAFO",
  "photographer_url": "https://www.pexels.com/@NOME_FOTOGRAFO",
  "src": {
    "original": "https://images.pexels.com/photos/ID_FOTO/FOTO.JPEG",
    "large": "https://images.pexels.com/photos/ID_FOTO/FOTO.JPEG?								auto=compress&cs=tinysrgb&h=650&w=940",
    "medium": "https://images.pexels.com/photos/ID_FOTO/FOTO.JPEG?								auto=compress&cs=tinysrgb&h=350",
  }
}
```

L'interazione Client-API è quindi così riassunta:

<img src=".\assets\screen\Diagramma.svg" style="zoom:75%;" />



### Visualizzazione Risultati 👁‍🗨

#### Anteprima ⚙️

Le immagini ottenute vengono visualizzate con una grande anteprima in alto e al centro dello schermo.
Lo scorrimento avviene attraverso lo spostamento nell'Index.

![image-20201208224718163](https://raw.githubusercontent.com/wildLori/Sfondino/main/assets/screen/anteprima.png)

Questa prima immagine viene mostrata estraendo i dati dal JSON.

```javascript

function mostrarispostaJSON(risposta) {

    //Chiamata anteprima della prima risposta JSON
    immaginiOttenute = risposta; //Aggiorno JSON globale. Visibile agli altri.
    var mRispostaJS = risposta;
    mostraGalleria(risposta); //Costruisco Galleria
    prossima_pagina = mRispostaJS.next_page; //URL Pagina Prossimi Risultati
    mImage = mRispostaJS.photos[0].src.large; //URL Immagine large
    mAutore = mRispostaJS.photos[0].photographer; //Nome Fotografo
    mAutoreURL = mRispostaJS.photos[0].photographer_url; //URL Profilo Fotografo
    $('#immagineAttiva').attr("src", mImage); 
    $('#autore').text("📸 Autore : @" + mAutore);
    $('#autore').on("click", function() {
        window.open(mAutoreURL, '_blank')
    })
}
```

I 3 bottoni disponibili in seguito alla ricerca sono i seguenti:

![3 bottoni](https://github.com/wildLori/Sfondino/blob/main/assets/screen/Immagine%202020-12-08%20212942.png?raw=true)

| ![image-20201208214146252](https://raw.githubusercontent.com/wildLori/Sfondino/main/assets/screen/1.png) | ![image-20201208214201969](https://raw.githubusercontent.com/wildLori/Sfondino/main/assets/screen/2.png) | ![image-20201208214227736](https://raw.githubusercontent.com/wildLori/Sfondino/main/assets/screen/3.png) |
| ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| Tasto Download                                    | Tasto Cambia Colore                               | Tasto Ricerca Keyword                             |

#### Download ⚙️

Il download diretto è ostacolato dalla protezione XSS.
Per aggirare il problema, ho deciso di consentire il **download manuale** da una scheda separata.

```javascript
function openInNewTab(url) {
    //Splitto la stringa al "?" in modo da aprire la foto originale
    var sub = url.split("?");
    var mUrl = sub[0];
    var win = window.open(mUrl, '_blank');
    win.focus();
}
```

#### Nuova Ricerca ⚙️

Come detto sopra, la Keyword di ricerca predefinita è "Wallpaper". Tramite la <input> a comparsa è possibile cambiare la Keyword.

```js
jQuery("#ricercaQuery").on('keyup', function(e) {
//Controllo se l'utente ha schiacciato "Invio"
	if (e.key === 'Enter' || e.keyCode === 13) {
		var temp = jQuery("#ricercaQuery").val();
			//Controllo che non sia vuoto il campo
			if (temp == "" || temp == undefined) {
                alert("Non lasciare il campo vuoto.")
            } else {
                scelte.keyword = temp;
                $("#immagineAttiva").fadeTo(500, 0.0);
                setTimeout(function() {
                    getQuery(scelte.keyword, scelte.orientation, scelte.colore);
                }, 900);
            }}});
```

#### Autenticazione JWT ⚙️

L'autenticazione JWT funziona con questo flow:

1. L'utente carica la pagina /auth
2. 

```javascript
function mostraGalleria(immagini) {
    
    $('html,body').animate({
        scrollTop: $('#mioWrapperGalleria').offset().top
    }, 'slow');

    var galleria = document.getElementById('mioWrapperGalleria');
    galleria.focus();
    galleria.innerHTML = "";
    var quanti = 15; //Numero di riquadri predefinito
	// Scansione del mio JSON e aggiunta di ogni immagine alla Galleria
    for (let index = 0; index < quanti; index++) {
        const immagineGalleria = document.createElement("div");
        immagineGalleria.classList.add("immagineGalleria");
        var mFotografo = immagini.photos[index].photographer;
        var mUrl = immagini.photos[index].src.medium;
        immagineGalleria.innerHTML = `
            <img
                src="${mUrl}"
                alt=""
            />
            <div class="img-info card stretto">
                <p>${"@" + mFotografo}</p>
            </div>
        `;
        galleria.appendChild(immagineGalleria);
    };

}
```

![image-20201208230111736](https://raw.githubusercontent.com/wildLori/Sfondino/main/assets/screen/galleria.png)


## Nota sulla Responsiveness ❗

Come citato sopra, ho utilizzato la **Simple Grid CSS** per facilitarmi la costruzione e l'allineamento dei Div, senza dover ricorrere a un intero Framework (ad esempio *Bootstrap*).

Ho modificato e sovrascritto a piacimento la base proposta dalla Simple Grid.
Le animazioni sono fatte attraverso **jQuery** e attraverso alcuni custom **Keyframe CSS.**

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