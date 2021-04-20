/* 
Google Drive API:
Dimostrazione per fare:
- 1. Upload
*/

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../private/.env') })

/**
 * Dati dell'account di Google Drive
 */
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; //Callback
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2( //Il mio Oggetto che espone i dati del client
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI //Callback, Redirect
);

async function uploadFile(accessToken,objPhoto) {
  /**
   * Imposto Credenziali con l'acccessToken
   */
  oauth2Client.setCredentials({ access_token: accessToken });
  /**
  * L'oggetto DRIVE è il mio oggetto che fa richieste Drive, con il mio OAuthClient
  */
  var drive = google.drive({
  version: 'v3',
  auth: oauth2Client, 
  });

  /**
   * Caricamento file
   */

  try {
    const response = await drive.files.create({
      requestBody: {
        name: 'upload.jpg', //This can be name of your choice
        mimeType: 'image/jpg',
      },
      media: {
        mimeType: 'image/jpg',
        body: objPhoto,
      },
    });

    console.log(response.data);
  } catch (error) {
    console.log(error.message);
  }
}

//uploadFile();
async function deleteFile() {
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
  upload : uploadFile
}