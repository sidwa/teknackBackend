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


var username=[];

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json({type:"application/json"}));

app.use(session({                //
	cookieName: "sess",
	secret: "don'thack!!",
	duration: 30 * 60 * 1000, //30 min session duration
	activeDuration: 5 * 60 * 1000 //5 min active session
}));

app.use("/home", function (req, res, next) {   //check if session started
	if (!req.sess.username) {
		console.log("redirecting cookie not found");
		res.redirect("/index.html");
		//next();
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
			case 1:res.send({"path":"/login.html"});
				break;
			case 2:res.send("registration code taken or invalid");
				break;
			//default:res.send("err"); 
		}
		res.end();
	});
});

app.post("/login",function(req,res){
    db.login(req.body.username,req.body.password,function(result){
		if(result==1){
			req.sess.username=req.body.username;
			res.send({"path":"/home/index.html"});
		}else{
			res.send(-1);
		}
		res.end();
	});
});

app.get("/logout",function(req,res){
	console.log(req.sess);
	req.sess.reset();
	console.log(!req.sess.username);
	console.log("session"+req.sess.username);
	res.redirect("/login.html");
	res.end();
});

app.post("/getQuestion",function(req,res){ //sends string
	var un=req.body.username;
	db.getUserQuestion(un,function(result){
		if(result!=0){
			res.send(result);
		}else{
			res.send("user not found");
		}
	});
});

app.post("/resetPass",function(req,res){ //sends string
	var u=req.body;
	if(u.password==u.cpassword){
		delete u.cpassword;
		db.resetPass(u,function(result){
			if(result==1){
				res.send("password reset");
			}else{
				res.send("security question's answer is wrong")
			}
		});
	}else{
		res.send("passwords don't match");
	}
});


app.listen(process.argv[2],function(){
    console.log("server running at port "+process.argv[2]);
});

