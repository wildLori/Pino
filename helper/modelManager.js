//const sqlite3 = require('sqlite3').verbose(); //DEV 
const sqlite3 = require('sqlite3'); //PRODUCTION
const db_path = '/home/pi/Server/private/data/DB_Officina.db';
// var db;

//TODO: Vedi come funziona la connesione multipla, come si istanziano più sqliteManager
//

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
        db.run(query, [id_utente, nome_utente, isAdmin], function (err, rows) {
            if (err) {
                reject(err.message)
            } else {
                resolve(true)
                console.log("Aggiunto utente " + this.lastID)
            }
        })
    })
}
/**
 * Ottieni tutti gli utenti attualmente registrati nel DB
 * @returns rows
 */
exports.getAllUsers = function () {
    return new Promise(function (resolve, reject) {
        var query = `SELECT id_utente,nome,pending FROM utenti`
        this.db.all(query, function (err, rows) {
            if (err) reject("Read error: " + err.message)
            else {
                resolve(rows)
            }
        })
    })
}

/**
 * Ottieni tutti gli utenti attualmente abilitati nel DB
 * @returns 
 */
exports.getAllAllowedUsers = function () {
    return new Promise(function (resolve, reject) {
        var query = `SELECT id_utente FROM utenti WHERE pending=0`
        this.db.all(query, function (err, rows) {
            if (err) reject("Read error: " + err.message)
            else {
                resolve(rows)
            }
        })
    })
}

/**
 * Ottieni tutti gli utenti attualmente in attesa di abilitazione nel DB
 * @returns 
 */
exports.getAllPendingUsers = function () {
    return new Promise(function (resolve, reject) {
        var query = `SELECT id_utente FROM utenti WHERE pending=1`
        this.db.all(query, function (err, rows) {
            if (err) reject("Read error: " + err.message)
            else {
                resolve(rows)
            }
        })
    })
}
/**
 * Verifica se un utente è nel DB
 * @returns 
 */
exports.getUser = function (id_utente) {
    return new Promise(function (resolve, reject) {
        var query = `SELECT id_utente FROM utenti WHERE id_utente=? AND pending=0`
        this.db.all(query, [id_utente], function (err, rows) {
            if (err) {
                reject(false)
                console.error("Errore nell'ottenere l'utente con questo ID " + id_utente);
            } else {
                if (rows.length < 1) {
                    console.log(rows);
                    resolve(false);
                } else {
                    console.log("Si ho trovato l'utente " + rows)
                    resolve(true);
                }

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