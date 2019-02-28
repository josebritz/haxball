var room = HBInit({ roomName: "BOUNCE DE LA MUERTE E OUTROS", maxPlayers: 18, public: true, playerName: "Hostenho" });

var nomeJogador = "";

room.setScoreLimit(0);

room.setTimeLimit(0);

room.onGameStart = function(player) {
    lastScores = room.getScores().red + room.getScores().blue;
}

room.onPlayerBallKick = function(player) {
    lastTeamTouched = player.team;
}


room.onPlayerJoin = function(player) {
    if(player.id == 1) {
        room.setPlayerAdmin(player.id, true); 
    }
    room.sendChat("O arrombado do @" + player.name + " acabou de entrar. Digite !help para ver os comandos disponíveis.");
    gols[String(player.id)] = 0;
    assistencias[String(player.id)] = 0;
    playerNames[String(player.id)] = player.name;
}

var radiusBall = 9.8;
var triggerDistance = radiusBall + 15 + 0.01;


var Team = {
    SPECTATORS: 0,
    RED: 1,
    BLUE: 2
};
var lastScores = 0;
var lastTeamTouched = 0;
var exitingPos = null;
var assistingTouch = "";
var lastPlayerTouched = "";
var gols = {};
var assistencias = {};
var playerNames = {};

var previousPlayerTouched;

room.onTeamGoal = function(team) {
    var players = room.getPlayerList();
 
        for(var i = 0; i < players.length; i++) {
            if(players[i].id==lastPlayerTouched && players[i].team==team) {
		    if(players[i].id!=assistingTouch && assistingTouch!="")
		    {
			gols[String(players[i].id)] +=1;
			assistencias[assistingTouch] +=1;
			room.sendChat("GOL DO " + players[i].name + ". ASSISTENCIA DO " + assistingTouch + ". JÁ FEZ " + gols[String(players[i].id)] + " GOLS.");
			assistingTouch = "";
			lastPlayerTouched = "";



		    }else
		    {
			gols[String(players[i].id)] +=1;
			room.sendChat("GOL DO " + players[i].name + ". JÁ FEZ " + gols[String(players[i].id)] + " GOLS. ESSA FERA AI.");
			assistingTouch = "";
			lastPlayerTouched = "";

		    }

                	
            } else if(players[i].id==lastPlayerTouched && players[i].team!=team){
			room.sendChat("GOL CONTRA DO " + players[i].name);
		}
        }
    
}

room.onPlayerChat = function(player, message) {
    var players = room.getPlayerList();
    if(message == "!artilheiros") {
        var sortedGols =sortProperties(gols);
        
        if(sortedGols.length > 5) {
            room.sendChat("Artilheiros: " + sortedGols.slice(0, 4).toString().split(",").join(" "));  
        } else {
            room.sendChat("Artilheiros: " + sortedGols.toString().split(",").join(" "));  
        }
       
    }

    if(message == "!assistencias") {
        var sortedAss =sortProperties(assistencias);
        
        if(sortedAss.length > 5) {
            room.sendChat("Assistencias: " + sortedAss.slice(0, 4).toString().split(",").join(" "));  
        } else {
            room.sendChat("Assistencias: " + sortedAss.toString().split(",").join(" "));  
        }
       
    }

    if(message == "!help") {
        room.sendChat("Comandos: !artilheiros !gols !assistencias");  
    }

    if(message == "!gols") {
        room.sendChat("Você tem " + gols[String(player.id)] + " gols.");  
    }
}

function sortProperties(obj)
{
  // convert object into array
	var sortable=[];
	for(var key in obj)
        if(obj.hasOwnProperty(key))
            if(obj[key] > 0) {
                sortable.push([playerNames[key] + ": ", obj[key]]); // each item is an array in format [key, value]
            }
	
	// sort items by value
	sortable.sort(function(a, b)
	{
	  return b[1]-a[1]; // compare numbers
	});
	return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

room.onPlayerBallKick = function(player) {
    var ballPosition = room.getBallPosition();
    if(player.id!=lastPlayerTouched)
    {
        if(lastTeamTouched==player.team)
        {
            assistingTouch = lastPlayerTouched;
        }else assistingTouch = "";
    }
    previousPlayerTouched = lastPlayerTouched;
    lastPlayerTouched = player.id;
    lastTeamTouched = player.team;

    

}
room.onGameTick = function() {
    getLastTouchTheBall();
}


function getLastTouchTheBall() {
    var ballPosition = room.getBallPosition();
    var players = room.getPlayerList();
    for(var i = 0; i < players.length; i++) {
        if(players[i].position != null) {
            var distanceToBall = pointDistance(players[i].position, ballPosition);
            if(distanceToBall < triggerDistance) {
                if(lastPlayerTouched!=players[i].id)
                {
                    if(lastTeamTouched==players[i].team)
                    {
                        assistingTouch = lastPlayerTouched;
                    }else assistingTouch = "";
                }
                lastTeamTouched = players[i].team;
                previousPlayerTouched == lastPlayerTouched;
                lastPlayerTouched = players[i].id;
            }
        }
    }
    return lastPlayerTouched;
}

function pointDistance(p1, p2) {
    var d1 = p1.x - p2.x;
    var d2 = p1.y - p2.y;
    return Math.sqrt(d1 * d1 + d2 * d2);
}

