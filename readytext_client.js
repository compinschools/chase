var stage = "none";
var setTime;
const messages = [];
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


onNet('chase:drawtxt',async (x,y,scale,text,r,g,b,a,duration=5000) =>{
  
    messages.push({
      x:x,
      y:y,
      scale:scale,
      text:text,
      r:r,g:g,b:b,a:a,
      time: Date.now(),
      duration: duration
    })
    
  });

onNet('chase:stage', stagelocal => {
    stage = stagelocal;
    setTime = Date.now();
    //console.log(stagelocal)
})

setTick(() => {
    if (stage != "none") {

        var current = Date.now();
        switch (stage) {
            case "onyourmarks":
                drawTxt(0.5, 0.5, 5, "On Your Marks", 255, 0, 0,255)
                break;
            case "getset":
                drawTxt(0.5, 0.5, 5, "Get Set", 255, 255, 0, 255)
                break;
            case "go":
                drawTxt(0.5, 0.5, 5, "Go", 0, 255, 0, 255)

                break;
                case "huntergo":
                    drawTxt(0.5, 0.5, 1, "Hunters have started!", 0, 255, 0, 255)
    
                    break;
            default:
                break;

        }

        if (current - setTime > 1000) {
            stage = "none";
        }
    }

    messages.forEach((message) => {
        if(Date.now() - message.time < message.duration){
        drawTxt(
          message.x,
          message.y,
          message.scale,
          message.text,
          message.r,
          message.g,
          message.b,
          message.a);
        }
    
      })

})