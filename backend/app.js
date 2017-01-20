var express=require("express");
var app=express();
bodyparser=require("body-parser");
session=require("client-sessions");

// app.get("/",function(req,res){
//     res.sendFile(__dirname+"/www/index.html");
//     //res.sendFile(__dirname+"/www/index.js");
//     console.log("sent js");
// });
app.use("/",express.static(__dirname+"/www"));

var username=[];

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json({type:"application/json"}));

app.use(session({                //
	cookieName: "sess",
	secret: "don'thack!!",
	duration: 30 * 60 * 1000, //30 min session duration
	activeDuration: 5 * 60 * 1000 //5 min active session
}));

app.use("/home/", function (req, res, next) {   //check if session started
	console.log("requesting home");
	if (!req.sess.username) {
		res.redirect("/index.html");
		next();
	} else {
		next();
	}
});

app.use("/",express.static(__dirname+"/www"));

app.post("/register",function(req,res){
    if(username.indexOf(req.body.username)==-1){
        username.push(req.body.username);
        console.log(username);
        res.send("registered!")
    }else{
        res.send("taken!!")
    }
    res.end();
});



app.listen(80,function(){
    console.log("server running");
});

