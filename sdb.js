var mysql = require("mysql");
var rng = require("./rng");
var app = require("./app");

var conn = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "casino"
});

function startConnect() {
    conn.connect(function (err) {
        if (err) {
            console.log("error connecting to DB " + err);
            return;
        }
		console.log("connected");
    });
}

function terminate() {
    conn.end(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("connection closed");
        }
    });
}

function insert(table, values) {
    var sql = "INSERT INTO " + table + " SET ?;";
    var preps = values;
    sql = mysql.format(sql, preps);
	//console.log(sql);
    conn.query(sql, function (err, result) {
        if (err) { console.log(sql); throw err; };
        console.log(result.insertId + "row inserted");
    });
}

function isUnTaken(username, func) {
	var sql = "SELECT username FROM players WHERE username=?;";
	sql = mysql.format(sql, username);
	conn.query(sql, function (err, result, fields) {
		if (err) {
			console.log(sql);
			throw err;
		}
		if (result.length > 0) {
			func("taken");
		} else {
			func("not taken");
		}

	});
}

function register(register_id, username, password, func) {
	isUnTaken(username, function (str) {
		var ret=new Object();
		var gamePath = "carousel/index.html";
		var rejPath = "index.html";
		if (str == "not taken") {
			var sql = "UPDATE players SET username=?, password=?, register=1 WHERE register_id=? and register=0;";
			var preps = [username, password, register_id];
			sql = mysql.format(sql, preps);
			conn.query(sql, function (err, result, fields) {
				if (err) {
					console.log(sql);
					throw err;
				}
				if(result.affectedRows>0){
					ret.stat="ok";
					ret.path=gamePath;
					func(JSON.stringify(ret));
				}
				else{
					ret.stat="not ok";
					ret.path=rejPath;
					func(JSON.stringify(ret));		
				}
			});
		} else {
			ret.stat="not ok";
			ret.path=rejPath;
			func(JSON.stringify(ret));
		}
	});
}

function getPlayer(username,game_id,func){
	var ret=new Object();
	var sql="SELECT coins FROM players WHERE username='"+username+"';";
	conn.query(sql,function(err,result,fields){
		if(err) console.log(sql);

		ret.username=username;
		ret.coins=result[0].coins;
		if(game_id==1){
			sql="SELECT colour_id FROM lobby_user WHERE lobby_id>10 and username='"+username+"';";
			conn.query(sql,function(err,res,fields){
				if(err) console.log(err);

				ret.color=res[0].colour_id;
				console.log(ret);
				//console.log(ret);
				func(JSON.stringify(ret));
			});
		}
	});
}

function selectPlayer(username, password, func) {
    //startConnect();
    //console.log("in");
    var sql = "SELECT * FROM players WHERE username=? and password=?";
    //var sql="SELECT * FROM players WHERE true";
    var preps = [username, password];
    sql = mysql.format(sql, preps);
    console.log(sql);
    conn.query(sql, function (err, results, fields) {
        if (err) { console.log(sql); throw err; };

        func(results);
    });
    //terminate();
}

function selectPlayersLobby(lobby_id, func) { //select all player in a lobby
	var sql = "SELECT username FROM lobby_user WHERE lobby_id=" + lobby_id + ";";
	conn.query(sql, function (err, result, fields) {
		if (err) {
			console.log(sql);
			throw err;
		}
		var ret = [];
		for (var i = 0; i < result.length; i++) {
			ret[i] = new Object();
			ret[i] = { username: result[i].username };
		}
		//console.log(ret);
		(function asynLoop(i) {
			if (i >= result.length) {
				func(ret);
				return;
			} else {
				var sql1 = "SELECT colour_id FROM lobby_user WHERE username='" + result[i].username + "' and lobby_id=" + lobby_id + ";";
				conn.query(sql1, function (err, res, fields) {
					if (err) {
						console.log(sql1);
						throw err;
					}
					ret[i].color = res[0].colour_id;
					var sql2 = "SELECT coins FROM players WHERE username='" + result[i].username + "';";
					conn.query(sql2, function (err, re, fields) {
						if (err) {
							console.log(sql1);
							throw err;
						}
						ret[i].coins = re[0].coins;
						//console.log(ret);
						asynLoop(i + 1);
					});

				});
			}
		})(0);
	});
}

