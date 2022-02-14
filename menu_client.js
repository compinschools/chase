/* NUI Menu */
setTick(() => {
  if (IsControlJustPressed(0, 27)) {
    //TriggerServerEvent('chase:repair', getServerId())
    // JS
    //console.log("pressed")
    if (IsNuiFocused()) {
      SendNuiMessage(JSON.stringify({
        type: 'hideMenu'
      }))
      SetNuiFocus(false, false);
    } else {
      SendNuiMessage(JSON.stringify({
        type: 'showMenu'
      }))
      SetNuiFocus(true, true);

    }
  }




});


// JS
RegisterNuiCallbackType('getItemInfo') // register the type

// register a magic event name
on('__cfx_nui:getItemInfo', (data, cb) => {
  const itemId = data.itemId;
  console.log("getItemInfo Called", data)

  return ({
    message: true
  })

  // cb(itemCache[itemId]);
});

// JS
RegisterNuiCallbackType('repair') // register the type

// register a magic event name
on('__cfx_nui:repair', (data, cb) => {
  emit('chase:localrepair')
  //console.log("emitting repair")
  cb({
    message: 'ok'
  })
  return;

  // cb(itemCache[itemId]);
});

RegisterNuiCallbackType('closemenu') // register the type

// register a magic event name
on('__cfx_nui:closemenu', (data, cb) => {
  SetNuiFocus(false, false);
  cb({
    message: 'ok'
  })
  return;

  // cb(itemCache[itemId]);
});

RegisterNuiCallbackType('reset') // register the type

// register a magic event name
on('__cfx_nui:reset', (data, cb) => {
  TriggerServerEvent('chase:reset', getServerId(), "", -1);
  TriggerServerEvent('chase:resettimer', getServerId())

  cb({
    message: 'ok'
  })
  return;

  // cb(itemCache[itemId]);
});

on('chase:reset', () => {
  TriggerServerEvent('chase:reset', getServerId(), "", -1);
  TriggerServerEvent('chase:resettimer', getServerId())

  return;

  // cb(itemCache[itemId]);
});

RegisterNuiCallbackType('resettimer') // register the type

// register a magic event name
on('__cfx_nui:resettimer', (data, cb) => {

  TriggerServerEvent('chase:resettimer', getServerId())
  cb({
    message: 'ok'
  })
  return;



  // cb(itemCache[itemId]);
});

on('chase:resettimer', () => {

  TriggerServerEvent('chase:resettimer', getServerId())
  return;



  // cb(itemCache[itemId]);
});

RegisterNuiCallbackType('recordstart') // register the type
// register a magic event name
on('__cfx_nui:recordstart', (data, cb) => {

  emit('chase:startrecord')
  cb({
    message: 'ok'
  })
  return;
  // cb(itemCache[itemId]);
});


RegisterNuiCallbackType('recordstop') // register the type
// register a magic event name
on('__cfx_nui:recordstop', (data, cb) => {

  emit('chase:stoprecord')
  cb({
    message: 'ok'
  })


  return

  // cb(itemCache[itemId]);
});