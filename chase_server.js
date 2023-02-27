const {
  triggerAsyncId
} = require("async_hooks");
const { spawn } = require("child_process");

var initalised = false;
Delay = (ms) => new Promise(res => setTimeout(res, ms));

let spawns = [];

let airSupportSpawn ={}

let escapeeSpawn = {};

let hunterSpawns = [];

const scoreboard = [];

var containers = [];
var permissions = [];
var cameras = [];
var escapee = -1;
var escapeeCar = "dominator"
var hunterCar = "dominator"
var escapeedelay = 10; // in seconds
var hunterdelay = 20; // in seconds
var startTime = new Date(1970, 1, 1);
var onYourMarks = false;
var getSet = false;
var go = false;
var airsupport = -1;
var previous = Date.now();
var defaultDamage = 4;

function IsPlayerActive(serverid) {
  const ped = GetPlayerPed(serverid);
  if (ped) {
    return true;
  }
  return false;

}

function CheckPermissions(serverid, role = "admin") {
  const playerguid = GetPlayerIdentifier(serverid, 0);
  //playerConsoleText(serverid,"guid:" + playerguid);
  let retVal = false;
  //console.log("serverid",serverid)
  const playername = GetPlayerName(serverid) || "";
  //console.log("permissions for", playername)
  //console.log("permissions",permissions)
  permissions.forEach((p) => {
    if (p.identifier == playerguid && p.role.toLowerCase() == role.toLowerCase()) {
      // console.log("returning true")
      retVal = true;
    }


  })
  if (retVal == false) {
    playerConsoleText(serverid, "Permission Check Failed");
  }
  return retVal;
}

//const dummyPlayers = Array(255).fill(0).map ( (_,i) => i+1 );
const players = [];

function CreateContainer(x, y, z, direction) {

  const hash = GetHashKey('prop_container_ld_d');

  const container = CreateObjectNoOffset(hash, x, y, z - 1.2, true, true, false);
  // console.log(container)
  SetEntityRotation(
    container,
    0,
    0, direction,
    1,
    false);
  // console.log(GetEntityRotation(container))

  FreezeEntityPosition(container, true);
  //SetEntityCanBeDamaged(container,false);
  //AddBlipForEntity(container);



  return container;
}
onNet('chase:setspawn',(serverid,location) => {
  try
  {
    spawns.forEach( (sp) => {
      if(sp.name.toLowerCase() == location.toLowerCase()){
        escapeeSpawn = sp.escapee;
        hunterSpawns = sp.hunter;
        airSupportSpawn = sp.airsupport;
        playerConsoleText(serverid,"Location set to " + sp.name);
       
      }
    })
  }
  catch(err){
    playerConsoleText(serverid,"error:" + err);
  }
});

onNet('chase:setdamage', (source, clientdamage) => {
  if (CheckPermissions(source, "admin")) {
    defaultDamage = clientdamage;

  }

})

onNet('onServerResourceStart', (resource) => {
  // console.log("resource started: ",resource);
  if (resource == "chase") {
    //RemoveVehiclesFromGeneratorsInArea(842, -200, 70, 950, 50, 90);
    containers = JSON.parse(LoadResourceFile(GetCurrentResourceName(), "containerData.json"))
    permissions = JSON.parse(LoadResourceFile(GetCurrentResourceName(), "permissions.json"))
    spawns = JSON.parse(LoadResourceFile(GetCurrentResourceName(),"spawnLocations.json"))
    cameras = JSON.parse(LoadResourceFile(GetCurrentResourceName(),"cameras.json"))
    escapeeSpawn = spawns[0].escapee;
    hunterSpawns = spawns[0].hunter;
    airSupportSpawn = spawns[0].airsupport;
    /* SaveResourceFile(GetCurrentResourceName(),"spawnLocations.json",JSON.stringify([{
      name: "casino",
      escapee: escapeeSpawn,
      airsupport: airSupportSpawn,
      hunter: hunterSpawns
    }])) */
    //RemoveVehiclesFromGeneratorsInArea(842,-200,70,950,50,90);
    containers.map((c) => {
      CreateContainer(c.x, c.y, c.z, c.direction);

    })
  }

})

onNet('chase:sethuntercar', (source, localHunterCar) => {
  if (CheckPermissions(source, "admin")) {
    hunterCar = localHunterCar;
    //console.log("hunter car",hunterCar)
  }

})

onNet('chase:setescapeecar', (source, localEscapeeCar) => {
  if (CheckPermissions(source, "admin")) {
    escapeeCar = localEscapeeCar;
  }
})