function removePlayerFromLobbies(player, func) { //returns all lobbies player was a part of
	var sql1 = "SELECT lobby_id FROM lobby_user WHERE username='" + player + "';";
	conn.query(sql1, function (err, res, fields) {
		if (err) { console.log(sql1); throw err; };

		var sql = "DELETE FROM lobby_user WHERE username='" + player + "';";
		conn.query(sql, function (err, result) {
			if (err) { console.log(sql); throw err; };
			console.log(player + " left lobby all lobbies")
			func(res);
		});
	});
}

function isFirstBet(iftrue, iffalse) {
    var sql = "SELECT COUNT(th) FROM bets;";
    conn.query(sql, function (err, result, fields) {
        if (err) { console.log(sql); throw err; };


        if (result[0]["COUNT(th)"] == 0) {
			console.log("first bet");
			iftrue();
        }
        else {
            console.log(result);
            console.log(result[0]["COUNT(th)"] == 0);
			iffalse();
        }
    });
}

function getPlayerLobby(username, func) {
    var sql = "SELECT lobby_id FROM lobby_user WHERE username='" + username + "';";
    conn.query(sql, function (err, result, fields) {
        if (err) { console.log(sql); throw err; };

        //console.log(result);
        if (result.length != 0) {
			//console.log("proper");
			//console.log(result);
			func(result);
		}
        else {
			func(result);
		}
    });
}

function getBets(lobby_id, func) {
	getRn(lobby_id, function (rn) {
		var sql = "SELECT username FROM lobby_user WHERE lobby_id=" + lobby_id + ";";
		conn.query(sql, function (err, result, fields) {
			if (err) { console.log(sql); throw err; };
			var ret = [];
			//console.log(result);
			//console.log("length=" + result.length);
			(function asyncLoop(i) {
				if (i >= result.length) {
					console.log("end");
					func(ret);
				} else {
					//console.log(i);
					//console.log(result[i]);
					var sql1 = "SELECT * FROM bets WHERE username='" + result[i].username + "';";
					conn.query(sql1, function (err, result1, fields) {
						if (err) {
							console.log("query" + sql1);
							throw err;
						}
						console.log(result1);
						for (var j = 0; j < result1.length; j++) {
							result1[j].rn = rn;
							ret.push(result1[j]);
						}
						asyncLoop(i + 1);
					})
				}
			})(0);
		});
	});
}

function setTimer(lobby_id) {
	var currTime = Date.now() / 1000 | 0; //to set unix epoch time
	var sql1 = "SELECT special1 FROM lobby WHERE lobby_id=" + lobby_id + ";";
	conn.query(sql1, function (err, r, fields) {
		if (err) { console.log(sql); throw err }

		if (r[0].special1 == null) {
			var sql = "UPDATE lobby SET special1='" + currTime + "' WHERE lobby_id=" + lobby_id + ";"; //set unix epoch time
			conn.query(sql, function (err, result) {
				if (err) { console.log(sql); throw err; };

				console.log("timestamp set for lobby:" + lobby_id);
				rng.Raand("roullete", [0], function (rn) { //set random number for lobby
					var sql = "UPDATE lobby SET special2='" + rn + "' WHERE lobby_id=" + lobby_id + ";";
					conn.query(sql, function (err, result) {
						if (err) { console.log(sql); throw err; };

						console.log("Random number set for lobby:" + lobby_id);
						console.log("round started for lobby" + lobby_id);
					});
				});
			});
		} else {
			var sql = "UPDATE lobby SET special1=NULL WHERE lobby_id=" + lobby_id + ";";
			conn.query(sql, function (err, result) {
				if (err) { console.log(sql); throw err; }

				console.log("no more bets for lobby:" + lobby_id);
			})
		}
	});
}


function putBets(jsonObject) {
	//startConnect()
    var bets = JSON.parse(jsonObject);
	console.log(bets);
	if(bets.length){
		table = "bets";
		(function asyncLoop(i) {
			if (i >= bets.length) {
				console.log("bet placed");
				return;
			} else {
				var bet=new Object(); 
				bet.username=bets[i].username;
				bet.th=bets[i].th;
				bet.fi=bets[i].fi;
				bet.hu=bets[i].hu;
				bet.slots=bets[i].slot.toString();
				insert(table, bet);
				asyncLoop(i + 1);
			}
		})(0);
	}
}

function getRn(lobby_id, func) {
	sql = "SELECT special2 FROM lobby WHERE lobby_id=" + lobby_id + ";";
	conn.query(sql, function (err, result, fields) {
		if (err) {
			console.log(sql);

			throw err;
		}
		//console.log(result);
		func(result[0].special2);
	});
}


