const express = require('express')
const path = require('path');
const router = express.Router();
require('dotenv').config({
    path: path.resolve(__dirname, '../private/.env')
})
const gDriveClient = require('../helper/gdrive_client');

//https://belfanti.ddns.net:8443/cli?data=........
router.get('/', async function (req, res) {
    var last_data = req.query.data;
    console.log(last_data);

    var last_images = await gDriveClient.listFiles(last_data);

    return res.send(last_images);
})
module.exports = router;