onNet("chase:scoreboard",(serverid) => {
  clientscoreboard(serverid);
})

function clientscoreboard(serverid=-1){
  
  const percolumn = 20;


  emitNet('chase:drawtxt', serverid,
  0.5,
  0.05,
  0.7,
  "Scoreboard",
  255,
  0,
  255,
  255,
  5000
);    

  scoreboard.forEach( (score,index) => {
    let txt = score.name + " " + score.score + "\n";


      emitNet('chase:drawtxt', serverid,
      0.15 + ( Math.floor( (index) / percolumn) * 0.1),
      0.1 + ((index % percolumn) * 0.04),
      0.5,
      txt,
      255,
      255,
      255,
      255,
      5000
    );    
   

  })
  
}

function endRun(addToScoreboard, messagePlayers) {
  const lastRun = Date.now() - startTime;
  const minutes = Math.floor(lastRun / 60000);
  const seconds = Math.floor((lastRun - (minutes * 60000)) / 1000);
  const lastPlayerName = findPlayerName(escapee);

  if(addToScoreboard){
    scoreboard.push({
      name: lastPlayerName,
      score: `${minutes}m ${seconds}s`
    })
    
  }

  if (messagePlayers) {
    emitNet('chase:drawtxt', -1,
      0.5,
      0.4,
      1,
      `Timer Reset, last run was: ${minutes}m ${seconds}s, well done ${lastPlayerName}`,
      255,
      255,
      255,
      255,
      5000
    );
  }
}

onNet('chase:deletevehicles',()=> {
  const vehicles = EnumerateVehicles();
  vehicles.forEach( (v) => {
    if(!IsPedAPlayer(GetPedInVehicleSeat(v,-1))){
      SetVehicleHasBeenOwnedByPlayer(v, false) 
      SetEntityAsMissionEntity(v, false, false) 
      DeleteVehicle(v)
      if (DoesEntityExist(v)) DeleteVehicle(v) 
    }
  })

});

function EnumerateVehicles(){

  const ids = [];
  let [iter,id]=  FindFirstVehicle()

 // console.log(iter);
  //console.log(id);
  if(!id){
    return;
  }
  ids.push(id);
  
  let next = 0
    do{
      
      [next, id] = FindNextVehicle(iter)
      //console.log("next",next);
      //console.log("id",id);
      if(id != -1){
        ids.push(id);
      }
      }while(next);

    EndFindVehicle(iter)
    return ids;
}

onNet("chase:changespawn",(serverid,index) => {
  players.forEach( (p) => {
    if(p.sid ==serverid) p.index = index;
  })
  playerConsoleText(serverid,"Changed player index to " + index)

})

onNet('chase:reset', (source, passedcar, damage) => {

  if (CheckPermissions(source, "admin")) {

    //endRun(true,true);
    //console.log("players",players)
    let localHunterCar = hunterCar;
    let localEscapeeCar = escapeeCar;
    let localdamage = damage == -1 ? defaultDamage : damage;
    //console.log(localdamage);
    defaultDamage = localdamage;
    if (passedcar != "") {
      localHunterCar = localEscapeeCar = passedcar;
    }

    players.forEach((player) => {
      if (!IsPlayerActive(player.sid)) return;
      if (escapee == player.sid) {
        emitNet('playerrestart',
          player.sid, {
            car: localEscapeeCar,
            x: escapeeSpawn.x,
            y: escapeeSpawn.y,
            z: escapeeSpawn.z,
            direction: escapeeSpawn.direction,
            damage: localdamage,
            color: 5,
            fuel: 0
          }

        )
        emitNet('chase:setfuel', player.sid, 0);
        message(player.sid, "you are now the escapee!")
      } else if (airsupport == player.sid) {
        emitNet('playerrestart',
          player.sid, {
            car: 'volatus',
            x: airSupportSpawn.x,
            y: airSupportSpawn.y,
            z: airSupportSpawn.z,
            direction: airSupportSpawn.direction,
            damage: 1,
            color: 1,
            fuel: 0
          }
        )
        message(player.sid, "you are now air support!")
        emitNet('chase:setfuel', player.sid, 0);
      } else {

        // console.log("here",hunterSpawns[player.index]) 
        emitNet('playerrestart',
          player.sid, {
            car: localHunterCar,
            x: hunterSpawns[player.index].x,
            y: hunterSpawns[player.index].y,
            z: hunterSpawns[player.index].z,
            direction: hunterSpawns[player.index].direction,
            damage: 1,
            color: 1,
            fuel: 0
          })
        emitNet('chase:setfuel', player.sid, 0);
      }

    });

  }

});

