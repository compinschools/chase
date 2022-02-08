-- ###################################
--
--        C   O   N   F   I   G
--
-- ###################################



-- move all ui
local UI = { 

	x =  0.030 ,	-- Base Screen Coords 	+ 	 x
	y = -0.162 ,	-- Base Screen Coords 	+ 	-y

}

local uwqhdratio = (3440)/1440;
local widescreenratio = math.floor( (1920/1080)*1000);




-- ###################################
--
--             C   O   D   E
--
-- ###################################



Citizen.CreateThread(function()
	while true do Citizen.Wait(1)


		local MyPed = GetPlayerPed(-1)

		if(IsPedInAnyVehicle(MyPed, false))then

			local MyPedVeh = GetVehiclePedIsIn(GetPlayerPed(-1),false)
			local PlateVeh = GetVehicleNumberPlateText(MyPedVeh)
			local VehStopped = IsVehicleStopped(MyPedVeh)
			local VehEngineHP = GetVehicleEngineHealth(MyPedVeh) 
			local VehBodyHP = GetVehicleBodyHealth(MyPedVeh)
            local VehTankHP = GetVehiclePetrolTankHealth(MyPedVeh)
			local VehBurnout = IsVehicleInBurnout(MyPedVeh)

				Speed = GetEntitySpeed(GetVehiclePedIsIn(GetPlayerPed(-1), false)) * 2.236936

				drawRct(UI.x + 0.11, 	UI.y + 0.932, 0.12,0.03,0,0,0,150) -- Speed panel
			   drawTxt(UI.x + 0.61, 	UI.y + 1.42, 1.0,1.0,0.64 , "~w~" .. math.ceil(Speed), 255, 255, 255, 255)
				drawTxt(UI.x + 0.633, 	UI.y + 1.432, 1.0,1.0,0.4, "~w~ mph", 255, 255, 255, 255)
			
                local offset = 0.045;
			    drawTxt(offset + UI.x + 0.61,  UI.y + 1.43, 1.0,1.0,0.34 , "E: ~w~" .. math.ceil(VehEngineHP), 255, 255, 255, 255)
		
				--drawTxt(1-0.10, 1-0.04, 1.0,1.0,0.5 , "E: ~w~" .. aspect, 255, 255, 255, 255)

                drawTxt(offset + UI.x + 0.635,  UI.y + 1.43, 1.0,1.0,0.34 , "B: ~w~" .. math.ceil(VehBodyHP), 255, 255, 255, 255)
               drawTxt(offset + UI.x + 0.660,  UI.y + 1.43, 1.0,1.0,0.34 , "T: ~w~" .. math.ceil(VehTankHP), 255, 255, 255, 255)
				
			
		
			

		end		
	end
end)

--[[ function drawTxt(x,y ,width,height,scale, text, r,g,b,a)
	local aspect = GetAspectRatio(true)
    SetTextFont(4)
    SetTextProportional(0)
    SetTextScale(scale, scale)
    SetTextColour(r, g, b, a)
    SetTextDropShadow(0, 0, 0, 0,255)
    SetTextEdge(2, 0, 0, 0, 255)
    SetTextDropShadow()
    SetTextOutline()
    SetTextEntry("STRING")
    AddTextComponentString(text)
    DrawText((x *uwqhdratio)/aspect, y)
end ]]

function drawTxt(x,y ,width,height,scale, text, r,g,b,a)
	local aspect = math.floor( GetAspectRatio(true) * 1000)
    SetTextFont(4)
    SetTextProportional(0)
    SetTextScale(scale, scale)
    SetTextColour(r, g, b, a)
    SetTextDropShadow(0, 0, 0, 0,255)
    SetTextEdge(2, 0, 0, 0, 255)
    SetTextDropShadow()
    SetTextOutline()
    SetTextEntry("STRING")
    AddTextComponentString(text)
	if(aspect==widescreenratio) then
    	DrawText( ( (x - 0.12) - width/2), y - height/2 + 0.005)
	else
		DrawText( ( (x) - width/2), y - height/2 + 0.005)
	end
end 

function drawRct(x,y,width,height,r,g,b,a)
	local aspect = math.floor( GetAspectRatio(true) * 1000)
	if(aspect==widescreenratio) then
		DrawRect(((x-0.12) + width/2), y + height/2, width, height, r, g, b, a)
	else
		DrawRect(((x) + width/2), y + height/2, width, height, r, g, b, a)
	end
end