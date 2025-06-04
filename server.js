const express = require("express")
const bodyParser=require("body-parser");
const path=require("path");
const cors=require("cors");
const app = express();
const adminRoute = require("./routes/admin");
const homeRoute = require("./routes/Home");
const authRoute = require("./routes/auth");
const session=require("express-session");
const MySQLStore=require("express-mysql-session")(session);

// In your Express app (likely app.js or server.js)
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'about_patients'
});

const sessionStore = new MySQLStore(options);

app.set("view engine","ejs");

app.set("views","views");


app.use(cors());

app.use(express.static(path.join(__dirname,"public")));
app.use(express.static(path.join(__dirname, '/')));

app.use(
    session({
        key : "session_cookie_name", 
        secret:'my secret',
        resave:false,
        saveUninitialized:false,
        store : sessionStore
    })
);


sessionStore
    .onReady().then(()=>{
        console.log("MySQLstore ready") //if  I read print MySql read
    }).catch((error)=>{
        console.log(error);
    });


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


app.use("/admin",adminRoute);

app.use(homeRoute);

app.use("/auth",authRoute);

app.use((req,res,next)=>{
    
res.status(404).render("404",
    {pageTitle:"This page is not found!",
    //isAuthenticated : req.session.isLoggedIn,
    });


});



const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Running on port ${PORT}`);
});
