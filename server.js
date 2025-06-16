require("dotenv").config(); // load .env variables

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const adminRoute = require("./routes/admin");
const homeRoute = require("./routes/Home");
const authRoute = require("./routes/auth");

const app = express();

const options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

const sessionStore = new MySQLStore(options);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        key: "session_cookie_name",
        secret: "my secret",
        resave: false,
        saveUninitialized: false,
        store: sessionStore
    })
);

sessionStore.onReady()
    .then(() => {
        console.log("MySQL store ready");
    })
    .catch((error) => {
        console.log(error);
    });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/admin", adminRoute);
app.use(homeRoute);
app.use("/auth", authRoute);

app.use((req, res, next) => {
    res.status(404).render("404", {
        pageTitle: "This page is not found!"
    });
});

// Render will inject PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});
