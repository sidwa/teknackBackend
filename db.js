var MongoClient= require("mongodb").MongoClient
var assert=require("assert");


var url="mongodb://localhost:27017/tek";

function getUser(un,pass,func){
    MongoClient.connect(url,function(err,db){
        assert.equal(null,err);
        var result=[]
        var docs= db.collection("user").find({$and: [{"username":un},{"pass":pass}]});
            docs.each(function(err,doc){
                console.log(doc);
                result.push(doc);
            });
        db.close();
        func(result)
    });
}

getUser("babe","babe",function(res){
    console.log(res);
})