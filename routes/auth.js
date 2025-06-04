const express = require("express");


const router = express.Router();

router.get("/login",(req,res,next)=>{
    //const isLoggedIn = req.session.isLoggedIn;
    res.render("login",{
        pageTitle : "login In Page",
        
    });
});

router.post("/login",(req,res,next)=>{

    // console.log(req.body.username);
    // console.log(req.body.password);

    isLoggedInn = false;
    
    if( req.body.username === "Batoul" && req.body.password === "batoul123"){
        
        res.status(200);
        res.redirect("/admin/add-view-patient");
        // res.render(("/admin/add-view-patient"),{
        //     isLoggedInn: true,

        // });

    }else {
        res.redirect("/");
    }
});

module.exports = router;