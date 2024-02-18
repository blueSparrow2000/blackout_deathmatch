# BLACKOUT 
## Death match edition


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
2024.2.3~2024.2.12 Basic game mechanics


2024.2.17  When a player reaches the last gun and get a kill, game initializes itself with last winner's name on the server / Each kill advances the weapon of a player / unable to drop item & pickup guns / player drop a medkit & wearing armor and scope on death / AI health increase / on ground items are restricted to the followings: medkits/scopes/armors 


2024.2.18 last winner's name on the leaderboard / made it robust when server resets (no error)



Future plan:
- smarter AI / kill logs


## Various Tips
- Maps should be square & need to specify tile number of one side 
- Also Maps should have two layer: layer1 is for ground, layer2 is for ceiling/plants etc.
- minimap size should be fixed to 550 with frame(used in game) and 512 without frame(used for location calculation)


Tiled tip: If you hover over a tile and press ALT+C, tile (col,row) value is copied to a clipboard. Use it when map making!