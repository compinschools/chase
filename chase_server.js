var initalised = false;
Delay = (ms) => new Promise(res => setTimeout(res, ms));

var containers = [];
var lastEscapee =-1;
var escapee = -1;
var escapeeCar = "adder"
var hunterCar = "adder"
const delay = 15; // in seconds
var startTime = Date.now();
var onYourMarks = false;
var getSet = false;
var go = false;
var airsupport = -1;
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

onNet('onServerResourceStart',(resource)=> {
 // console.log("resource started: ",resource);
  if(resource=="chase")
  {
    containers = JSON.parse( LoadResourceFile(GetCurrentResourceName(), "containerData.json"))
   
  containers.map( (c) => {
    CreateContainer(c.x,c.y,c.z,c.direction);
  
})
  }

})

onNet('chase:sethuntercar',(localHunterCar) => {
  hunterCar = localHunterCar;
  //console.log("hunter car",hunterCar)
})

onNet('chase:setescapeecar', (localEscapeeCar) => {
  escapeeCar = localEscapeeCar;
})

onNet('chase:reset',(passedcar,damage) => {
 
  let localHunterCar = hunterCar;
  let localEscapeeCar = escapeeCar;
  if(passedcar != ""){
    localHunterCar = localEscapeeCar = passedcar;
  }
 
  players.forEach( (player) => {
    if(escapee == player.sid){
    emitNet('playerrestart',player.sid,localEscapeeCar,damage,5)
    message(player.sid,"you are now the escapee!")
    }
    else if(airsupport == player.sid){
      emitNet('playerrestart',player.sid,'volatus',damage,1)
      message(player.sid,"you are now air support!")
      } else{
      emitNet('playerrestart',player.sid,localHunterCar,damage,1)
    }

  });

  const lastRun = Date.now() - startTime;
  const minutes = Math.floor(lastRun/60000);
  const seconds = Math.floor((lastRun - (minutes * 60000))/1000);
  const lastPlayerName = findPlayerName(lastEscapee);
  message(-1,`Timer Reset, last run was: ${minutes}m ${seconds}s, well done ${lastPlayerName}`);
  
  startTime = Date.now();
    
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

onNet('chase:setairsupport',(playername) => {
  if(playername.toLowerCase() == "off"){
    airsupport = -1;
    //console.log("removing air support");

  }
  players.forEach( (player) => {
    if(player.name.toLowerCase() == playername.toLowerCase()){
      airsupport = player.sid;
      emitNet('airsupport',player.sid,true)
     //console.log('setting air support',player.sid)
    } else {
      emitNet('airsupport',player.sid,false);
    }
  });
 // console.log("Air Support" + playername,airsupport)
})

onNet('chase:savecontainers',(data) => {
SaveResourceFile(GetCurrentResourceName(),"containerData.json",JSON.stringify([...containers,...data]),-1);
//console.log(data);
});

onNet('chase:setplayers',(args) => {
  
  const serverid = args[0];
  console.log(serverid);
  const p = GetPlayerFromIndex(serverid);
  const playername = GetPlayerName(serverid);
  const blip = AddBlipForEntity(serverid);
  SetBlipSprite(blip,429);
  //SetBlipAsShortRange(blip,true);
  //SetBlipColour(blip,1);

  emitNet('playerindex',serverid,players.length)
  players.push({index: players.length, sid: serverid, name: playername})
  
})

onNet('chase:escapee',(playername) => {
 
  players.forEach( (player) => {
    if(player.name.toLowerCase() == playername.toLowerCase()){
      lastEscapee = (escapee == -1 ? player.sid : escapee);
      escapee = player.sid;
      console.log('setting escapee',player.sid)
    }
  });
  //console.log("escapee " + playername,escapee)
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
    return;
  }
}); 

onNet('chase:resettimer',() => {
  resetTimer();
})

function resetTimer(){
  startTime = Date.now();
  onYourMarks = getSet = go = false;
  message(-1,`Timer Started! Escapee you have ${delay} seconds before being chased`)
}

onNet("CEventDataResponsePlayerDeath", (name, args) => {
  console.log(`Game event ${name} ${args.join(', ')}`)
});

onNet("entityCreated", (handle) => {
  //console.log(handle);
  //AddBlipForEntity(handle);

})