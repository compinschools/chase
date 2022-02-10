Delay = (ms) => new Promise(res => setTimeout(res, ms));


const tospawn = [

];

function drawTxt(x, y, scale, text, r, g, b, a) {
  let aspect = Math.floor(GetAspectRatio(true) * 1000)
  SetTextFont(4)
  //SetTextProportional(1)
  SetTextScale(scale, scale)
  SetTextColour(r, g, b, a)
  SetTextDropShadow(0, 0, 0, 0, 255)
  //SetTextEdge(2, 0, 0, 0, 255)
  //SetTextJustification(0);
  SetTextCentre(true);
  SetTextDropShadow()
  SetTextOutline()
  SetTextEntry("STRING")
  AddTextComponentString(text)

  DrawText(x, y)
}


var spawnx = 0;
var spawny = 0;
var spawnz = 0;
var spawndirection = 0;
const players = Array.from({
  length: 128
}, (_, index) => index + 1);
var defaultCar = 'dominator';
var defaultColor = 1;
var defaultDamage = 1;
var airsupport = false;
var escapee = -1;
var playerVehicle; //if the player has a vehicle already, this is the reference to it
var playerindex = 0;
var engineenabled = false;
var fuel = 100;
const containers = [];

const vars = {
  engineenabled: false
}


onNet('playerindex', (args) => {
  //console.log("args",args)
  playerindex = args.index;
  spawnx = args.x;
  spawny = args.y;
  spawnz = args.z;
  spawndirection = args.direction;
  defaultColor = args.color;
  Delay(200);
  //console.log("player set to index",playerindex)
  exports.spawnmanager.forceRespawn()
})

RegisterCommand('forcerespawn', (source, args, raw) => {
  exports.spawnmanager.forceRespawn();
})

RegisterCommand('changespawn', (source, args, raw) => {
  playerindex = args[0];
})

function getServerId() {
  pi = GetPlayerIndex();
  sid = GetPlayerServerId(pi)
  return sid;
}
onNet('onClientGameTypeStart', () => {
  TriggerServerEvent("chase:initialise");
  const sid = getServerId();
  TriggerServerEvent('chase:setplayers', sid);
  RemoveVehiclesFromGeneratorsInArea(842, -200, 70, 950, 50, 90);


  exports.spawnmanager.setAutoSpawnCallback(() => {
    //console.log(`spawnPos: ${spawnx},${spawny},${spawnz}, `);

    exports.spawnmanager.spawnPlayer({
      x: spawnx,
      y: spawny,
      z: spawnz,
      heading: spawndirection
    }, () => {
      RemoveVehiclesFromGeneratorsInArea(842, -200, 70, 950, 50, 90);
      //SetEntityRotation(PlayerPedId(),0,0,spawnPos.direction)
      Car(null, [defaultCar, defaultDamage, defaultColor], null, spawnx, spawny, spawnz, spawndirection);

    });




  });

  exports.spawnmanager.setAutoSpawn(true)
  exports.spawnmanager.forceRespawn()
  


});

RegisterCommand('escapeedelay', (source,args,raw) => {
  if(args.length == 0 || isNaN(parseInt(args[0]))) {
    console.log("usage: escapeedelay <seconds>")
  }

  TriggerServerEvent('chase:escapeedelay',getServerId(),parseInt(args[0]))
})

RegisterCommand('hunterdelay', (source,args,raw) => {
  if(args.length == 0 || isNaN(parseInt(args[0]))) {
    console.log("usage: hunterdelay <seconds>")
  }

  TriggerServerEvent('chase:hunterdelay',getServerId(),parseInt(args[0]))
})


RegisterCommand('resettimer', (source, args, raw) => {
  TriggerServerEvent('chase:resettimer', getServerId())
})

RegisterCommand('reset', (source, args, raw) => {
  var car = "";
  var damage = -1;
  if (args.length > 0) {
    car = args[0];
  }
  if (args.length > 1) {
    damage = args[1];
  }


  TriggerServerEvent('chase:reset', getServerId(), car, damage);
  TriggerServerEvent('chase:resettimer', getServerId())

})


onNet('playerrestart', (args) => {


  playerRestart(
    args.car,
    args.x,
    args.y,
    args.z,
    args.direction,
    args.damage,
    args.color,
    args.fuel);
});

onNet('addBlips', () => {


});


function playerRestart(car1, x1, y1, z1, direction1, damage1, color1, fuel1) {
  //console.log("car",car1);
  //console.log("damage",damage1);
  //console.log("color", color1);

  spawnx = x1;
  spawny = y1;
  spawnz = z1;
  spawndirection = direction1;
  defaultCar = car1;
  defaultDamage = damage1;
  defaultColor = color1;
  fuel = fuel1 || fuel;
  exports.spawnmanager.forceRespawn();
}


