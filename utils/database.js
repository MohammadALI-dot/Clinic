// const mysql=require("mysql2");


// const pool=mysql.createPool({
//     host:"localhost",
//     user:"root",
//     password:"1234",
//     database:"about_patients"
// });

// module.exports=pool.promise();


//for web


require('dotenv').config(); // Load .env in development

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

module.exports = pool.promise();
