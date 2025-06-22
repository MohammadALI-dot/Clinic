// const mysql=require("mysql2");


// const pool=mysql.createPool({
//     host:"localhost",
//     user:"root",
//     password:"1234",
//     database:"about_patients"
// });

// module.exports=pool.promise();


//for web
// require("dotenv").config(); // Load environment variables from .env

// const mysql = require("mysql2");

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT
// });

const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || "about_patients"
});

module.exports = pool.promise();
