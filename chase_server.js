var initalised = false;
Delay = (ms) => new Promise(res => setTimeout(res, ms));

const airSupportSpawn = {
  x: 892.10,
    y: -28.704, 
    z: 78.517,
    direction: 325
}

const escapeeSpawn = {
  x: 872.2961, 
  y: -33.75466, 
  z: 78.25092,
  direction: 325-90-180
}

const hunterSpawns = [
  {x:	871.0931	,y:	-8.027414	,z:	78.25092	,direction: 325-90},
  {x:	869.2922	,y:	-10.85556	,z:	78.25092	,direction: 325-90},
  {x:	867.3961	,y:	-13.83304	,z:	78.25092	,direction: 325-90},
  {x:	865.4691	,y:	-16.8592	,z:	78.25092	,direction: 325-90},
  {x:	863.5977	,y:	-19.79782	,z:	78.25092	,direction: 325-90},
  {x:	861.6579	,y:	-22.84399	,z:	78.25092	,direction: 325-90},
  {x:	859.8667	,y:	-25.65676	,z:	78.25092	,direction: 325-90},
  {x:	857.9991	,y:	-28.58957	,z:	78.25092	,direction: 325-90},
  {x:	856.077	,y:	-31.60794	,z:	78.25092	,direction: 325-90},
  {x:	854.2204	,y:	-34.52335	,z:	78.25092	,direction: 325-90},
  {x:	852.343	,y:	-37.47161	,z:	78.25092	,direction: 325-90},
  {x:	850.6003	,y:	-40.2081	,z:	78.25092	,direction: 325-90},
  {x:	848.5654	,y:	-43.40371	,z:	78.25092	,direction: 325-90},
  {x:	900.4053	,y:	-26.79921	,z:	78.25092	,direction: 325-90},//test
  {x:	898.4274	,y:	-30.02213	,z:	78.25092	,direction: 325-90-180},
  {x:	896.6921	,y:	-32.84973	,z:	78.25092	,direction: 325-90-180},
  {x:	894.9279	,y:	-35.72458	,z:	78.25092	,direction: 325-90-180},
  {x:	893.1837	,y:	-38.56657	,z:	78.25092	,direction: 325-90-180},
  {x:	891.3335	,y:	-41.58147	,z:	78.25092	,direction: 325-90-180},
  {x:	889.4479	,y:	-44.654	,z:	78.25092	,direction: 325-90-180},
  {x:	887.7943	,y:	-47.34845	,z:	78.25092	,direction: 325-90-180},
  {x:	885.9185	,y:	-50.40506	,z:	78.25092	,direction: 325-90-180},
  {x:	884.0901	,y:	-53.38437	,z:	78.25092	,direction: 325-90-180},
  {x:	882.3299	,y:	-56.25257	,z:	78.25092	,direction: 325-90-180},
  {x:	880.5823	,y:	-59.10026	,z:	78.25092	,direction: 325-90-180},
  {x:	878.7366	,y:	-62.10781	,z:	78.25092	,direction: 325-90-180},
  
  
  

]

var containers = [];
var permissions = [];
var lastEscapee =-1;
var escapee = -1;
var escapeeCar = "dominator"
var hunterCar = "dominator"
const delay = 15; // in seconds
var startTime = Date.now();
var onYourMarks = false;
var getSet = false;
var go = false;
var airsupport = -1;
var previous = Date.now();
var defaultDamage = 1;

function CheckPermissions(serverid,role="admin"){
  const playerguid = GetPlayerIdentifier(serverid,0);
  //playerConsoleText(serverid,"guid:" + playerguid);
  let retVal = false;
  //console.log("serverid",serverid)
  const playername = GetPlayerName(serverid) || "";
  //console.log("permissions for", playername)
  //console.log("permissions",permissions)
   permissions.forEach( (p) => {
    if(p.identifier == playerguid && p.role.toLowerCase() == role.toLowerCase()){
     // console.log("returning true")
      retVal = true;
    }


  }) 
  if(retVal == false)
  {
    playerConsoleText(serverid,"Permission Check Failed");
  }
  return retVal;
}
  const players = [];

   function CreateContainer(x,y,z,direction){
   
    const hash = GetHashKey('prop_container_ld_d');
    
    const container = CreateObjectNoOffset(hash, x, y, z-1.2, true, true, false);
   // console.log(container)
    SetEntityRotation(
        container,
        0,
        0,direction
        , 
        1, 
        false);
       // console.log(GetEntityRotation(container))
       
        FreezeEntityPosition(container,true);
        //SetEntityCanBeDamaged(container,false);
        //AddBlipForEntity(container);
   
    

    return container;
}

