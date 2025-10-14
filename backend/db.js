const Datastore = require("nedb-promises");
const usersDB = new Datastore({filename: "users.db",autoload: true});

module.exports = usersDB;