function findPlayerName(id) {
  let retVal = "";
  //console.log("id,",id)
  //console.log("players",players)
  players.forEach((player) => {
    if (!IsPlayerActive(player.sid)) return;
    if (player.sid == id) {
      retVal = player.name;
    }

  })
  return retVal;
}
onNet('chase:initialise', () => {
  if (!initalised) {
    console.log('initialise resource start')
    //put code here ot intialise when first client connects
    initalised = true;
  }

})

onNet('chase:setairsupport', (source, playername) => {
  if (CheckPermissions(source, "admin")) {
    if (playername.toLowerCase() == "off") {
      airsupport = -1;
      //console.log("removing air support");

    }
    players.forEach((player) => {
      if (player.name.toLowerCase() == playername.toLowerCase()) {
        airsupport = player.sid;
        emitNet('airsupport', player.sid, true);
        emitNet('playerrestart',
          player.sid, {
            car: 'volatus',
            x: airSupportSpawn.x,
            y: airSupportSpawn.y,
            z: airSupportSpawn.z,
            direction: airSupportSpawn.direction,
            damage: 1,
            colour: 1,
            fuel: 1000
          }
        )
        //console.log('setting air support',player.sid)
      } else {
        emitNet('airsupport', player.sid, false);
      }
    });
    // console.log("Air Support" + playername,airsupport)
  }
})

onNet('chase:savecontainers', (source, data) => {
  if (CheckPermissions(source, "admin")) {
    SaveResourceFile(GetCurrentResourceName(), "containerData.json", JSON.stringify([...containers, ...data]), -1);
    //console.log(data);
  }
});

onNet('chase:savescoreboard', (source, data) => {
  if (CheckPermissions(source, "admin")) {
    SaveResourceFile(GetCurrentResourceName(),`Scoreboard-${Date.now()}.json`, JSON.stringify(scoreboard), -1);
    playerConsoleText(source,"file saved, check the chase folder")
    //console.log(data);
  }
});

onNet('chase:removecars', () => {
  emitNet('chase:localremovecars',-1,spawns);
})

onNet('chase:setplayers', (serverid) => {

  //console.log("set players serverid",serverid);

  //const p = GetPlayerFromIndex(serverid);
  const playername = GetPlayerName(serverid);
  const playeridentifier = GetPlayerIdentifier(serverid, 0);
  //console.log("set players playername",playername);
  //SetBlipAsShortRange(blip,true);
  //SetBlipColour(blip,1);

  emitNet('playerindex',
    serverid, {
      index: players.length,
      x: hunterSpawns[players.length].x,
      y: hunterSpawns[players.length].y,
      z: hunterSpawns[players.length].z,
      direction: hunterSpawns[players.length].direction,
      color: 1
    });
  emitNet('playerList', -1, players);
  players.push({
    index: players.length,
    sid: serverid,
    name: playername,
    identifier: playeridentifier
  })

})

onNet('chase:escapee', (source, playername) => {
  if (CheckPermissions(source, "admin")) {
    if (playername == "off") {

      escapee = -1;
    }
    players.forEach((player) => {
      if (!IsPlayerActive(player.sid)) return;
      if (player.name.toLowerCase() == playername.toLowerCase()) {

        escapee = player.sid;
        if (airsupport == player.sid) {
          airsupport = -1;
        }

        emitNet('chase:setescapee', -1, escapee);

        //console.log('setting escapee',player.sid)
        emitNet('playerrestart',
          player.sid, {

            car: escapeeCar,
            x: escapeeSpawn.x,
            y: escapeeSpawn.y,
            z: escapeeSpawn.z,
            direction: escapeeSpawn.direction,
            color: 5,
            damage: defaultDamage,
            fuel: 1000
          }
        );
      }
    });
    //console.log("escapee " + playername,escapee)
  }
})

onNet('chase:escapeedelay', (source, delay) => {
  if (CheckPermissions(source, 'admin')) {
    escapeedelay = delay;
  }
});

onNet('chase:hunterdelay', (source, delay) => {
  if (CheckPermissions(source, 'admin')) {
    hunterdelay = delay;
  }
});


onNet('chase:sendmessage', (sid, mesage) => {
  message(sid, message);
})

function message(sid, text, color = [255, 255, 255]) {
  emitNet('servermessage', sid, text, color)
}

