let areablip;
const blipdeets = {
    x: 0,
    y: 0,
    z: 0,
    width: 0,
    height: 0
}

lg = {
    x: -237,
    y: -1419,
    z: 0,
    width: 3000,
    height: 4000

}

setTick(() => {
    /* if (blipdeets.width > 0 && blipdeets.height > 0) {
        //console.log(blipdeets)
        areablip = AddBlipForArea(blipdeets.x, blipdeets.y, blipdeets.z, blipdeets.width, blipdeets.height)
        SetBlipRotation(areablip, 0)
        SetBlipColour(areablip, 0xFF00FFFA)
    } */


})



RegisterCommand('setarea', (source, args, raw) => {
    const [x,y,z] = GetEntityCoords(PlayerPedId())
    blipdeets.x = x;
    blipdeets.y = y;
    blipdeets.z = z;
    blipdeets.width = parseFloat(args[0])
    blipdeets.height = parseFloat(args[1])
    if(areablip){
        RemoveBlip(areablip);
        areablip = undefined;
    }
    areablip = AddBlipForArea(blipdeets.x, blipdeets.y, blipdeets.z, blipdeets.width, blipdeets.height)
        SetBlipRotation(areablip, 0)
        SetBlipColour(areablip, 0xFF00FF50)

    //SetBlipColour(blip, 0xFF00FF80)
})

RegisterCommand('getfloor', (source, args, raw) => {
    // GET_GROUND_Z_FOR_3D_COORD
    const [retval, groundZ] = GetGroundZFor_3dCoord(
        -162.4375,
        -601.8982,
        34.06454,
        true
    );
    console.log("retval", retval);
    console.log("groundz", groundZ);

})


/* -- o : origin
-- r : rotation (in rad)
-- c1, c2 : area corners */

function isPedInRotatedArea(o, r, c1, c2) {
    let v = GetEntityCoords(PlayerPedId())
    v = {
        x: (v.x - o.x) * Math.cos(r) + (v.y - o.y) * Math.sin(r) + o.x,
        y: (v.x - o.x) * Math.sin(r) - (v.y - o.y) * Math.cos(r) + o.y,
        z: v.z
    };

    return ((v.x < c1.x && v.x > c2.x) || (v.x > c1.x && v.x < c2.x)) && ((v.y < c1.y && v.y > c2.y) || (v.y > c1.y && v.y < c2.y)) && ((v.z < c1.z && v.z > c2.z) || (v.z > c1.z && v.z < c2.z))

}