onNet('chase:setdamage',(source,clientdamage) => {
  if(CheckPermissions(source,"admin"))
  {
    defaultDamage = clientdamage;
    
  }

})

onNet('onServerResourceStart',(resource)=> {
 // console.log("resource started: ",resource);
  if(resource=="chase")
  {
    containers = JSON.parse( LoadResourceFile(GetCurrentResourceName(), "containerData.json"))
    permissions = JSON.parse( LoadResourceFile(GetCurrentResourceName(),"permissions.json"))
    
    //RemoveVehiclesFromGeneratorsInArea(842,-200,70,950,50,90);
  containers.map( (c) => {
    CreateContainer(c.x,c.y,c.z,c.direction);
  
})
  }

})

onNet('chase:sethuntercar',(source,localHunterCar) => {
  if(CheckPermissions(source,"admin")){
  hunterCar = localHunterCar;
  //console.log("hunter car",hunterCar)
  }
  
})

onNet('chase:setescapeecar', (source,localEscapeeCar) => {
  if(CheckPermissions(source,"admin")){
  escapeeCar = localEscapeeCar;
  }
})

onNet('chase:reset',(source,passedcar,damage) => {

  if(CheckPermissions(source,"admin")){
  //console.log("players",players)
  let localHunterCar = hunterCar;
  let localEscapeeCar = escapeeCar;
  let localdamage = damage == -1 ? defaultDamage : damage;
  //console.log(localdamage);
  defaultDamage = localdamage;
  if(passedcar != ""){
    localHunterCar = localEscapeeCar = passedcar;
  }
 
  players.forEach( (player) => {
    if(escapee == player.sid){
    emitNet('playerrestart',
    player.sid,
    {
      car: localEscapeeCar,
    x: escapeeSpawn.x,
    y: escapeeSpawn.y,
    z: escapeeSpawn.z,
    direction: escapeeSpawn.direction,
    damage: localdamage,
    color: 5,
    fuel: 1000}
    )
    message(player.sid,"you are now the escapee!")
    }
    else if(airsupport == player.sid){
      emitNet('playerrestart',
      player.sid,
      {
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
      message(player.sid,"you are now air support!")
      emitNet('chase:setfuel',player.sid,0);
      } else{
      
     // console.log("here",hunterSpawns[player.index]) 
       emitNet('playerrestart',
      player.sid,
      {
        car: localHunterCar,
        x: hunterSpawns[player.index].x,
      y: hunterSpawns[player.index].y,
      z: hunterSpawns[player.index].z,
      direction: hunterSpawns[player.index].direction,
      damage: 1,
      color: 1,
      fuel: 0
      })
      emitNet('chase:setfuel',player.sid,0);
    }

  });

  const lastRun = Date.now() - startTime;
  const minutes = Math.floor(lastRun/60000);
  const seconds = Math.floor((lastRun - (minutes * 60000))/1000);
  const lastPlayerName = findPlayerName(lastEscapee);
  message(-1,`Timer Reset, last run was: ${minutes}m ${seconds}s, well done ${lastPlayerName}`);
  
  startTime = Date.now();
    
}

  });

  function findPlayerName(id){
    let retVal = "";
    //console.log("id,",id)
    //console.log("players",players)
    players.forEach( (player)=> {
      if(player.sid == id){
        retVal = player.name;
      }

    })
    return retVal;
  }
onNet('chase:initialise',()=> {
    if(!initalised){
    console.log('initialise resource start')
    //put code here ot intialise when first client connects
    initalised = true;
}

})

onNet('chase:setairsupport',(source,playername) => {
  if(CheckPermissions(source,"admin")){
  if(playername.toLowerCase() == "off"){
    airsupport = -1;
    //console.log("removing air support");

  }
  players.forEach( (player) => {
    if(player.name.toLowerCase() == playername.toLowerCase()){
      airsupport = player.sid;
      emitNet('airsupport',player.sid,true);
      emitNet('playerrestart',
      player.sid,
      {
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
      emitNet('airsupport',player.sid,false);
    }
  });
 // console.log("Air Support" + playername,airsupport)
}
})

onNet('chase:savecontainers',(source,data) => {
  if(CheckPermissions(source,"admin")){
SaveResourceFile(GetCurrentResourceName(),"containerData.json",JSON.stringify([...containers,...data]),-1);
//console.log(data);
  }
});

onNet('chase:setplayers',(serverid) => {
  
  //console.log("set players serverid",serverid);
  
  //const p = GetPlayerFromIndex(serverid);
  const playername = GetPlayerName(serverid);
  const playeridentifier = GetPlayerIdentifier(serverid,0);
  //console.log("set players playername",playername);
  //SetBlipAsShortRange(blip,true);
  //SetBlipColour(blip,1);

  emitNet('playerindex',
    serverid,
    {
      index: players.length,
      x: hunterSpawns[players.length].x,
    y: hunterSpawns[players.length].y,
    z: hunterSpawns[players.length].z,
    direction: hunterSpawns[players.length].direction,
    color: 1
    });
  emitNet('playerList',-1,players);
  players.push({index: players.length, sid: serverid, name: playername, identifier: playeridentifier})
  
})

onNet('chase:escapee',(source,playername) => {
  if(CheckPermissions(source,"admin")){
  if(playername == "off"){
  lastEscapee = (escapee == -1 ? player.sid : escapee);
      escapee = player.sid;
  }
  players.forEach( (player) => {
    if(player.name.toLowerCase() == playername.toLowerCase()){
      lastEscapee = (escapee == -1 ? player.sid : escapee);
      escapee = player.sid;
      if(airsupport == player.sid){
        airsupport = -1;
      }

      emitNet('chase:setescapee',-1,escapee);

      //console.log('setting escapee',player.sid)
      emitNet('playerrestart',
    player.sid,
    {
     
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


onNet('chase:sendmessage',(sid,mesage) => {
  message(sid,message);
})

function message(sid,text,color=[255,255,255]){
  emitNet('servermessage',sid,text,color)
}

setTick(() => {

  
  //console.log("I'm running every frame/tick!");
  const currentTime = Date.now();
  
  const setOffTime = startTime + (delay * 1000);
  const difference = setOffTime - currentTime;

  //console.log(difference);
  if(difference > 1000 && difference < 2001 && !onYourMarks) {
    onYourMarks = true;
    message(-1,"On your marks......",[255,0,0]);
    return;
  }

  if(difference > 000 && difference < 1001 && !getSet) {
    getSet = true;
    message(-1,"get Set......",[255,200,10]);
    return;
  }

  if(difference < 1 && !go) {
    go = true;
    message(-1,"GO!!!!!",[0,255,0]);
    emitNet('chase:setfuel',-1,1000);
    return;
  }
}); 

onNet('chase:resettimer',(source) => {
  if(CheckPermissions(source,"admin")){
  resetTimer();
  }
})

onNet('chase:addadmin', (source,playername) => {
  if(CheckPermissions(source)) {
    var playerid = "";
    players.forEach( (player) => {
      if(playername.toLowerCase() == p.name.toLowerCase() ){
        playerid = player.identifier;
      }
    })
    permissions.push({ playername: playername, role: "admin", identifier: playerid  });
    SaveResourceFile(GetCurrentResourceName(),"permissions.json",JSON.stringify(permissions),-1);
  }
})
function resetTimer(){
  
  startTime = Date.now();
  onYourMarks = getSet = go = false;
  message(-1,`Timer Started! Escapee you have ${delay} seconds before being chased`)
 
  
}

function playerConsoleText(source,text){
  emitNet('chase:console',source,text);
}

onNet("CEventDataResponsePlayerDeath", (name, args) => {
  console.log(`Game event ${name} ${args.join(', ')}`)
});

onNet('chase:repair', (source) => {
  if(escapee !=source){
    emitNet('chase:repair',source);
  }

})