onNet('airsupport', (airsup) => {
  //console.log(airsup)
  if (airsup != airsupport) {


    airsupport = airsup;


  }


});

RegisterCommand('startrecord', () => {
  StartRecording(1);

})

RegisterCommand('stoprecord', () => {
  StopRecordingAndSaveClip();
})

onNet('chase:setescapee', (serverescapee) => {
  escapee = serverescapee;
})

RegisterCommand('escapeecar', (source, args, raw) => {
  if (args.length > 0) {
    const hash = GetHashKey(args[0]);
    if (!IsModelInCdimage(hash) || !IsModelAVehicle(hash)) {
      console.log(
        'Invalid Car ' + args[0]
      )
      return;
    }

    TriggerServerEvent('chase:setescapeecar', getServerId(), [args[0]]);
    console.log(
      'Trying to set Escapee car to ' + args[0]
    )
  }
})

RegisterCommand('huntercar', (source, args, raw) => {
  if (args.length == 0) {
    console.log("usage: huntercar <carmodel>")
    return;
  }
  if (args.length > 0) {
    const hash = GetHashKey(args[0]);
    if (!IsModelInCdimage(hash) || !IsModelAVehicle(hash)) {
      console.log(
        'Invalid Car ' + args[0]
      )
      return;
    }
    TriggerServerEvent('chase:sethuntercar', getServerId(), args[0]);
    console.log(
      'Trying to set hunter car to ' + args[0]
    )
  }
})

onNet('playerList', (playerList) => {
  //console.log("playerList length", playerList.length)
})


RegisterCommand('airsupport', (source, args, raw) => {
  if (args.length == 0) {
    console.log("usage: airsupport <playername or off>")
  }
  if (args.length > 0) {
    TriggerServerEvent('chase:setairsupport', getServerId(), args[0]);

  }
})

function CreateContainer(x, y, z, direction) {

  const hash = GetHashKey('prop_container_ld_d');

  const container = CreateObject(hash, x, y, z - 1.2, true, true);
  SetEntityRotation(
    container,
    0,
    0, direction,
    1,
    true);
  FreezeEntityPosition(container, true);
  SetEntityCanBeDamaged(container, false);
  AddBlipForEntity(container);
  containers.push(container);
  tospawn.push({
    x: x,
    y: y,
    z: z,
    direction: direction
  })

  return container;
}

onNet('servermessage', (message, color) => {
  emit('chat:addMessage', {
    color: color,
    args: [
      message
    ]
  })
})

RegisterCommand('savecontainers', (source, args, raw) => {
  TriggerServerEvent("chase:savecontainers", getServerId(), tospawn);
  console.log("triggered json save of all player container placements")

})
RegisterCommand('containers', (source, args, raw) => {
  console.log("number of containers:" + containers.length);
})


RegisterCommand('getrotation', (source, args, raw) => {
  const ped = PlayerPedId();

  console.log("rotation for player: ", GetEntityHeading(ped))

})
RegisterCommand('whereami', (source, args, raw) => {
  const ped = PlayerPedId();

  // Get the coordinates of the player's Ped (their character)
  const coords = GetEntityCoords(ped);
  console.log(`You are here:  ${coords}`);

})

RegisterCommand('deletecontainer', (source, arg, raw) => {
  const lastcontainer = containers.pop();
  DeleteEntity(lastcontainer);
  const detail = tospawn.pop();
  console.log("container deleted")

});
RegisterCommand('spawncontainer', (source, args, raw) => {
  const ped = PlayerPedId();

  // Get the coordinates of the player's Ped (their character)
  const coords = GetEntityCoords(ped);

  const container = CreateContainer(coords[0], coords[1], coords[2], GetEntityHeading(ped));
  console.log('container rotation:', GetEntityHeading(ped))

  console.log(`spawned container at ${coords}`)

})
//	prop_container_ld_d

RegisterCommand('car', async (source, args, raw) => {
  Car(source, args, raw)
}, false);

