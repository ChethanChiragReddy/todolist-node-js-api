const mysql = require("mysql");
const dbConfig = require("../config/db.config.js");

var connection = mysql.createConnection({
  host: dbConfig.HOST,
  port:dbConfig.PORT,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  insecureAuth : true
});

module.exports = connection;