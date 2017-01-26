var MongoClient= require("mongodb").MongoClient
var assert=require("assert");
var hash=require("password-hash");

var url="mongodb://localhost:27017/tek";

function getUserById(un,func){      //tells if username is taken
    MongoClient.connect(url,function(err,db){
        assert.equal(null,err);
        var result=1;   //username not taken set as default
        db.collection("user").find({"username":un}).count(function(err,docs){
            if(docs>0){
                result=0;    //username taken
            }else{
                result=1;
            }
            db.close();
            func(result);
        });    
    });
}

function login(un,pass,func){     //use this for login, returns entire user data
    MongoClient.connect(url,function(err,db){
        assert.equal(null,err);

        db.collection("user").find({"username":un}).toArray(function(err,doc){
            console.dir(doc);
            if(doc.length==1){
                if(hash.verify(pass,doc[0].password)){
                    func(1);
                }else{
                    func(0);
                }
            }
                
        });
    });
}
// usage
// getUser("babe","babe",function(res){
//     console.log(res);
// })
//ASAHTG used!!!!!!!!!!
function insertUser(user,func){ 
    getUserById(user.username,function(result){ //username taken?
        console.log(user);
        if(result==1){ //username not taken
            console.log(user.password);
            console.log(user.cpassword);
            console.log(user.password!=user.cpassword);
            if(user.password!=user.cpassword){ //confirm if password and confirm password match
                console.log("password no match");
                func(-1);   // -1 means passwords don't match   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                return;
            }
            var tek=user.tek; //seperate registration code for checks below
            delete user.tek; 
            delete user.cpassword; //confirm password no longer needed
            user.password=hash.generate(user.password);
            MongoClient.connect(url,function(err,db){
                assert.equal(null,err);
                //var doc=JSON.stringify(user)
                db.collection("user").find({"tek":tek}).toArray(function(err,res){
                    console.log("after check");
                    console.dir(res)
                    if(res.length==1 && res[0].username==null){
                        db.collection("user").updateOne({"tek":tek},{$set:user},function(err,res){
                            console.log("after update");
                            db.collection("user").find({"tek":tek}).toArray(function(err,res){
                                console.dir(res)
                                db.close();
                                func(1);  //user sucessfully registered       !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                            });
                        });
                    }else{
                        func(2); //registration code taken or invalid
                    }    
                    
                }); //check if registration code used by another user
                
            });     
        }else{
            func(0) //username taken                          !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        }
    });
}

function updateUser(user,func){
    MongoClient.connect(url,function(err,db){
        assert.equal(null,err);
        var tek=user.tek;
        delete user.tek;
        var res= db.collection("user").update({"tek":tek},{$set:user});
        //console.log(res);
        db.close();
        func(1); // update successfull
    });
}


//testing for registration    
// var user=new Object();
// var tek="ASAHTG";
// user.tek=tek;
// user.username="sidwa";
// user.password="babe";
// user.cpassword="babe";
// user.fn="sid";
// user.ln="red";
// user.email="sidwa@fmail.com";
// user.contact="91841081085";
// insertUser(user,function(res){
//     if(res==1){ 
//         console.log("user registered yeeeee");
//     }else if(res==0){
//         console.log("username taken");
//     }else if(res==-1){
//         console.log("babe"=="babe");
//         console.log("passwords don't match :(");
//     }else if(res==2){
//         console.log("registration code taken or invalid");
//     }
//     user.username=null;
//     user.password=null;
//     delete user.cpassword;
//     user.fn=null;
//     user.ln=null;
//     user.email=null;
//     user.contact=null;
//     MongoClient.connect(url,function(err,db){
//         assert.equal(null,err);
//         var result=1;   //username not taken set as default
//         db.collection("user").updateOne({"tek":tek},{$set:user},function(err,res){
//             console.log(err);
//             db.close();
//         }); 
//     });   
// });



module.exports.login=login;
module.exports.unTaken=getUserById;
module.exports.register=insertUser