async function Car(source, args, raw, x = -1, y = -1, z = -1, heading = -1) {
  //console.log("usage: car <model> <damage -4000 to 1000> <color (integer)>")
  // account for the argument not being passed
  let model = "adder";
  let damage = defaultDamage;
  let color = 1;
  if (args.length > 0) {
    model = args[0].toString();
  }
  if (args.length > 1) {
    try {
      damage = parseInt(args[1])
    } catch {
      console.log("usage: car <model> <damage modifier 1 to 100> <color (integer)>")

      return;
    }
  }
  if (args.length > 2) {
    try {
      color = parseInt(args[2]);
    } catch {
      console.log("usage: car <model> <damage modifier 1 to 100> <color (integer)>")
      return;
    }
  }


  // check if the model actually exists
  const hash = GetHashKey(model);
  if (!IsModelInCdimage(hash) || !IsModelAVehicle(hash)) {
    console.log(`Invalid Car Model ${model}`);
    return;
  }

  // Request the model and wait until the game has loaded it
  RequestModel(hash);
  while (!HasModelLoaded(hash)) {
    await Delay(500);
  }

  const ped = PlayerPedId();

  // Get the coordinates of the player's Ped (their character)
  var coords = [spawnx, spawny, spawnz];
  if (x == -1 && y == -1 && z == -1) {


    coords = GetEntityCoords(ped);
  }

  var direction = spawndirection;
  if (heading == -1) {
    direction = GetEntityHeading(ped);
  }
  // Create a vehicle at the player's position
  const vehicle = CreateVehicle(hash, coords[0], coords[1], coords[2], direction, true, false);
  //const blip = AddBlipForEntity(vehicle);
  //SetBlipSprite(blip,429);
  //SetVehicleBodyHealth(vehicle,damage);
  //SetVehiclePetrolTankHealth(vehicle,damage);
  //SetVehicleEngineHealth(vehicle,damage);
  SetVehicleDamageModifier(vehicle, damage);
  // Set the player into the drivers seat of the vehicle
  SetPedIntoVehicle(ped, vehicle, -1);
  SetVehicleColours(vehicle, color, color);
  SetVehicleFuelLevel(vehicle, fuel);
  // Allow the game engine to clean up the vehicle and model if needed
  SetEntityAsNoLongerNeeded(vehicle);

  SetModelAsNoLongerNeeded(model);
  if (playerVehicle) {
    DeleteEntity(playerVehicle);
    //console.log("deleted vehicle")
  }
  playerVehicle = vehicle;


}

onNet('chase:setfuel', level => {
  fuel = level;
  SetVehicleFuelLevel(playerVehicle, level);
})

function repair() {
  SetVehicleEngineHealth(playerVehicle, defaultDamage);
  SetVehicleBodyHealth(playerVehicle, defaultDamage);
  SetVehiclePetrolTankHealth(playerVehicle, defaultDamage);

  SetVehicleFixed(playerVehicle);
}
RegisterCommand('repair', (source, args, raw) => {
  TriggerServerEvent('chase:repair', getServerId())
})

RegisterCommand('escapee', (source, args, raw) => {
  TriggerServerEvent('chase:escapee', getServerId(), args[0]);

})

RegisterCommand('chaseadmin', (source, args, raw) => {
  if (args.length == 0) {
    console.log("usage: chaseadmin <playername>");
    return
  }

  TriggerServerEvent('chase:addadmin', getServerId(), args[0]);
})

RegisterCommand('setdamage', (source, args, raw) => {
  if (args.length == 0) {
    console.log("usage: setdamage <1 to 100>");

    return
  }

  TriggerServerEvent('chase:setdamage', getServerId(), parseInt(args[0]));
  console.log("Setting escapee damage modifier to ", args[0])
})

RegisterCommand('chasehelp', () => {
  console.log("Command List and Usage")
  console.log("----------------------")
  console.log("escapecar <model>");
  console.log("huntercar <model>");
  console.log("airsupport <playername>");
  console.log("escapee <playername>");
  console.log("reset <car> <damagemodifier (1 to 100)>");
  console.log("resettimer");
  console.log("chaseadmin <playername>");
  console.log("repair");
  console.log("setdamage <damagemodifier 1 to 100>")
  console.log("escapeedelay <seconds>")
  console.log("hunterdelay <seconds>")
  console.log("recordstart")
  console.log("recordstop")
  console.log("");
  console.log("Dev Commands");
  console.log("------------");
  console.log("savecontainers");
  console.log("containers");
  console.log("getrotation");
  console.log("whereami");
  console.log("deletecontainer");
  console.log("spawncontainer");
  console.log("car <model> <damagemodifier 1 to 100> <color (integer)>");
  console.log("chasehelp");

});

function setBlips() {

  players.forEach(P => {
    if (NetworkIsPlayerActive(P)) {
      // console.log("active player",P)
      const ped = GetPlayerPed(P);
      //console.log(ped);
      var blip = GetBlipFromEntity(ped);
      //console.log(blip)
      if (ped != 0 && !blip) {
        blip = AddBlipForEntity(ped);


        SetBlipNameToPlayerName(blip, P);
        SetBlipAsShortRange(blip, true);
        PulseBlip(blip);
      }
      const serverid = GetPlayerServerId(P);
      // console.log(serverid,escapee)
      if (serverid == escapee) {
        SetBlipSprite(blip, 429)
      } else {
        SetBlipSprite(blip, 1)
      }


    }
    // }

  });
}

setTick(() => {
  if (IsControlJustPressed(0, 27)) {
    TriggerServerEvent('chase:repair', getServerId())
  }

   
  setBlips();




});

onNet('chase:console', text => {
  console.log(text);

})
onNet('chase:repair', () => {
  repair();
})