Delay = (ms) => new Promise(res => setTimeout(res, ms));

const tospawn = [
   
      ]

const spawnPos = [
  {	x:	923.62	,	y:	46.755	,	z:	80.353	}	,
{	x:	921.45	,	y:	47.995	,	z:	80.353	}	,
{	x:	919.28	,	y:	49.235	,	z:	80.353	}	,
{	x:	917.11	,	y:	50.475	,	z:	80.353	}	,
{	x:	914.94	,	y:	51.715	,	z:	80.353	}	,
{	x:	912.77	,	y:	52.955	,	z:	80.353	}	,
{	x:	910.6	,	y:	54.195	,	z:	80.353	}	,
{	x:	908.43	,	y:	55.435	,	z:	80.353	}	,
{	x:	906.26	,	y:	56.675	,	z:	80.353	}	,
{	x:	904.09	,	y:	57.915	,	z:	80.353	}	,
{	x:	901.92	,	y:	59.155	,	z:	80.353	}	,
{	x:	899.75	,	y:	60.395	,	z:	80.353	}	,
{	x:	897.58	,	y:	61.635	,	z:	80.353	}
  


];
var defaultCar = 'adder';
var defaultColor = 1;
var defaultDamage = 1000;
var airsupport = false;

var playerVehicle; //if the player has a vehicle already, this is the reference to it
var playerindex = 0;

const containers = [];

onNet('playerindex',(index) => {
  playerindex = index;
  //console.log("player set to index",playerindex)

})
onNet('onClientGameTypeStart', () => {
    TriggerServerEvent("chase:initialise");
    pi = GetPlayerIndex();
    sid = GetPlayerServerId(pi)
    TriggerServerEvent('chase:setplayers',[sid]);
    


  exports.spawnmanager.setAutoSpawnCallback(() => {
    
    
   exports.spawnmanager.spawnPlayer(airsupport ?
    {
    
    x: 892.10,
    y: -28.704, 
    z: 78.517,
    //model: 'a_m_m_skater_01'
  }: 
  {
    
    x: spawnPos[playerindex].x,
    y: spawnPos[playerindex].y, 
    z: spawnPos[playerindex].z,
    //model: 'a_m_m_skater_01'
  }, () => {
      emit('chat:addMessage', {
        multiline: false,

        args: [
          
          'Welcome to Chase','you are player ' + (playerindex + 1)
        ]
      })
      SetEntityRotation(PlayerPedId(),0,0,325)
      Car(null,[defaultCar,defaultDamage,defaultColor],null);
     
    });

   


  });

   exports.spawnmanager.setAutoSpawn(true)
    exports.spawnmanager.forceRespawn()


 
});
RegisterCommand('resettimer',(source,args,raw) => {
  TriggerServerEvent('chase:resettimer')
})

RegisterCommand('reset',(source,args,raw) => {
  var car = "";
  var damage = defaultDamage;
  if(args.length > 0) {
    car = args[0];
  }
  if(args.length > 1){
    damage = args[1];
  }

  
  TriggerServerEvent('chase:reset',car,damage);
  TriggerServerEvent('chase:resettimer')

})

onNet('playerrestart',(car,damage,color) => {
    
    playerrestart(car,damage,color)  });



function playerrestart(car,damage,color){
  console.log("car",car);
  console.log("damage",damage);
  console.log("color", color);
  defaultCar = car;
  defaultDamage = damage;
  defaultColor = color;
  exports.spawnmanager.forceRespawn();
};

onNet('airsupport',(airsup) => {
  console.log(airsup)
  if(airsup != airsupport){

   
    airsupport = airsup;
    if(airsupport){
      playerrestart('volatus',1000,1)
    }
   
  }


});

RegisterCommand('escapeecar',(source,args,raw) => {
    if(args.length> 0){
      const hash = GetHashKey(args[0]);
    if (!IsModelInCdimage(hash) || !IsModelAVehicle(hash))
    {
      console.log(
          'Invalid Car ' + args[0]
        )
      return;
    }

    TriggerServerEvent('chase:setescapeecar',[args[0]]);
    console.log(
        'Escapee Car Set To ' + args[0]
     )
    }
  })

  RegisterCommand('huntercar',(source,args,raw) => {
    if(args.length == 0)
    {
      console.log("usage: huntercar <carmodel>")
      return;
    }
    if(args.length> 0){
      const hash = GetHashKey(args[0]);
      if (!IsModelInCdimage(hash) || !IsModelAVehicle(hash))
      {
        console.log(
            'Invalid Car ' + args[0]
          )
        return;
      }
    TriggerServerEvent('chase:sethuntercar',[args[0]]);
    console.log(
        'Hunter Car Set To ' + args[0]
     )
    }
  })


  RegisterCommand('airsupport',(source,args,raw) => {
    if(args.length==0) {
      console.log("usage: airsupport <playername or off>")
    }
    if(args.length > 0)
    {
      TriggerServerEvent('chase:setairsupport',args[0]);

    }
  })