function timerSet(lobby_id, func) {
	sql = "SELECT special1 FROM lobby WHERE lobby_id=" + lobby_id + ";";
	conn.query(sql, function (err, result, field) {
		if (err) { console.log(sql); throw err; };

		func(result[0].special1);
	});
}

function isInt(a, func) {
	if (a % 1 === 0 && a > 0) { //checking if integer
		func();
	}
}


function satisfies(num, slots, func) {   //to check which slot satisfied
	console.log(num + " vs " + slots);
	//if(num!="00") num=parseInt(num,10);
	var wheel = ["0", "28", "9", "26", "30", "11", "7", "20", "32", "17", "5", "22", "34", "15", "3", "24", "36", "13", "1", "00", "27", "10", "25", "29", "12", "8", "19", "31", "18", "6", "21", "33", "16", "4", "23", "35", "14", "2"];
	slots = slots.split(",");
	//2to1_3 el=3+(n-1)3;
	//2to1_2 el=2+(n-1)3;
	//2to1_1 el=1+(n-1)3;
	if (slots.length == 1) {
		console.log("single bet");
		if (slots[0] == "0" && num == "0") {
			func(35);
		} else if (slots[0] == "00" && num == "00") {
			func(35);
		} else if (slots[0] == "2to1_3") { //top row
			var x = ((num - 3) / 3) + 1;
			isInt(x, function () {
				func(2);
			});
		} else if (slots[0] == "2to1_2") { //top row
			var x = ((num - 2) / 3) + 1;
			isInt(x, function () {
				func(2);
			});
		} else if (slots[0] == "2to1_1") { //top row
			var x = ((num - 1) / 3) + 1;
			isInt(x, function () {
				func(2);
			});
		} else if (slots[0] == "1st12" && num >= 1 && num <= 12) {
			func(2);
		} else if (slots[0] == "2nd12" && num > 12 && num <= 24) {
			func(2);
		} else if (slots[0] == "3rd12" && num > 24 && num <= 36) {
			func(2);
		} else if (slots[0] == "1to18" && num >= 1 && num <= 18) {
			func(1);
		} else if (slots[0] == "19to36" && num >= 1 && num <= 18) {
			func(1);
		} else if (slots[0] == "even" && num % 2 === 0) {
			func(1);
		} else if (slots[0] == "odd" && num % 2 === 1) {
			func(1);
		} else if (slots[0] == "red" && wheel.indexOf(num) % 2 == 0) {
			func(1);
		} else if (slots[0] == "black" && wheel.indexOf(num) % 2 == 1) {
			func(1);
		} else {
			if (slots[0] == num) {
				func(35);
			} else {
				func(0);
			}
		}
	}
	else if (slots.length > 1) {
		console.log("multi-bet");
		num = num.toString();
		if (slots.indexOf(num) != -1) {
			if (slots.length == 2) func(17);
			else if (slots.length == 4) func(8);
		} else {
			console.log(slots);
			func(0);
		}
	}
}


function calPayout(player, lobby_id, func) {
	var won = false;
	getRn(lobby_id, function (rn) { // calculate payout
		var sql = "SELECT * FROM bets WHERE username='" + player + "';";
		conn.query(sql, function (err, result, fields) {
			if (err) {
				console.log(sql);
				throw err;
			}
			console.log(result);
			console.log(result.length);
			(function asyncLoop(i) {
				if (i >= result.length) {
					console.log("won=" + won);
					var sql = "DELETE FROM bets WHERE username='" + player + "';";  //delete bets of the player after payout calculated
					conn.query(sql, function (err, result) {
						if (err) { console.log(sql); throw err; };

						console.log("deleted bets of " + player);
						getPlayerLobby(player, function (res1) { //check if lobby is empty
							var k = 0;
							//console.log(res1);
							while (k < res1.length) {
								if (res1[k].lobby_id < 11) k++;
								else break;
								//console.log(k);
							}
							//console.log(k);
							if (k < res1.length) {
								//console.log(res1[k].lobby_id);
								getBets(res1[k].lobby_id, function (result1) {
									if (err) { console.log(sql); throw err; };
									//console.log(result1);
									if (result1.length == 0) {
										var sql = "UPDATE lobby SET special1=NULL, special2=NULL WHERE lobby_id=" + res1[k].lobby_id + ";";
										conn.query(sql, function (err, result2) {
											if (err) { console.log(sql); throw err; };

											console.log("roullete round complete");
										});
									}
									func(won);
									return;
								});
							} else {
								console.log("NOT IN ROULLETE!!");
							}
						});
					});

				}
				else {
					//console.log("in loop")
					var slots = result[i].slots;
					satisfies(rn, slots, function (pay) {
						var sql1 = "SELECT th,fi,hu FROM bets WHERE username='" + player + "' and bet_id=" + result[i].bet_id + ";";

						conn.query(sql1, function (err, res, fields) {
							if (err) { console.log(sql1); throw err; };

							console.log(pay);
							console.log(res);
							var amount = res[0].th * 1000 + res[0].fi * 500 + res[0].hu * 100;
							if (pay == 0) {
								if (won) won = true;
								var sql2 = "UPDATE players SET coins=coins-" + amount + " WHERE username='" + player + "';";
								conn.query(sql2, function (err, re) {
									if (err) { console.log(sql2); throw err; };

									console.log(player + " lost " + amount);
									console.log(re.affectedRows);
								});
							} else {
								won = true;
								var sql3 = "UPDATE players SET coins=coins+" + (amount * pay) + ", coins_won=coins_won+" + (amount * pay) + " WHERE username='" + player + "';";
								conn.query(sql3, function (err, r) {
									if (err) { console.log(sql3); throw err; };

									console.log(player + " won " + amount * pay);
								});

							}
							asyncLoop(i + 1);

						});

					});
				}
			})(0);

		});

	});
}


