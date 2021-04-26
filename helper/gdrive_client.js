/* 
Google Drive API:
IMPORTANTE! 
Questa è solo per fare le operazioni su Drive, si agisce sull'account BelfantiFamiglia
*/
/**
 * //TODO:
 * - 
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

  var stream = await Readable.from(myBuffer.toString());
  return (await drive.files.create({
    resource: {
      name: filename,
      originalFilename: filename,
      parents: [folderUrl]
    },
    media: {
      mimeType,
      uploadType: "media",
      stream,
    },
    fields: '*'
  })).data
}




async function createFolder(filePath) {
  /**
   *  
   */
}

async function listFiles(param_pageSize = 10) {
  driveAuth.setCredentials({
    refresh_token: REFRESH_TOKEN
  })
  const drive = await google.drive({
    version: 'v3',
    auth: driveAuth
  });

  //Richiedo lista
  /**
   * @param 1: Parametri
   * @param 2: Callback
   */
  drive.files.list({
    pageSize: param_pageSize, //Numero di items da mostrare
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    /**
     * Callback
     */
    if (err) return console.log('The API returned an error: ' + err);

    const files = res.data.files;
    if (files.length) {
      /**
       * Se è stato trovato almeno un file...
       */
      console.log('Files:');
      files.map((file) => { //TODO: Per Telegram : invia l'oggetto file, e poi fa un file.map da telegram.
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
    return (files);
  });
}


/**
 * Lists the recent activity in your Google Drive.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listDriveActivity(auth) {
  const service = google.driveactivity({
    version: 'v2',
    auth
  });
  const params = {
    'pageSize': 10,
  };
  service.activity.query({
    requestBody: params
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const activities = res.data.activities;
    if (activities) {
      console.log('Recent activity:');
      activities.forEach((activity) => {
        const time = getTimeInfo(activity);
        const action = getActionInfo(activity.primaryActionDetail);
        const actors = activity.actors.map(getActorInfo);
        const targets = activity.targets.map(getTargetInfo);
        console.log(`${time}: ${truncated(actors)}, ${action}, ` +
          `${truncated(targets)}`);
      });
    } else {
      console.log('No activity.');
    }
  });
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
  upload: uploadFile,
  list: listFiles,
  uploadFromBuffer: uploadFromBuffer
}