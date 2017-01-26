var express=require("express");
var app=express();
bodyparser=require("body-parser");
session=require("client-sessions");


var db=require("./db.js")
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
    req.body.tek=req.body.register_code;
	delete req.body.register_code;
	db.register(req.body,function(result){
		console.log("result:"+result);
		switch(result){
			case -1:res.send("passwords don't match");
				break;
			case 0:res.send("username taken");
				break;
			case 1:res.send("/login.html");
				break;
			case 2:res.send("registration code taken or invalid");
				break;
			//default:res.send("err"); 
		}
		res.end();
	});
});

app.post("/login",function(req,res){
	console.dir(req.body);
    db.login(req.body.username,req.body.password,function(result){
		if(result==1){
			res.send("/home/");
		}else{
			res.send("login failed");
		}
		res.end();
	});
});

app.listen(80,function(){
    console.log("server running");
});