function bingoLobbyDetails(lobby_id, func) {
	var ret = new Object();
	var sql = "SELECT special2 FROM lobby WHERE lobby_id=" + lobby_id + ";";
	conn.query(sql, function (err, result, fields) {
		if (err) {
			console.log(sql);
			throw err;
		}
		ret.status = result[0].special2;
		sql = "SELECT COUNT(*) FROM lobby_user WHERE lobby_id=" + lobby_id + ";";
		conn.query(sql, function (err, res, fields) {
			if (err) {
				console.log(sql);
				throw err;
			}
			ret.players = res[0]["COUNT(*)"];
			func(ret);
		});
	});
}

function bingoReady(player) {
	getPlayerLobby(player, function (res) {
		var i = 0;
		while (res[i].lobby_id > 10 && i < res.length) {
			i++;
		}
		if (i < res.length) {
			var sql = "UPDATE lobby_user SET color='ready' WHERE lobby_id=" + res[i].lobby_id + " and username=" + player + ";";
			conn.query(sql, function (err, result) {
				if (err) {
					console.log(sql);
					throw err;
				}
				console.log(player + " in lobby:" + res[i].lobby_id + " ready");
			});
		}
	});
}

function bingoStart(player, func) {
	getPlayerLobby(player, function (res) {
		var ret = new Object();
		var i = 0;
		while (res[i].lobby_id > 10 && i < res.length) {
			i++;
		}
		if (i < res.length) {
			var sql = "SELECT COUNT(*) FROM lobby_user WHERE lobby_id=" + res[i].lobby_id + " and username=" + player + ";";
			conn.query(sql, function (err, result, fields) {
				if (err) {
					console.log(sql);
					throw err;
				}
				if (result[0]["COUNT(*)"] >= 5) {
					console.log("Bingo match started in lobby:" + res[i].lobby_id)
					ret.status = "ready";
					ret.lobby_id = res[i].lobby_id;
					sql = "UPDATE lobby SET special2='running' WHERE lobby_id=" + res[i].lobby_id + ";";
					func(ret);
				} else {
					func({ status: "not ready", lobby_id: res[i].lobby_id });
				}
			});
		}
	});
}


function getBingoNumber(player, func) {
	getPlayerLobby(player, function (res) {
		if (res.length > 0) {
			var i = 0;
			while (res[i].lobby_id > 11 && i < res.length) {
				i++;
			}
			if (i < res.length) {
				var sql = "SELECT special1 FROM lobby WHERE lobby_id=" + res[i].lobby_id + ";";
				conn.query(sql, function (err, result, fields) {
					if (err) { console.log(sql); throw err; };

					var numArr, num;
					if (result[0].special1 != null) {
						console.log(result);
						nums = result[0].special1;
						func(nums);
					}
					else {
						func("[]");
					}
				});
			}
		} else {
			func("player not in any lobby");
		}
	});
}