function CreateContainer(x,y,z,direction){
   
    const hash = GetHashKey('prop_container_ld_d');

    const container = CreateObject(hash, x, y, z-1.2, true, true);
    SetEntityRotation(
        container,
        0,
        0,direction
        , 
        1, 
        true);
        FreezeEntityPosition(container,true);
        SetEntityCanBeDamaged(container,false);
        AddBlipForEntity(container);
    containers.push(container);
    tospawn.push(
        {
            x:x,
            y:y,
            z:z,
            direction:direction
        }
    )

    return container;
}

onNet('servermessage',(message,color) => {
  emit('chat:addMessage', {
    color: color,
    args: [
      message
    ]
  })
})

RegisterCommand('savecontainers', (source,args,raw) => {
  TriggerServerEvent("chase:savecontainers", tospawn);
  console.log("triggered json save of all player container placements")

})
RegisterCommand('containers',(source,args,raw) => {
    console.log("number of containers:" + containers.length);
})


RegisterCommand('getrotation',(source,args,raw)=> {
  const ped = PlayerPedId();
 
  console.log("rotation for player: ",GetEntityHeading(ped))

})
  RegisterCommand('whereami',(source,args,raw) => {
    const ped = PlayerPedId();
  
    // Get the coordinates of the player's Ped (their character)
    const coords = GetEntityCoords(ped);
    console.log(`You are here:  ${coords}`);

  })

  RegisterCommand('deletecontainer', (source,arg,raw)=> {
    const lastcontainer = containers.pop();
    DeleteEntity(lastcontainer);
    const detail = tospawn.pop();
    console.log("container deleted")

  });
  RegisterCommand('spawncontainer', (source,args,raw) => {
    const ped = PlayerPedId();
  
    // Get the coordinates of the player's Ped (their character)
    const coords = GetEntityCoords(ped);

    const container = CreateContainer(coords[0], coords[1], coords[2], GetEntityHeading(ped));
    console.log('container rotation:',GetEntityHeading(ped))
    
    console.log(`spawned container at ${coords}`)

  })
  //	prop_container_ld_d

  RegisterCommand('car', async (source, args, raw) => {
    Car(source,args,raw)
  }, false);

  async function Car(source,args,raw) {
    //console.log("usage: car <model> <damage -4000 to 1000> <color (integer)>")
    // account for the argument not being passed
    let model = "adder";
    let damage = defaultDamage;
    let color = 1;
    if (args.length > 0)
    {
      model = args[0].toString();
    }
    if(args.length > 1)
    {
      try
      {
      damage = parseInt(args[1])
      }
      catch 
      {
        console.log("usage: car <model> <damage -4000 to 1000> <color (integer)>")
    
        return;
      }
    }
    if(args.length > 2)
    {
      try
      {
      color = parseInt(args[2]);
      }
      catch
      {
        console.log("usage: car <model> <damage -4000 to 1000> <color (integer)>")
        return;
      }
    }

  
    // check if the model actually exists
    const hash = GetHashKey(model);
    if (!IsModelInCdimage(hash) || !IsModelAVehicle(hash))
    {
      console.log(`Invalid Car Model ${model}`);
      return;   
    }
  
    // Request the model and wait until the game has loaded it
    RequestModel(hash);
    while (!HasModelLoaded(hash))
    {
      await Delay(500);
    }
  
    const ped = PlayerPedId();
  
    // Get the coordinates of the player's Ped (their character)
    const coords = GetEntityCoords(ped);
  
    // Create a vehicle at the player's position
    const vehicle = CreateVehicle(hash, coords[0], coords[1], coords[2], GetEntityHeading(ped), true, false);
    SetVehicleBodyHealth(vehicle,damage);
    SetVehiclePetrolTankHealth(vehicle,damage);
    SetVehicleEngineHealth(vehicle,damage);
    // Set the player into the drivers seat of the vehicle
    SetPedIntoVehicle(ped, vehicle, -1);
    SetVehicleColours(vehicle,color,color);
    // Allow the game engine to clean up the vehicle and model if needed
    SetEntityAsNoLongerNeeded(vehicle);
    SetModelAsNoLongerNeeded(model);
    if(playerVehicle){
      DeleteEntity(playerVehicle);
      //console.log("deleted vehicle")
    }
    playerVehicle = vehicle;
    
   
  }

  RegisterCommand('escapee', (source,args,raw) => {
    TriggerServerEvent('chase:escapee',args[0]);

  })

  RegisterCommand('chasehelp', () => {
    console.log("Command List and Usage")
    console.log("----------------------")
    console.log("escapecar <model>");
    console.log("huntercar <model>");
    console.log("airsupport <playername>");
    console.log("escapee <playername>");
    console.log("reset");
    console.log("resettimer");
    console.log("");
    console.log("Dev Commands");
    console.log("------------");
    console.log("savecontainers");
    console.log("containers");
    console.log("getrotation");
    console.log("whereami");
    console.log("deletecontainer");
    console.log("spawncontainer");
    console.log("car <model> <damage -4000 to 1000> <color (integer)>");
    console.log("chasehelp");

  });