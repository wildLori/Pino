//const sqlite3 = require('sqlite3').verbose(); //DEV 
const sqlite3 = require('sqlite3'); //PRODUCTION
const db_path = '/home/pi/Server/private/data/DB_Officina.db';
var db;

/**
 * ❤ NEW PROMISE APPROACH
 */

exports.db = db;

exports.apriDB = function () {
    return new Promise(function (resolve) {
        this.db = new sqlite3.Database(db_path,
            function (err) {
                if (err) reject("Open error: " + err.message)
                else resolve(db_path + " aperto")
            }
        )
    })
}

exports.chiudiDB = function () {
    return new Promise(function (resolve, reject) {
        this.db.close()
        resolve(true)
    })
}

/**
 * 👤 USER MANAGER 👤
 */

/**
 * Aggiungi un utente al DB.
 * @param {} id_utente 
 * @param {*} nome_utente 
 * @param {*} isAdmin 
 * @returns 
 */
exports.addUser = function (id_utente, nome_utente, isAdmin = 0) {
    let query = `INSERT OR IGNORE into utenti (id_utente,nome,is_admin) 
    values (?,?,?)`
    return new Promise(function (resolve, reject) {
        this.db.run(query, [id_utente, nome_utente, isAdmin], function (err, rows) {
            if (err) {
                reject(err.message)
            } else {
                console.log("Aggiunto utente " + this.lastID)
            }
        })
    })
}
/**
 * Ottieni tutti gli utenti attualmente registrati nel DB
 * @returns 
 */
exports.getAllUsers = function () {
    return new Promise(function (resolve, reject) {
        var query = `SELECT id_utente FROM utenti`
        this.db.all(query, function (err, rows) {
            if (err) reject("Read error: " + err.message)
            else {
                resolve(rows)
            }
        })
    })
}

/**
 * Elimino dal DB un utente passando il suo id telegram
 * @param {*} utente_da_eliminare 
 * @returns 
 */
exports.deleteUser = function (utente_da_eliminare) {
    return new Promise(function (resolve, reject) {
        var query = `DELETE from utenti WHERE utenti.id_utente = ?`
        this.db.run(query, [utente_da_eliminare], function (err, rows) {
            if (err) reject("Errore nell'eliminazione di " + utente_da_eliminare)
            else {
                resolve(true)
            }
        })
    })
}


/**
 * 🔨 REOSTATO MANAGER 🔨
 */

exports.addReostato = function (nome_reostato) {
    let query = `insert or ignore into reostati (nome)
                values (?)`
    return new Promise(function (resolve, reject) {
        this.db.run(query, [nome_reostato], function (err) {
            if (err) {
                reject(err.message)
            } else {
                console.log("Aggiunto reostato " + this.lastID)
                resolve(true)
            }
        })
    })
}

exports.getAllReostati = function () {
    let query = `select reostati.nome from reostati`;
    return new Promise(function (resolve, reject) {
        this.db.all(query, [], function (err, rows) {
            if (err) reject(err.message)
            else {
                resolve(rows);
            }
        })
    })
}