setTick(() => {


  //console.log("I'm running every frame/tick!");
  const currentTime = Date.now();

  RSGHunter(startTime, currentTime);
  RSGEscapee(startTime, currentTime);


});

function RSGHunter(startTime, currentTime) {
  const sethunterOffTime = startTime + (hunterdelay * 1000);
  const hunterdifference = sethunterOffTime - currentTime;

  //console.log(difference);
  if (hunterdifference > 1000 && hunterdifference < 2001) {

    players.forEach((p) => {
      if (!IsPlayerActive(p.sid)) return;
      if (p.sid != escapee) {
        emitNet('chase:stage', p.sid, "onyourmarks");
      }
    })
    return;
  }

  if (hunterdifference > 000 && hunterdifference < 1001) {

    players.forEach((p) => {
      if (!IsPlayerActive(p.sid)) return;
      if (p.sid != escapee) {
        emitNet('chase:stage', p.sid, "getset");
      }
    })
    return;
  }

  if (hunterdifference > -1000 && hunterdifference < 1) {
    players.forEach((p) => {
      if (!IsPlayerActive(p.sid)) return;
      if (p.sid != escapee) {
        emitNet('chase:stage', p.sid, "go");
        emitNet('chase:setfuel', p.sid, 1000);
      } else {
        emitNet('chase:stage', p.sid, "huntergo")
      }
    })

    return;
  }
}

function RSGEscapee(startTime, currentTime) {
  if (escapee == -1) return;

  const setescapeeOffTime = startTime + (escapeedelay * 1000);
  const escapeedifference = setescapeeOffTime - currentTime;


  if (escapeedifference > 1000 && escapeedifference < 2001) {

    emitNet('chase:stage', escapee, "onyourmarks");
    // console.log("Escapee on your marks")
    return;
  }

  if (escapeedifference > 000 && escapeedifference < 1001) {


    emitNet('chase:stage', escapee, "getset");
    //console.log("Escapee get set") 
    return;
  }

  if (escapeedifference > -1000 && escapeedifference < 1) {


    emitNet('chase:stage', escapee, "go");
    emitNet('chase:setfuel', escapee, 1000);
    // console.log("Escapee go")

    return;
  }
}

onNet('chase:starttimer', (source) => {
  if (CheckPermissions(source, "admin")) {
    starttimer();
  }
})

onNet('chase:addcam', (source, playername) => {
  if (CheckPermissions(source)) {
    var playerid = "";
    players.forEach((player) => {
      if (!IsPlayerActive(player.sid)) return;
      if (playername.toLowerCase() == player.name.toLowerCase()) {
        playerid = player.identifier;
      }
    })
    cameras.push({
      playername: playername,
      identifier: playerid
    });
    SaveResourceFile(GetCurrentResourceName(), "cameras.json", JSON.stringify(cameras), -1);
  }
})

onNet('chase:addadmin', (source, playername) => {
  if (CheckPermissions(source)) {
    var playerid = "";
    players.forEach((player) => {
      if (!IsPlayerActive(player.sid)) return;
      if (playername.toLowerCase() == p.name.toLowerCase()) {
        playerid = player.identifier;
      }
    })
    permissions.push({
      playername: playername,
      role: "admin",
      identifier: playerid
    });
    SaveResourceFile(GetCurrentResourceName(), "permissions.json", JSON.stringify(permissions), -1);
  }
})



onNet('chase:stoptimer', (serverid) => {
  endRun(true, true);
  startTime = new Date(1970, 1, 1);
});

function starttimer() {

  startTime = Date.now();
  emitNet('chase:drawtxt', -1,
    0.5,
    0.5,
    1,
    `Timer Started! Escapee sets off in ${escapeedelay} second${escapeedelay > 1 && "s"} and the hunter ${hunterdelay-escapeedelay} second${hunterdelay-escapeedelay > 1 && "s"} after!`,
    255,
    255,
    255,
    255,
    5000
  );
 /*
  players.forEach((player) => {
    if (!IsPlayerActive(player.sid)) return;
    
    cameras.forEach( (c) => {
      if(player.identifier == c.identifier){
        emitNet('chase:startrecord',player.sid);
      }
    })
   
  });
 */



}

onNet('chase:setnumberplate',(sourceid) => {
  const ped = GetPlayerPed(sourceid)
  const v = GetVehiclePedIsIn(ped,true)
  SetVehicleNumberPlateText(v,"");  


})

function playerConsoleText(source, text) {
  emitNet('chase:console', source, text);
}

onNet('chase:repair', (source) => {
  if (escapee != source) {
    emitNet('chase:repair', source);
  }

})