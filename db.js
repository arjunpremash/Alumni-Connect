const mysql = require("mysql");

var connection = mysql.createConnection({  //mysql connection
    host: "localhost",
    user: "root",
    password: "",
    database : "a_connect",
    multipleStatements : true,
    });

module.exports = connection;