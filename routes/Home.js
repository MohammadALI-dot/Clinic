const express = require("express");
const { route } = require("./admin");


const router = express.Router();


router.get("/",(req,res,next)=>{

    res.render("HomePage",{
        pageTitle : "Home Page"
    })

});

router.get("/services",(req,res,next)=>{
    res.render("services", {
        pageTitle: "Service Page"
    });
})

router.get("/about",(req,res,next)=>{

    res.render("aboutUs",{
        pageTitle : "AboutUs"
    })

})


module.exports = router;