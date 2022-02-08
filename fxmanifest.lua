fx_version 'cerulean'
game 'gta5'

author 'Bomberman'
description 'Cut Off parts of the city'
version '2.0.0'

resource_type 'gametype' { name = 'Chase!' }

client_script 'chase_client.js'
client_script 'hud.lua'
server_script 'chase_server.js'