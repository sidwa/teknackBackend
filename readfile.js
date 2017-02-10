var fs=require("fs")
var assert=require("assert");
var MongoClient= require("mongodb").MongoClient

var data=fs.readFileSync("extra.txt"); //read from the codes file
data=data.toString().split("\n"); //store each code as an element in array
var obj;

for(var i=0;i<data.length;i++){   //convert each code to JSON string
    obj=data[i];
    data[i]=new Object();
    data[i].tek=obj;
}

//console.log(data);
var url="mongodb://backend:asslover@localhost:27017/tek";

function addCode(){               //add all codes to mongo
    MongoClient.connect(url,function(err,db){
        assert.equal(null,err);
        db.collection("user").insertMany(data,function(err,resp){
            //console.dir("verifying user for login"+doc);
            assert.equal(null, err);
            assert.equal(data.length, resp.insertedCount);
            console.log(data);
            db.close();   
        });
    });
}

addCode();