function setBingoNumber(lobby_id){
	var sql="SELECT special1 FROM lobby WHERE lobby_id="+lobby_id+";";
	conn.query(sql,function(err,result,fields){
		if(err){ console.log(sql); throw err;};

		var numArr, num;
		if (result[0].special1 != null) {
			console.log(result);
			nums = result[0].special1;
			numArr = nums.split(",");
		} else {
			console.log(result[0].special1);
			nums = "";
			numArr = [];
		}
		for (var i = 0; i < numArr.length; i++) {
			numArr[i] = parseInt(numArr[i], 10);
		}
		console.log(nums);
		rng.Raand("bingo",numArr,function(op){
			if(op!="done"){
				if(nums.length>0) nums=nums+","+op;
				else nums=op.toString();
				var sql1="UPDATE lobby SET special1='"+nums+"' WHERE lobby_id="+lobby_id+";";
				conn.query(sql1,function(err,result){
					if(err){ console.log(sql1); throw err;};

					console.log("got bingo number");
				});
			}
			//func(op);
		});
	});
}




function enterRouletteLobby(username, func, newLobbyFunc, startLobbyFunc) {

    var table = "lobby_user";
    var lobbyLimit = 5;
    var sql = "SELECT lobby_id, colour_id FROM " + table + " where username=? AND lobby_id > 10"; //checks if the user is present in the roulette lobby
    var preps = [username];
    sql = mysql.format(sql, preps);
    conn.query(sql, function (err, results, fields) {
        if ( !results || results.length == 0) {  //if the user is not present in any roulette lobby

            var sql = "SELECT lobby.lobby_id lobby_id, IFNULL(t.ct,0) count FROM lobby LEFT JOIN (SELECT lobby_id, COUNT(lobby_id) ct FROM lobby_user GROUP BY lobby_id) t ON lobby.lobby_id = t.lobby_id WHERE lobby.lobby_id > 10 AND IFNULL(t.ct,0) < " + lobbyLimit + " ORDER BY `count` DESC, lobby_id ASC";//finding lobby with maximum members but less than the lobby limit
            conn.query(sql, function (err, results, fields) {
                //console.log(results);
                if (results[0] == null) {  // if all lobbies full create new lobby
                    //var currTime = Date.now() / 1000 | 0; //set unix epoch time
                    var sql = "INSERT INTO lobby values ()";
                    conn.query(sql, function (err, results, fields) {
                        //console.log(results.insertId);
						newLobbyFunc(results.insertId);
						var values = [results.insertId, username];
						insertRouletteLobbyUser(table, values, function (lobby_id, colour_id) { //placing user in the newly created lobby
							startLobbyFunc(lobby_id);
							getcolour(colour_id, function (colour) {
								func(lobby_id, colour);
							});
						});
					});
				}
				else {  //placing in the lobby  with highest number of members
					if (results[0].count == 0) {			///check*********
						startLobbyFunc(results[0].lobby_id);
					}
					//var lobby_id = results[0].lobby_id;
					var values = [results[0].lobby_id, username];
					insertRouletteLobbyUser(table, values, function (lobby_id, colour_id) {
						getcolour(colour_id, function (colour) {
							func(lobby_id, colour);
						});
					});
				}
			});

		}
        else {   //if user already present in a lobby
			getcolour(results[0].colour_id, function (colour) {
				func(results[0].lobby_id, colour);
			});
			//            func(results[0].lobby_id, results[0].colour_id);
		}

    });

}


function leaveRouletteLobby(username, func, lastMemberLeavesRouletteLobby) {
    var table = "lobby_user";
    var sql = "SELECT lobby_id FROM " + table + " WHERE username = ? AND lobby_id > 2;"
    var preps = [username];
    sql = mysql.format(sql, preps);
    conn.query(sql, function (err, result) {
        if (result[0] != null) {  //if user present in roulette lobby
			// console.log(result[0]);
            var lobby_id = result[0].lobby_id;
            var sql = "DELETE FROM " + table + " WHERE username=? AND lobby_id = ?"
            var preps = [username, result[0].lobby_id];
            sql = mysql.format(sql, preps);
            //console.log(sql);
            conn.query(sql, function (err, result) {
				//  console.log('deleted ' + result.affectedRows + ' rows');
				sql = "SELECT IFNULL(COUNT(*),0) count FROM lobby_user WHERE lobby_id=" + lobby_id;
				conn.query(sql, function (err, results, fields) {
					//console.log(results[0].count);
					if (results[0].count == 0) {
						lastMemberLeavesRouletteLobby(lobby_id);
					}
				})
                func(lobby_id);
            });
        }
        else func(null);    //if user not present in lobby
    });
}


