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


app.use(session({                
	cookieName: "sess",
	secret: "134klh389dbcbsldvn1mcbj",
	duration: 30 * 60 * 1000, //30 min session duration
	activeDuration: 5 * 60 * 1000, //5 min active session
	cookie: {
		domain: '.teknack.in',
		path: '/',
    		maxAge: 30*60000, // duration of the cookie in milliseconds, defaults to duration above
		httpOnly: true, // when true, cookie is not accessible from javascript
		secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
	}
}));

app.use("/home",function (req, res, next) {   //check if session started
	if (!req.sess.username){
		console.log("redirecting cookie not found");
		res.redirect("/login.html");
		//next();
	} else {
		next();
	}
});




app.post("/register",function(req,res){
    req.body.tek=req.body.register_code;
	delete req.body.register_code;
	db.register(req.body,function(result){
		console.log("result:"+result);
		var d=new Object();
		switch(result){
			case -1:d.response="passwords don't match";
					d=JSON.stringify(d);
					res.send(d);
				break;
			case 0:d.response="username already taken";
					d=JSON.stringify(d);
					res.send(d);
				break;
			case 1:d.response="success";
					d=JSON.stringify(d);
					res.send(d);
				break;
			case 2:
					d.response="registration code taken or invalid";
					d=JSON.stringify(d);
					res.send(d);
				break;
			//default:res.send("err"); 
		}
		res.end();
	});
});

app.post("/login",function(req,res){
	if(req.body.username=="admi" && req.body.password=="astalavista"){
		req.sess.username=req.body.username;
		res.send("success");
	}else if(req.body.username=="mit" && req.body.password=="procoder"){
		req.sess.username=req.body.username;
                res.send("success");
        }else if(req.body.username=="jeks" && req.body.password=="gandu"){
		req.sess.username=req.body.username;
                res.send("success");
        }else if(req.body.username=="nish" && req.body.password=="ninja"){
		req.sess.username=req.body.username;
                res.send("success");
        }else{
//      db.login(req.body.username,req.body.password,function(result){
//		if(result==1){
//			req.sess.username=req.body.username;
//			res.send("success");
//		}else{
//			res.send(-1);
//		}
//		res.end();
//	});
		res.send("login is not working yet");
	}

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


app.get("/session",function(req,res){ //sends string
	res.send(req.sess);
});

app.post("/updateScore",function(req,res){ //sends string
	var user=req.body;
	if(user!=null && user.password=="ahjc135kbahjd19357"){
		db.updateScore(user,function(result){
			if(result==1){
				res.send("1");
			}else{
				res.send("0");
			}
		});
	}else{
		res.send("invalid data")
	}
});

app.post("/getScore",function(req,res){ //sends string
	var user=req.body;
	db.getScore(user,function(score){
		score=score.toString();
		res.send(score);
	});
});

app.post("/updateMega",function(req,res){ //sends string
	var user=req.body;
	if(user!=null && user.password=="iqwurg4609dkshiuyqr"){
		delete user.password;
		db.updateMega(user,function(result){
			if(result==1){
				res.send("1");
			}else{
				res.send("0");
			}
		});
	}else{
		res.send("invalid data");
	}
});

app.post("/getMega",function(req,res){ //sends string
	var user=req.body;
	db.getMega(user,function(score){
		score=score.toString();
		res.send(score);
	});
});

app.post("/getNames",function(req,res){
	var un=req.body.username;
	var pass=req.body.password;
	if(pass=="oihcbja31jchb391#2"){
		db.getNames(un,function(names){
			res.send(names);
		});
	}else{
		res.send("invalid data")
	}
		
});

app.use("/",express.static(__dirname+"/www"));

app.listen(3000,function(){
	console.log("server running at port 3000");
});

