# BLACKOUT 
## Death match edition

First to reach 15 kills is the winner!


Your gun changes each kill, getting harder to kill others!

## Required
- npm
- express
- socket.io
- line-circle-collision
- tmx-parser
- nodemon (optional)
- npm install --save-optional bufferutil utf-8-validate

Do: npm i tmx-parser


Also need 'Tiled' app


Initial code based on: 
https://www.youtube.com/watch?v=4GQCkW23rTU


## How to run the server
- npm run dev


or 


- nodemon src/backend.js

- nodemon ./src/backend.js


## How to join the server
 - on hosting device


 URL: localhost:5000


 - on other device



 URL: [hosting device ip - use ipconfig]:5000


 for example: 192.168.0.27:5000

 ## Sample run
<p align="center">Start screen<br /></p>


![interface](../main/run_images/intro.png)

<p align="center">Ingame<br /></p>


![interface](../main/run_images/ingame.png)

<p align="center">map: Wilderness [30 x 30] <br /></p>


![interface](../main/run_images/minimap_Wilderness_no_frame.png)


<p align="center">map: Sahara [50 x 50] <br /></p>


![interface](../main/run_images/minimap_Sahara_no_frame.png)


<p align="center">map: MilitaryBase [100 x 100]  (Comming Soon!)<br /></p>


![interface](../main/run_images/minimap_MilitaryBase.png)


 ## Version history
2024.2.3~2024.2.12 Basic game mechanics


2024.2.17  When a player reaches the last gun and get a kill, game initializes itself with last winner's name on the server / Each kill advances the weapon of a player / unable to drop item & pickup guns / player drop a medkit & wearing armor and scope on death / AI health increase / on ground items are restricted to the followings: medkits/scopes/armors 


2024.2.18 last winner's name on the leaderboard / made it robust when server resets (no error)


2024.2.20 Added kill log


2024.2.27 Flare guns are now available 


2024.2.29 Shows whether player weared armor or not


2024.3.1 Added firework particle effect for the winner! / inventory shown in html


2024.3.3 VSS sound range reduced significantly + mag size increased


2024.4.9 VSS sound range reduced significantly again / USAS12 now have an explosive ammo / Deagle added 


2024.4.11 Added pings: make a ping in the minimap => ping direction will show up (on frontend only) 
/ Added particle: Blood effect when enemy or player is hit by a projectile


2024.6.16 Added throwables: grenade, smoke (grenade), flash / Holding items including placable, consumable and throwable will be displayed


2024.6.17 Added new map: Military base / water slow down effect


2024.6.19 Smooth vehicle movement


2024.6.20 Added airdrop gun: Lynx (penetrates players & enemies) / Added airstrike: emergency cover & plane speeds adjusted / Consumable update: Added adrenaline & drink / Armor update: anti-blast & turtle


Future plan:
- Melee update: frisby / sakura (jett skill)
- Inventory selection show up
- vehicle-vehicle collision
- Military base: finish structures / add trees (object) in the dense forest

- Gun recoil effect 
- SONA (shows location of enemy in the map & direction for 1 seconds)
- smarter AI (zombies shoots projectiles)
- wind update
- make melee weapon skin (katana etc.) + more powerful melee weapons!

## Various Tips
- Maps should be square & need to specify tile number of one side 
- Also Maps should have two layer: layer1 is for ground, layer2 is for ceiling/plants etc.
- minimap size should be fixed to 550 with frame(used in game) and 512 without frame(used for location calculation)
- Decibel Amplification site online) https://www.mp3louder.com/ko/

Tiled tip: If you hover over a tile and press ALT+C, tile (col,row) value is copied to a clipboard. Use it when map making! You can directly modify tile png file (military_base_tile) in the public & src directory for different texture pack! 