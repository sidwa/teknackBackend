var http = require("http");
var options = {
	hostname: 'localhost',
	port: 80,
	path: '',    //path used in router 
	method: 'POST',                                //request method get or post
	headers: {
		'Content-Type': 'application/json',
	}
};
//game
/*
Event name                - name to pass to the function
Mega Event                - megaPoints
Virtual Stock Market      - vsm
Terraverse                - terraverse
Auction it                - auctionIt
Online Treasure Hunt      - OTH
Planets Orb               - planetOrb
Deadly Exhaust Wat        - DEW
Chase Infinity            - chaseInfinity
space terra               - spaceTerra
Do or Die                 - DOD
Space Shuttle             - spaceShuttle
*/

/*
    backflip - 100
    
*/
function updateScore(game,score,username,func){
    options.path="/updateScore"
    var request = http.request(options, function(response) {
        console.log('Status: ' + response.statusCode);
        response.setEncoding('utf8');
        response.on('data', function (result) {               // on receiving data from server
            func(result);
        });
    });
    request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        func("error connecting "+e.message);
    });
    var x=new Object();
    x.game=game;
    x.score=score;
    console.log(JSON.stringify(x));
    var str='{"'+x.game+'":'+x.score+',"username":"'+username+'"}';
    //str=JSON.parse(str);
    //console.log(JSON.stringify(str));
    //str=JSON.stringify(str);
    // write data to request body
    request.write(str);  // sending JSON data as specified in the header
    request.end();
}

function getScore(game,username,func){
    options.path="/getScore"
    var request = http.request(options, function(response) {
        console.log('Status: ' + response.statusCode);
        response.setEncoding('utf8');
        response.on('data', function (score) {               // on receiving data from server
            func(score);
        });
    });
    request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        func("error connecting "+e.message);
    });
    var x=new Object();
    x.game=game;
    console.log(JSON.stringify(x));
    var str='{"username":"'+username+'"}';
    str=JSON.parse(str);
    console.log(JSON.stringify(str));
    //str=JSON.stringify(str);
    // write data to request body
    request.write(JSON.stringify(str));  // sending JSON data as specified in the header
    request.end();
}

function upmeg(username,valve,func){
    miley=valve
}

// usage for update score
updateScore("OTH",2000,"sidwa",function(result){
    console.log("result:"+result);
});

//usage for get score
//getScore("OTH","tekplayer",function(score){
//     console.log("score:"+result);
// });
module.exports.updateScore=updateScore;
module.exports.getScore=getScore;