function enterBingoLobby(username, lobby_id, func) {
	var bingoLobbyCoins = 500; // amount user loses when user enters a lobby
	var sql = "SELECT lobby_id FROM `lobby_user` WHERE username=? AND lobby_id < 11"
	preps = [username];
	sql = mysql.format(sql, preps);
	console.log(sql);

	conn.query(sql, function (err, results, fields) {
		if (err) throw err;
		if (results[0] == null) {	//if user not present in any lobby 
			sql = "INSERT INTO lobby_user values (" + lobby_id + ",?,0)";
			sql = mysql.format(sql, preps);
			console.log(sql);
			conn.query(sql, function (err, results, fields) {
				if (err) throw err;
				updatePlayer(username, 0, bingoLobbyCoins, 0, function () {
					func(lobby_id);
				});
			});
		}
		else if (results[0] != null && results[0].lobby_id != lobby_id) {	//if user present in any other bingo lobby remove user from that lobby
			leaveBingoLobby(username, function (dat) {
				sql = "INSERT INTO lobby_user values (" + lobby_id + ",?,0)";
				sql = mysql.format(sql, preps);
				console.log(sql);
				conn.query(sql, function (err, results, fields) {
					if (err) throw err;
					updatePlayer(username, 0, bingoLobbyCoins, 0, function () {
						func(lobby_id);
					});
				});
			});
		}
		else if (results[0].lobby_id == lobby_id) { //if user already present in the lobby
			func(lobby_id);
		}
	});
}



function leaveBingoLobby(username, func) {
	var table = "lobby_user";
    var sql = "SELECT lobby_id FROM " + table + " WHERE username = ? AND lobby_id < 11;"
    var preps = [username];
    sql = mysql.format(sql, preps);
	conn.query(sql, function (err, results, fields) {
		if (err) throw err;
		if (results[0] != null) {
			var lobby_id = results[0].lobby_id;
			sql = "DELETE FROM " + table + " WHERE username=? AND lobby_id=" + lobby_id;
			preps = [username];
			sql = mysql.format(sql, preps);
			conn.query(sql, function (err, results, fields) {
				if (err) throw err;
				func(lobby_id);

			});
		}
		else {
			func(null);
		}
	});
}


function insertRouletteLobbyUser(table, values, func) {
	//	console.log(values[0]);
	findColour(values[0], function (colour_id) {
		var sql = "INSERT INTO " + table + " values (?,?," + colour_id + ");";
		sql = mysql.format(sql, values);
		//   console.log(sql);
		conn.query(sql, function (err, result) {
			if (err) throw err;
			//console.log(result.insertId + "\nrow inserted");
			func(values[0], colour_id);
		});
	});
}

function findColour(lobby_id, func) {
	var sql = "SELECT IFNULL(sum(colour_id),0) as sum FROM `lobby_user` WHERE lobby_id=" + lobby_id + ";";
	conn.query(sql, function (err, result) {
		if (err) throw err;
		var sum = result[0].sum;
		//        var sum = 0;
		var colour_id = 1;
		while (sum % 2 == 1) {
			sum = (sum - 1) / 2;
			colour_id = colour_id * 2;
		}
		// console.log(colour_id);
		func(colour_id);
	});
}

function getcolour(colour_id, func) {
	if (colour_id == 1) {
		func("blue");
	}
	else if (colour_id == 2) {
		func("green");
	}
	else if (colour_id == 4) {
		func("grey");
	}
	else if (colour_id == 8) {
		func("purple");
	}
	else if (colour_id == 16) {
		func("red");
	}
}

function leaveRouletteLobby(username, func) {
	var table = "lobby_user";
	var sql = "SELECT lobby_id FROM " + table + " WHERE username = ? AND lobby_id > 10;"
	var preps = [username];
	sql = mysql.format(sql, preps);
	conn.query(sql, function (err, result) {
		if(result){
			if (result[0] != null) {  //if user present in roulette lobby
				// console.log(result[0]);
				var lobby_id = result[0].lobby_id;
				var sql = "DELETE FROM " + table + " WHERE username=? AND lobby_id = ?"
				var preps = [username, result[0].lobby_id];

				sql = mysql.format(sql, preps);
				//console.log(sql);
				conn.query(sql, function (err, result) {
					//  console.log('deleted ' + result.affectedRows + ' rows');
					func(lobby_id);
				});
			}
			else func(null);    //if user not present in lobby
		}	
	});
	// console.log(sql);
	// func("left");
}

