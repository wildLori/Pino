/* 
Google Drive API:
IMPORTANTE! 
Questa è solo per fare le operazioni su Drive, si agisce sull'account BelfantiFamiglia
*/

const {
  google
} = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config({
  path: path.resolve(__dirname, '../private/.env')
})
var got = require('got');
const {
  Readable
} = require('stream');

var stream = require('stream');
var destroy = require('destroy');



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

async function uploadFile(nome_file, filePath) {

  const fileUrl = filePath;
  const mimeType = "image/jpeg";
  const filename = "immagine" + Date.now().toString();

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

  /**
   * Con il pacchetto GOT mi creo uno stream del file così da poterlo uppare subito su Drive
   */
  const body = await got.stream(fileUrl)
  console.log(body);
  return (await drive.files.create({
    resource: {
      name: filename,
      originalFilename: filename,
      parents: [folderUrl]
    },
    media: {
      mimeType,
      uploadType: "media",
      body,
    },
    fields: '*'
  })).data
}

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


  let bufferStream = new stream.PassThrough();
  await bufferStream.end(buffer);
  //console.log(bufferStream);
  //var stream = await Readable.from(Buffer.toString());
  return (await drive.files.create({
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
      q: `modifiedTime > '${dataUTC}'`
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


async function deleteFile(file_id) {
  try {
    const response = await drive.files.delete({
      fileId: 'YOUR FILE ID',
    });
    console.log(response.data, response.status);
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  uplo: uploadFile,
  list: listFiles,
  uploadFromBuffer: uploadFromBuffer,
  listFiles: listFiles
}