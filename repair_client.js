setTick( () => {
    if(IsControlJustPressed(0,27)){
     TriggerServerEvent('chase:repair',getServerId())
   } 



 });