function updatePlayer(username, coins, func) {  //if win win=1; else win=0 and coins_won=0

	var sql = "SELECT coins FROM `players` WHERE username=?"
	var preps = [username];
	sql = mysql.format(sql, preps);
	console.log(sql);
	conn.query(sql, function (err, result, field) {
		if (coins > result[0].coins) {
			win = 1;
			coins_won = coins - result[0].coins;
		}
		else {
			win = 0;
			coins_won = result[0].coins - coins;
		}

		if (win) {
			sql = "UPDATE players SET coins=" + coins + ", coins_won=coins_won+" + coins_won + " where username=?;";
			preps = [username];
			sql = mysql.format(sql, preps);
			//        console.log(sql);
			conn.query(sql, function (err, result) {
				if (err) throw err;
				//console.log(result);
				func();
			});
		}
		else {
			sql = "UPDATE players SET coins=" + coins + ", coins_won=coins_won-" + coins_won + " where username=?;";
			preps = [username];
			sql = mysql.format(sql, preps);
			//       console.log(sql);
			conn.query(sql, function (err, result) {
				if (err) throw err;
				//console.log(result);
				func();
			});
		}
	});

}



// order of status will be start, win, win, win, start, win,...
function updateBingo(lobby_id, status, func) { // status="start" when lobby start status="win" when player wins 
	//sql="SELECT special2 FROM lobby WHERE lobby_id="+lobby_id;
	if (status == "start") {
		sql = "UPDATE `lobby` SET special2=? WHERE lobby_id=" + lobby_id;
		preps = ["running"];
		sql = mysql.format(sql, preps);
		console.log(sql);
		conn.query(sql, function (err, result) {
			if (err) throw err;
			//console.log(result);
			func("Bingo lobby " + lobby_id + " running");
		});
	}
	if (status == "win") {
		sql = "SELECT special2 FROM `lobby` WHERE lobby_id=" + lobby_id;
		conn.query(sql, function (err, result) {
			if (err) throw err;
			var special2 = "running";
			if (result[0].special2 == "running") {
				special2 = 1;
			}
			else if (result[0].special2 == 1) {
				special2 = 2;
			}
			else if (result[0].special2 == 2) {
				special2 = "not running";
			}

			if (special2 == "not running") {
				sql = "UPDATE lobby SET special1=null, special2=? WHERE lobby_id=" + lobby_id;
				preps = [special2];
				sql = mysql.format(sql, preps);
				console.log(sql);
				conn.query(sql, function (err, result) {
					if (err) throw err;
					//console.log(result);
					func("Bingo lobby " + lobby_id + " 3 wins lobby not running");
				});
			}
			else {
				sql = "UPDATE lobby SET special2=? WHERE lobby_id=" + lobby_id;
				preps = [special2];
				sql = mysql.format(sql, preps);
				console.log(sql);
				conn.query(sql, function (err, result) {
					if (err) throw err;
					//console.log(result);
					func("Bingo lobby " + lobby_id + ", " + special2 + " wins");
				});
			}

		});
	}
}

// TESTING
// var json='[{"username":"ista","th":0,"fi":0,"hu":6,"slots":["1to18"]},{"username":"ista","th":1,"fi":2,"hu":6,"slots":["2nd12"]}]';

// putBets(json);
// selectPlayersLobby(3,function(res){
// 	console.log(res);
// });
// selectPlayer("sidwa","12345",function(res){
// 	console.log(res);
// });

// var max=5
// function exit(){
//     console.log("hogaya");
// }

// (function repeat(i){
//     if(i>=max){
// 		exit();
// 		return;
//     }
// 	console.log(i);
// 	var sql="SELECT * FROM players WHERE username='sidwa';";
// 	conn.query(sql,function(err,result,fields){
// 		if(err){ console.log(sql); throw err;};

// 		console.log(i);
// 		console.log(result);
// 		repeat(i+1);
// 	});
// })(0);

// satisfies(2,"1,2,4,5",function(pay){
// 	console.log(pay);
// })

// console.log("outta the loop");
// var sql="SELECT * FROM lobby_user WHERE 1;";
// conn.query(sql,function(err,result,fields){
// 	if(err){ console.log(sql); throw err;};
// 	console.log(result);
// 	//console.log(i);
// });
//end testing
//console.log(selectPlayer("sidwa","1234"));

// var fs=require("fs");

// fs.readFile("wordlist.txt","ASCII",function(err,cont){
// 	//console.log(cont);
// 	var lines=cont.split("\n");
// 	//console.log(lines[2]);
// 	(function asyncLoop(i){
// 		if(i>lines.length){
// 			console.log("update the table");
// 		}else{
// 			console.log(lines[i]);
// 			var sql="INSERT INTO players SET register_id='"+lines[i]+"', username="+i+", coins=10000, coins_won=0;";
// 			conn.query(sql,function(err,result){
// 				if(err){
// 					console.log(sql); 
// 					throw err;
// 				}

