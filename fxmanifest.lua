fx_version 'cerulean'
game 'gta5'
ui_page 'main.html'
author 'Bomberman'
description 'Makes the game a game of chase with an escapee and hunters, see in-game menu for details'
version '1.19.0'

resource_type 'gametype' { name = 'Chase!' }
files{
    'main.html',
    'permissions.json',
    'containerData.json',
    'NativeUI/**/*'
}
client_script "NativeUI/NativeUI.lua"
client_script "menuexample.lua"
client_script 'chase_client.js'
client_script 'menu_client.js'
client_script 'readytext_client.js'
client_script 'hud.lua'
server_script 'chase_server.js'

