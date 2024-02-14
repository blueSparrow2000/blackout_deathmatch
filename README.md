## Required
- npm
- express
- socket.io
- line-circle-collision
- tmx-parser
- nodemon (optional)

Do: npm i tmx-parser


Also need 'Tiled' app


Initial code based on: 
https://www.youtube.com/watch?v=4GQCkW23rTU


## How to run the server
- npm run dev


or 


- nodemon src/backend.js


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

<p align="center">map: Wilderness<br /></p>


![interface](../main/run_images/minimap_Wilderness_no_frame.png)


<p align="center">map: Sahara<br /></p>


![interface](../main/run_images/minimap_Sahara_no_frame.png)


<p align="center">map: MilitaryBase (Comming Soon!)<br /></p>


 ## Version history
2024.2.3 Basic multiplayer with camera


2024.2.4 Making compatiable with my other multiplayer game


2024.2.5 Added Scope & House


2024.2.6 Added Vehicles: Car, Fennek(BRDM), APC


2024.2.7 Added new map: Sahara / New weapon: tankBuster / New vehicle: tank & turret & raptor & B2 / Skin system: (username) HALO, VOID is added / New object: Barrel / Frontend optimization


2024.2.8 Added New object: Mine / New explosion: shockwave (for mine & tankBuster) + explosion sound effect is enhanced! / New gun: flareGun => calls airstrike! / TYPES OF AIRSTRIKES: bomb, supply, request vehicle(tank), transport


2024.2.9 Added Airstrike plane sound effect (using sound request)  / Added BLACKOUT WIKI (excel file)


2024.2.12 Added item drop button: Q


**1 week of developement ends**

- Tweak log
2024.2.12 Buffed .45ACP damage from 0.5 -> 0.8 / absorb armor special effect starts from 0.5 -> 0.8 / changed effective DPS calculation / vector firerate nerfed 40 -> 50


2024.2.13 Gun's start distance is at the gun's front end / Shoot more accurately while standing still (spraying - hold shift - cause bullet spread)


Future plan
- ~~vehicle sound effects~~ canceled due to lagging
- ~~Add 2-person car (vehicle)~~ canceled due to policy: "no rotation in the game"
- Make a death match version: Each kill advances the weapon of a player(cannot be dropped) + smarter AI & AI health increase + on ground items are: medkits/scopes/armors - medkits are used immediately when interact
- Make a death match version: When a player reaches the last gun and get a kill, game initializes itself with last winner's name on the leaderboard / unable to drop item & pickup guns / player drop a medkit only when death

- Code separation (backend) to modules
- Add door & window (object entity)
- Particle effects
- custom vehicle designs?



## Various Tips
- Maps should be square & need to specify tile number of one side 
- Also Maps should have two layer: layer1 is for ground, layer2 is for ceiling/plants etc.
- minimap size should be fixed to 550 with frame(used in game) and 512 without frame(used for location calculation)


Tiled tip: If you hover over a tile and press ALT+C, tile (col,row) value is copied to a clipboard. Use it when map making!