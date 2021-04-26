  const Jimp = require('jimp');
  const drive_client = require('./gdrive_client')
  /**
   * Prendo una immagine e aggiungo il testo su di essa.
   * La posizione predefinita per ora è l'angolino in basso a destra
   * @url dell'immagine
   * @testo da aggiungere all'immagine
   */

  async function aggiungiTesto(url, testo = "TESTO BY LORENZO") {
    var myBuffer;

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    var image = await Jimp.read(url);
    await image.print(font, image.bitmap.width, image.bitmap.height, testo); //3. Scrivo su immagine

    image.getBuffer(image.getMIME().toString(), (err, buffer) => {
      if (err) console.log(err)
      if (buffer) console.log("Buffer ottenuto correttamente");
      myBuffer = buffer;
    })

    return myBuffer

  }


  module.exports = {
    aggiungiTesto: aggiungiTesto
  }