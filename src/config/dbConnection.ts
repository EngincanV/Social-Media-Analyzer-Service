var mysql = require('mysql');
import dbConfig from "./dbconfig";

var pool = mysql.createPool(dbConfig);

module.exports = pool;