// 				console.log("inserted :"+lines[i]);
// 				asyncLoop(i+1); 
// 			});
// 		}
// 	})(0);
// });
// getBingoNumber(1,function(num){
// 	console.log("number is "+num);
// });
//end test area
function setRand(player, val) {
	getPlayerLobby(player, function (res) {
		var i = 0;
		while (i < res.length) {
			if (res[i].lobby_id < 11) i++;
			else break;
		}
		if (i < res.length) {
			var sql = "UPDATE lobby SET special2=" + val + " WHERE lobby_id=" + res[i].lobby_id + ";";
			conn.query(sql, function (err, result) {
				if (err) { console.log(sql); throw err; };

				console.log("rn set to " + val);
			});
		}
	});
}
// TESTING
// var json='[{"username":"ista","th":0,"fi":0,"hu":6,"slots":["1to18"]},{"username":"ista","th":1,"fi":2,"hu":6,"slots":["2nd12"]}]';

// putBets(json);
// selectPlayersLobby(3,function(res){
// 	console.log(res);
// });
// selectPlayer("sidwa","12345",function(res){
// 	console.log(res);
// });

// var max=5
// function exit(){
//     console.log("hogaya");
// }

// (function repeat(i){
//     if(i>=max){
// 		exit();
// 		return;
//     }
// 	console.log(i);
// 	var sql="SELECT * FROM players WHERE username='sidwa';";
// 	conn.query(sql,function(err,result,fields){
// 		if(err){ console.log(sql); throw err;};

// 		console.log(i);
// 		console.log(result);
// 		repeat(i+1);
// 	});
// })(0);

// satisfies(2,"1,2,4,5",function(pay){
// 	console.log(pay);
// })

// console.log("outta the loop");
// var sql="SELECT * FROM lobby_user WHERE 1;";
// conn.query(sql,function(err,result,fields){
// 	if(err){ console.log(sql); throw err;};
// 	console.log(result);
// 	//console.log(i);
// });
//end testing
//console.log(selectPlayer("sidwa","1234"));

// var fs=require("fs");

// register("ayhooz","sidwa","1234",function(ret){
// 	console.log(ret);
// });

// fs.readFile("wordlist.txt","ASCII",function(err,cont){
// 	//console.log(cont);
// 	var lines=cont.split("\n");
// 	//console.log(lines[2]);
// 	(function asyncLoop(i){
// 		if(i>lines.length){
// 			console.log("update the table");
// 		}else{
// 			console.log(lines[i]);
// 			var sql="INSERT INTO players SET register_id='"+lines[i]+"', username="+i+", coins=10000, coins_won=0;";
// 			conn.query(sql,function(err,result){
// 				if(err){
// 					console.log(sql); 
// 					throw err;
// 				}

// 				console.log("inserted :"+lines[i]);
// 				asyncLoop(i+1); 
// 			});
// 		}
// 	})(0);
// });
// getBingoNumber(1,function(num){
// 	console.log("number is "+num);
// });
//end test area





module.exports.setRand = setRand; //delete
module.exports.selectPlayer = selectPlayer;
module.exports.putBets = putBets;
module.exports.getBets = getBets;
module.exports.calPayout = calPayout;
module.exports.timerSet = timerSet;
module.exports.setTimer = setTimer;
module.exports.getPlayerLobby = getPlayerLobby;
module.exports.getBingoNumber = getBingoNumber;
module.exports.selectPlayersLobby = selectPlayersLobby;
module.exports.removePlayerFromLobbies = removePlayerFromLobbies;
module.exports.bingoReady = bingoReady;
module.exports.bingoStart = bingoStart;
module.exports.getBingoNumber = getBingoNumber;
module.exports.bingoLobbyDetails = bingoLobbyDetails;
module.exports.isUnTaken = isUnTaken;
module.exports.register = register;
module.exports.getPlayer=getPlayer;

module.exports.enterRouletteLobby = enterRouletteLobby;
module.exports.enterBingoLobby = enterBingoLobby;
module.exports.leaveRouletteLobby = leaveRouletteLobby;
module.exports.leaveBingoLobby = leaveBingoLobby;
module.exports.updatePlayer = updatePlayer;
module.exports.updateBingo = updateBingo;