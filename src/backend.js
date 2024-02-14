// server constants
const TICKRATE = 15
const SCREENWIDTH = 1024
const SCREENHEIGHT = 576
const ITEMRADIUS = 16


///////////////////////////////////// MAP CONFIGURATION /////////////////////////////////////
const MAPDICT = {'Wilderness':30, 'Sahara':50, 'MilitaryBase':100} // mapName : map tile number
let MAPNAME = 'Sahara' // 'Wilderness' //'Sahara' 
let MAPTILENUM = MAPDICT[MAPNAME] // can vary, but map is SQUARE!
///////////////////////////////////// MAP CONFIGURATION /////////////////////////////////////

// map info
const TILES_IN_ROW = 23 // only use designated tileset: 23 kinds of tiles are in a row
const TILE_SIZE_HALF = 64;
const TILE_SIZE = TILE_SIZE_HALF*2 //128;
let MAPWIDTH = TILE_SIZE*MAPTILENUM
let MAPHEIGHT =TILE_SIZE*MAPTILENUM
const loadMap = require("./mapLoader")


const collide = require('line-circle-collision')

const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);


// Server Data
const backEndPlayers = {}
const backEndEnemies = {}
const backEndProjectiles = {}
const backEndItems = {}
const backEndVehicles = {}
backEndItems[0] = {
    itemtype: 'melee', groundx:0, groundy:0, size:{length:5, width:5}, name:'fist', color:'black', iteminfo:{ammo:'inf', ammotype:'bio'} ,onground:false, myID: 0, deleteRequest:false
}
const backEndObjects = {}
const backEndAirstrikes = {}
const backEndSoundRequest = {}

let enemyId = 0
let projectileId = 0
let itemsId = 0 
let objectId = 0
let vehicleId = 0
let airstrikeId = 0
let soundID = 0

// player attributes
const INVENTORYSIZE = 4
const PLAYERRADIUS = 16 
const PLAYERSPEED = 2 // pixel
const PLAYERHEALTH = 8
const PLAYERHEALTHMAX = 8
const GUNHEARRANGE = 700
const PLAYER_JOIN_DELAY = 1000

//to check if there exists any player left
let USERCOUNT = [0]

// for bullets
const FRICTION = 0.999//0.992
const HIGHFRICTION = 0.98
const EXTREMEFRICTION = 0.88

// enemy setting (manual)
const SPAWNENEMYFLAG = true
let ENEMYSPAWNRATE = 30000
let ENEMYNUM = 1
let ENEMYCOUNT = 0

const GROUNDITEMFLAG = true
let GHOSTENEMY = false

const ENTITYDISTRIBUTIONS = ["test", "battleRoyale"]
const ENTITYDISTRIBUTION_MARK = 1

// for items
const MINE_DETECTION_RADIUS = 32
const MINE_DETONATE_COUNTDOWN = 10 // 1 tick = 15ms (20 tick is about 0.3s)

const BARREL_RADIUS = 24
const BARREL_HEALTH = 2


const gunInfo = {
    // 'railgun':{travelDistance:0, damage: 3, shake:0, num: 1, fireRate: 1000, projectileSpeed:0, magSize:2, reloadTime: 1800, ammotype:'battery', size: {length:50, width:5}}, // pierce walls and entities
    // 'CrossBow':{travelDistance:650, damage: 10, shake:0, num: 1, fireRate: 100, projectileSpeed:8, magSize: 1, reloadTime: 1400, ammotype:'bolt', size: {length:21, width:2}}, 
    // 'GuideGun':{travelDistance:800, damage: 3, shake:0, num: 1, fireRate: 2100, projectileSpeed:6, magSize: 5, reloadTime: 1800, ammotype:'superconductor', size: {length:35, width:8}}, 
    'grenadeLauncher':{travelDistance:576, damage: 3, shake:0, num: 1, fireRate: 1600, projectileSpeed:13, magSize: 3, reloadTime: 1800, ammotype:'fragment', size: {length:25, width:4}}, 
    'fragment':{travelDistance:192, damage: 2, shake:3, num: 1, fireRate: 100, projectileSpeed:8, magSize: 5, reloadTime: 1400, ammotype:'fragment', size: {length:13, width:1}}, 
    'tankBuster':{travelDistance:832, damage: 50, shake:0, num: 1, fireRate: 4000, projectileSpeed:8, magSize: 1, reloadTime: 6000, ammotype:'rocket', size: {length:35, width:4}}, 
    'shockWave':{travelDistance:192, damage: 15, shake:6, num: 1, fireRate: 300, projectileSpeed:18, magSize: 1, reloadTime: 1400, ammotype:'shockWave', size: {length:14, width:2}}, 
    'flareGun':{travelDistance:320, damage: 0, shake:0, num: 1, fireRate: 1000, projectileSpeed:3, magSize: 1, reloadTime: 1000, ammotype:'red', size: {length:15, width:4}}, // default is red


    'M1':{travelDistance:1472, damage: 5, shake:0, num: 1, fireRate: 1600, projectileSpeed:42, magSize: 5, reloadTime: 4000, ammotype:'7mm', size: {length:42, width:3}}, 
    'mk14':{travelDistance:1088, damage: 3, shake:1, num: 1, fireRate: 600, projectileSpeed:32, magSize:14, reloadTime: 3300, ammotype:'7mm', size: {length:34, width:2} }, 
    'SLR':{travelDistance:1216, damage: 3.5, shake:1, num: 1, fireRate: 350, projectileSpeed:36, magSize: 10, reloadTime: 2700, ammotype:'7mm', size: {length:38, width:2}}, 
    'AWM':{travelDistance:1600, damage: 9, shake:0, num: 1, fireRate: 2000, projectileSpeed:30, magSize:  7, reloadTime: 4000, ammotype:'7mm', size: {length:50, width:3}}, 

    'pistol':{travelDistance:576, damage: 1, shake:3, num: 1, fireRate: 300, projectileSpeed:15, magSize:15, reloadTime: 1100, ammotype:'5mm', size: {length:17, width:2}}, 
    'M249':{travelDistance:832, damage: 1, shake:1, num: 1, fireRate: 75, projectileSpeed:23, magSize:150, reloadTime: 7400, ammotype:'5mm', size: {length:28, width:6}},
    'VSS':{travelDistance:1088, damage: 1, shake:1, num: 1, fireRate: 100, projectileSpeed:19, magSize:10, reloadTime: 2300, ammotype:'5mm' , size: {length:27, width:2}}, 
    'ak47':{travelDistance:704, damage: 1, shake:1, num: 1, fireRate: 110, projectileSpeed:21, magSize:30, reloadTime: 2000, ammotype:'5mm', size: {length:28, width:3}}, 
    'FAMAS':{travelDistance:576, damage: 1, shake:2, num: 1, fireRate: 90, projectileSpeed:17, magSize: 30, reloadTime: 3200, ammotype:'5mm', size: {length:22, width:3}}, 
    
    's686':{travelDistance:320, damage: 1, shake:5, num: 5, fireRate: 180, projectileSpeed:10, magSize:2, reloadTime: 1200, ammotype:'12G', size: {length:13, width:5}},
    'DBS':{travelDistance:448, damage: 1, shake:3, num: 3, fireRate: 400, projectileSpeed:13, magSize:14, reloadTime: 6000, ammotype:'12G', size: {length:16, width:5}},
    'usas12':{travelDistance:448, damage: 1, shake:3, num: 2, fireRate: 180, projectileSpeed:14, magSize:5, reloadTime: 2300, ammotype:'12G', size: {length:18, width:4}},
    
    'ump45':{travelDistance:700, damage: 0.8, shake:2, num: 1, fireRate: 85, projectileSpeed:16, magSize:25, reloadTime: 2800, ammotype:'45ACP', size: {length:19, width:4}},
    'vector':{travelDistance:600, damage: 0.8, shake:1, num: 1, fireRate: 50, projectileSpeed:17, magSize:19, reloadTime: 2600, ammotype:'45ACP', size: {length:18, width:3}},
    'mp5':{travelDistance:650, damage: 0.8, shake:1, num: 1, fireRate: 70, projectileSpeed:19, magSize:30, reloadTime: 2100, ammotype:'45ACP', size: {length:20, width:3}},
    
    'fist':{travelDistance:24, damage: 0.2, shake:0, num: 1, fireRate: 300, projectileSpeed:6, magSize:0, reloadTime: 0, ammotype:'bio', size: {length:0, width:4}},
    'knife':{travelDistance:32, damage: 0.4, shake:0, num: 1, fireRate: 200, projectileSpeed:8, magSize:0, reloadTime: 0, ammotype:'sharp', size: {length:0, width:2}},
    'bat':{travelDistance:48, damage: 1, shake:0, num: 1, fireRate: 500, projectileSpeed:6, magSize:0, reloadTime: 0, ammotype:'hard', size: {length:0, width:3}},
}
let defaultGuns = []//['tankBuster','shockWave','fragment','grenadeLauncher']// 

// 'guntypes' is except for grenade launcher and fragments! Since they are OP
const gunTypes = [ 'M1', 'mk14', 'SLR','AWM',    'pistol','VSS', 'M249', 'ak47', 'FAMAS',    's686','DBS', 'usas12',     'ump45','vector','mp5'] // except special guns: 'tankBuster', 'grenadeLauncher', 'fragment'
const flareTypes = ['red','green','yellow','white']
const meleeTypes = ['knife','bat']
const gunOrderInDeathmatch = ['grenadeLauncher','AWM','vector','s686','ak47','SLR','FAMAS','usas12','mp5','M249','mk14','VSS','DBS','ump45','M1','pistol']


const consumableTypes = ['bandage','medkit']
const consumableInfo = {
'bandage': {size:{length:8, width:8}, color: 'gray', healamount: 2 },
'medkit': {size:{length:12, width:12}, color: 'gray', healamount: PLAYERHEALTHMAX},
}

const armorTypes = ['absorb', 'reduce']
const armorInfo = {
'absorb':{color: 'DarkTurquoise',size:{length:12, width:12}, amount:5, radius:1},
'reduce':{color: 'DeepSkyBlue',size:{length:12, width:12}, amount:5, radius:2},
}

const scopeTypes = ['1','2'] // currently available scope!

const vehicleTypes = ['car','Fennek','APC', 'tank', 'turret', 'raptor','B2']
const SHOOTER_VEHICLES_BACKEND = ["APC", "tank" ,"turret" ,"raptor","B2"]


const placeableTypes = ['barrel', 'mine']
const placeableInfo = {
'barrel':{color: 'gray',size:{length:12, width:12},variantName:''},
'mine':{color: 'gray',size:{length:12, width:12},variantName:''},
}



function armorEffect(armorID, damage){
  if (armorID <= 0){ // no armor
    return damage
  }
  const armortype = backEndItems[armorID].name
  switch (armortype){
    case 'absorb': // absorb 0.2 damage: immune to fist
    //console.log("absorb")
      if (damage>0.8){ // absorb more
        return Math.max(damage - 0.4, 0)
      }
      return Math.max(damage - 0.2, 0)
    case 'reduce': // reduce 10% of damage
    //console.log("reduce")
      if (damage>3){// reduce 30% of damage if large
        return (7*damage)/10
      }
      return (9*damage)/10
    default:
      console.log("Item ID is malfunctioning")
      return damage
  }
}


// For item drops
function getCoordTilesCenter(location){
  return {x:location.col*TILE_SIZE + Math.round(TILE_SIZE/2), y:location.row*TILE_SIZE + Math.round(TILE_SIZE/2)}
}

function getCoordTiles(location){
  return {x:location.col*TILE_SIZE, y:location.row*TILE_SIZE}
}

// GROUND drop items
if (GROUNDITEMFLAG){
  ///////////////////////////////////////// TEST DROPS /////////////////////////////////////////
  if (ENTITYDISTRIBUTIONS[ENTITYDISTRIBUTION_MARK]==="test"){
    makeObjects("wall", 30, {orientation: 'vertical',start:{x:1000,y:1000}, end:{x:1000,y:2000}, width:20, color: 'gray'})
    makeObjects("wall", 30, {orientation: 'horizontal',start:{x:1000,y:2000}, end:{x:1500,y:2000}, width:20, color: 'gray'})
    makeObjects("wall", 30, {orientation: 'vertical',start:{x:1500,y:1000}, end:{x:1500,y:2000}, width:20, color: 'gray'})
    makeObjects("wall", 30, {orientation: 'horizontal',start:{x:1000,y:1000}, end:{x:1500,y:1000}, width:20, color: 'gray'})
  
    makeObjects("hut", 1000, {center:{x:1250,y:1500}, radius: 50, color:'gray'})
  
    const groundItemSpawnLoc = {x:500, y:500}
    const groundgunList = [ 'M1', 'mk14', 'SLR','AWM',    'VSS', 'M249', 'ak47', 'FAMAS',    's686','DBS', 'usas12',     'ump45','vector','mp5']
    const groundGunAmount = groundgunList.length
    for (let i=0;i<groundGunAmount; i++){
      makeNdropItem('gun', groundgunList[i], {x:groundItemSpawnLoc.x + Math.round(60*(i - groundGunAmount/2)), y:groundItemSpawnLoc.y} )
    }
    
    const groundConsList = ['bandage','bandage','bandage','bandage','bandage','medkit']
    const groundConsAmount = groundConsList.length
    for (let i=0;i<groundConsAmount; i++){
      makeNdropItem('consumable', groundConsList[i], {x:groundItemSpawnLoc.x + Math.round(50*(i - groundConsAmount/2)), y:groundItemSpawnLoc.y - 100})
    }
  
    const groundArmorAmount = armorTypes.length
    for (let i=0;i<groundArmorAmount; i++){
      makeNdropItem( 'armor', armorTypes[i], {x:groundItemSpawnLoc.x + Math.round(50*(i - groundArmorAmount/2)), y:groundItemSpawnLoc.y - 150})
    }
  
    const groundMeleeList = ['knife','bat']
    const groundMeleeAmount = groundMeleeList.length
    for (let i=0;i<groundMeleeAmount; i++){
      makeNdropItem('melee', groundMeleeList[i], {x:groundItemSpawnLoc.x + Math.round(50*(i - groundMeleeAmount/2)), y:groundItemSpawnLoc.y - 200})
    }
  }

  ///////////////////////////////////////// BATTLE ROYALE DROPS /////////////////////////////////////////
  else if (MAPNAME==='Wilderness' && ENTITYDISTRIBUTIONS[ENTITYDISTRIBUTION_MARK]==="battleRoyale"){
    // special tile locations in 'Wilderness'
    defaultGuns = ['pistol'] // give additional pistol

    const TILESLOC = {"center":{row:14,col:14},"house1":{row:13,col:2},"house2":{row:2,col:24},"house3":{row:5,col:24},
    "rock1":{row:0,col:29},"rock2":{row:6,col:15}, "rockMiddle":{row:0,col:14},
    "forest1":{row:21,col:27},"forest2":{row:22,col:25},"forestMiddle":{row:14,col:27},
    "tree1":{row:21,col:12},"tree2":{row:21,col:4},"tree3":{row:16,col:14},"tree4":{row:17,col:21},"tree5":{row:13,col:23},
    "sandroad1":{row:28,col:0},"sandroad2":{row:28,col:29},"sandroadMiddle":{row:28,col:14}}
    

    spawnVehicle(getCoordTilesCenter(TILESLOC["center"]))
    spawnVehicle(getCoordTilesCenter(TILESLOC["forestMiddle"]))
    spawnVehicle(getCoordTilesCenter(TILESLOC["sandroadMiddle"]),'APC')
    spawnVehicle(getCoordTilesCenter(TILESLOC["rockMiddle"]),'Fennek')

    makeHouse_2Tiles(getCoordTiles(TILESLOC["house1"]))
    makeHouse_2Tiles(getCoordTiles(TILESLOC["house2"]))
    makeHouse_2Tiles(getCoordTiles(TILESLOC["house3"]))

    makeNdropItem('gun', 'ump45', getCoordTilesCenter(TILESLOC["house1"]))
    makeNdropItem('scope', "1", getCoordTilesCenter(TILESLOC["house1"]))
    makeNdropItem('gun', 'vector', getCoordTilesCenter(TILESLOC["house2"]))
    makeNdropItem('gun', 'mp5', getCoordTilesCenter(TILESLOC["house3"]))

    // some guns 
    const rock1loc = getCoordTilesCenter(TILESLOC["rock1"])
    makeNdropItem('gun', 'AWM', rock1loc)
    makeNdropItem('scope', "2", rock1loc) // scope 3 is laggy to other PCs
    // console.log(rockloc)
    // console.log(MAPWIDTH)
    const rock2loc = getCoordTilesCenter(TILESLOC["rock2"])
    makeNdropItem('gun', 'M249', rock2loc)
    makeNdropItem('scope', "1", rock2loc)

    const sandroad1loc = getCoordTilesCenter(TILESLOC["sandroad1"])
    makeNdropItem('gun', 'usas12', sandroad1loc)

    const sandroad2loc = getCoordTilesCenter(TILESLOC["sandroad2"])
    makeNdropItem('gun', 's686', sandroad2loc)

    const tree2loc = getCoordTilesCenter(TILESLOC["tree2"])
    makeNdropItem('gun', 'grenadeLauncher', tree2loc)
    

    makeNdropItem('gun', 'FAMAS', getCoordTilesCenter(TILESLOC["tree3"]))
    makeNdropItem('melee', 'knife', getCoordTilesCenter(TILESLOC["tree4"]))
    makeNdropItem('gun', 'ak47', getCoordTilesCenter(TILESLOC["tree5"]))


    // some health packs
    const tree1loc = getCoordTilesCenter(TILESLOC["tree1"])
    makeNdropItem('consumable', 'medkit',tree1loc)

    // some armors
    const forest1loc = getCoordTilesCenter(TILESLOC["forest1"])
    makeNdropItem( 'armor', 'absorb', forest1loc)

    const forest2loc = getCoordTilesCenter(TILESLOC["forest2"])
    makeNdropItem( 'armor', 'reduce', forest2loc)
    makeNdropItem('scope', "1", forest2loc)

  }

  else if (MAPNAME==='Sahara' && ENTITYDISTRIBUTIONS[ENTITYDISTRIBUTION_MARK]==="battleRoyale"){
    const TILESLOC_N_REQUEST = {
      'APCLocation1':{row: 24, col:5, request:['vehicle','turret']},
      'APCLocation2':{row: 27, col:5, request:['vehicle','turret']},
      'APCLocation3':{row: 43, col:11, request:['vehicle','APC']},
      'APCLocation4':{row: 8, col:11, request:['vehicle','APC']},
      'CarLoc1':{row: 20, col:22, request:['vehicle','car']},
      'CarLoc2':{row: 12, col:30, request:['vehicle','car']},
      'CarLoc3':{row: 12, col:34, request:['vehicle','car']},
      'CarLoc4':{row: 12, col:45, request:['vehicle','car']},
      'CarLoc5':{row: 29, col:42, request:['vehicle','car']},
      'CarLoc6':{row: 32, col:42, request:['vehicle','car']},
      'CarLoc7':{row: 29, col:29, request:['vehicle','car']},
      'CarLoc8':{row: 32, col:29, request:['vehicle','car']},
      'RandomTreeLoc1':{row: 8, col:15, request:['gun','random']},
      'RandomTreeLoc2':{row: 11, col:11, request:['gun','random']},
      'RandomTreeLoc3':{row: 14, col:13, request:['gun','random']},
      'RandomTreeLoc4':{row: 17, col:9, request:['gun','random']},
      'RandomTreeLoc5':{row: 19, col:14, request:['gun','random']},
      'RandomTreeLoc6':{row: 22, col:12, request:['gun','random']},
      'RandomTreeLoc7':{row: 25, col:8, request:['gun','random']},
      'RandomTreeLoc8':{row: 27, col:12, request:['gun','random']},
      'RandomTreeLoc9':{row: 27, col:14, request:['gun','random']},
      'RandomTreeLoc10':{row: 30, col:9, request:['gun','random']},
      'RandomTreeLoc11':{row: 32, col:12, request:['gun','random']},
      'RandomTreeLoc12':{row: 36, col:12, request:['gun','random']},
      'RandomTreeLoc13':{row: 37, col:10, request:['gun','random']},
      'RandomTreeLoc14':{row: 39, col:14, request:['gun','random']},
      'RandomTreeLoc15':{row: 42, col:13, request:['gun','random']},
      'RandomTreeLoc16':{row: 44, col:15, request:['gun','random']},
      'House_15TilesRoof1':{row: 46, col:24, request:['consumable','bandage']},
      'House_15TilesRoof2':{row: 46, col:29, request:['consumable','bandage']},
      'House_15TilesRoof3':{row: 46, col:34, request:['consumable','bandage']},
      'House_15TilesRoof4':{row: 46, col:39, request:['consumable','bandage']},
      'House_15TilesRoof5':{row: 46, col:44, request:['consumable','bandage']},
      'House_15TilesCenter1':{row: 44, col:23, request:['gun','random']},
      'House_15TilesCenter2':{row: 44, col:28, request:['gun','random']},
      'House_15TilesCenter3':{row: 44, col:33, request:['gun','random']},
      'House_15TilesCenter4':{row: 44, col:38, request:['gun','random']},
      'House_15TilesCenter5':{row: 44, col:43, request:['gun','random']},
      'House_CourtyardCorner1':{row: 28, col:38, request:['consumable','medkit']},
      'House_CourtyardCorner2':{row: 28, col:33, request:['consumable','medkit']},
      'House_CourtyardCorner3':{row: 33, col:33, request:['consumable','medkit']},
      'House_CourtyardCorner4':{row: 33, col:38, request:['consumable','medkit']},
      'CourtyardCorner1':{row: 30, col:35, request:['scope','random']},
      'CourtyardCorner2':{row: 30, col:36, request:['scope','random']},
      'CourtyardCorner3':{row: 31, col:35, request:['scope','random']},
      'CourtyardCorner4':{row: 31, col:36, request:['scope','random']},
      'GardenCenter1':{row: 19, col:37, request:['gun','grenadeLauncher']},
      'House_36TilesRoof1':{row: 18, col:28, request:['gun','M1']},
      'House_36TilesItemPoints1':{row: 13, col:23, request:['armor','random']},
      'House_36TilesItemPoints2':{row: 13, col:28, request:['armor','random']},
      'House_36TilesItemPoints3':{row: 18, col:23, request:['armor','random']},
      'House_42TilesRoof1':{row: 21, col:43, request:['gun','s686']},
      'House_42TilesItemPoints1':{row: 14, col:36, request:['armor','random']},
      'House_42TilesItemPoints2':{row: 13, col:43, request:['armor','random']},
      'RockyItempoints1':{row: 1, col:29, request:['melee','random']},
      'RockyItempoints2':{row: 0, col:32, request:['melee','random']},
      'RockyItempoints3':{row: 1, col:37, request:['melee','random']},
      'RockyItempoints4':{row: 2, col:48, request:['melee','random']},
      'ForestItemPoints1':{row: 30, col:49, request:['gun','random']},
      'ForestItemPoints2':{row: 28, col:49, request:['gun','random']},
      'ForestItemPoints3':{row: 24, col:49, request:['gun','random']},
      'ForestItemPoints4':{row: 35, col:49, request:['gun','random']},
      'ForestItemPoints5':{row: 20, col:49, request:['gun','random']},
    } 

    // AUTO DROPPER
    const mapDropKeys = Object.keys(TILESLOC_N_REQUEST)
    const ItemDictionary_For_Random = {'gun':gunTypes, 'scope':scopeTypes, 'consumable':consumableTypes,'melee':meleeTypes,'armor':armorTypes,}
    for (let i=0;i<mapDropKeys.length;i++){
      const mapDropKey = mapDropKeys[i] // name of location
      const tileloc_request = TILESLOC_N_REQUEST[mapDropKey] // info

      if (tileloc_request.request[0]==="vehicle"){ // vehicle
        if (tileloc_request.request[1]==='random'){
          const maxVariationOfItem = vehicleTypes.length
          const idxItem = Math.round(Math.random()*(maxVariationOfItem-1))
          spawnVehicle(getCoordTilesCenter(tileloc_request),vehicleTypes[idxItem])

        }else{ // specified
          spawnVehicle(getCoordTilesCenter(tileloc_request),tileloc_request.request[1])
        }

      } else{ // item

        if (tileloc_request.request[1]==='random'){
          const ItemList = ItemDictionary_For_Random[tileloc_request.request[0]]
          const maxVariationOfItem = ItemList.length
          const idxItem = Math.round(Math.random()*(maxVariationOfItem-1)) // first and last item has less prob! Must be at least 2
          makeNdropItem(tileloc_request.request[0], ItemList[idxItem],getCoordTilesCenter(tileloc_request))
          //console.log(tileloc_request.request[0], ItemList[idxItem],getCoordTilesCenter(tileloc_request))
        } else{ // specified drop
          makeNdropItem(tileloc_request.request[0], tileloc_request.request[1],getCoordTilesCenter(tileloc_request))
          //console.log(tileloc_request.request[0], tileloc_request.request[1],getCoordTilesCenter(tileloc_request))
        }

      }

    }
    // AUTO DROPPER
    
    // MANUAL DROP
    // test feature
    makeNdropItem('scope', "3" ,getCoordTilesCenter({row:1,col:1})) // get with your own risk: will be laggy!
    makeNdropItem('gun', 'tankBuster' ,getCoordTilesCenter({row:49,col:48})) // The only anti-tank weapon

    // makeNdropItem('placeable', 'barrel' ,getCoordTilesCenter({row:2,col:3})) 
    makeNdropItem('placeable', 'barrel' ,getCoordTilesCenter({row:2,col:4}),onground=true,variantNameGiven='SaharaBarrel') 
   
    makeObjects("mine", MINE_DETONATE_COUNTDOWN, {center:getCoordTilesCenter({row: 30, col: 21}), radius: MINE_DETECTION_RADIUS, color:'gray', placerID:0}, givenname ='SaharaMine')
    makeObjects("mine", MINE_DETONATE_COUNTDOWN, {center:getCoordTilesCenter({row: 31, col: 21}), radius: MINE_DETECTION_RADIUS, color:'gray', placerID:0}, givenname ='SaharaMine')

    for (let i=0;i<2;i++){
      makeNdropItem('placeable', 'mine' ,getCoordTilesCenter({row:47,col:2}),onground=true,variantNameGiven='SaharaMine') 
    }
    for (let i=0;i<2;i++){
      makeNdropItem('placeable', 'mine' ,getCoordTilesCenter({row:1,col:46}),onground=true,variantNameGiven='') 
    }

    for (let i=0;i<1;i++){
      makeNdropItem('gun', 'flareGun', getCoordTilesCenter({row:24,col:3}),onground=true,variantNameGiven='green')// variant should be red,green etc.
      makeNdropItem('gun', 'flareGun', getCoordTilesCenter({row:14,col:5}),onground=true,variantNameGiven='red')// variant should be red,green etc.
      makeNdropItem('gun', 'flareGun', getCoordTilesCenter({row:27,col:3}),onground=true,variantNameGiven='yellow')// variant should be red,green etc.
      makeNdropItem('gun', 'flareGun', getCoordTilesCenter({row:37,col:5}),onground=true,variantNameGiven='white')// variant should be red,green etc.
    }


    // MAKE HOUSES
    for (let i=0;i<5;i++){
      makeHouse_15Tiles(getCoordTiles(TILESLOC_N_REQUEST[`House_15TilesCenter${i+1}`]))
    }

    makeHouse_36Tiles(getCoordTiles(TILESLOC_N_REQUEST['House_36TilesRoof1']))
    makeHouse_42Tiles(getCoordTiles(TILESLOC_N_REQUEST['House_42TilesRoof1']))
    makeHouse_Courtyard(getCoordTiles(TILESLOC_N_REQUEST['House_CourtyardCorner2'])) // top left inner corner


    // Make custom vehicles
    // spawnVehicle(getCoordTilesCenter({row:46,col:1}),'car')
    // spawnVehicle(getCoordTilesCenter({row:46,col:2}), 'tank')
    // // these are for next map: military base
    // spawnVehicle(getCoordTilesCenter({row:46,col:3}), 'raptor')
    // spawnVehicle(getCoordTilesCenter({row:46,col:4}), 'B2')
    // spawnVehicle(getCoordTilesCenter({row:46,col:5}), 'Fennek')
    // spawnVehicle(getCoordTilesCenter({row:46,col:6}), 'APC')
    // spawnVehicle(getCoordTilesCenter({row:46,col:7}), 'turret')


    const BarrelRowNum = 2
    const BarrelColNum = 3
    
    for (let i=0;i<BarrelRowNum;i++){
      for (let j=0;j<BarrelColNum;j++){
        makeObjects("barrel", BARREL_HEALTH, {center:getCoordTilesCenter({row: 6+i, col:1+j}), radius: BARREL_RADIUS, color:'gray',placerID:0}, givenname ='SaharaBarrel')
      }
    }

    for (let i=0;i<BarrelRowNum;i++){
      for (let j=0;j<BarrelColNum;j++){
        makeObjects("barrel", BARREL_HEALTH, {center:getCoordTilesCenter({row: 40+i, col:1+j}), radius: BARREL_RADIUS, color:'gray',placerID:0}, givenname ='SaharaBarrel')
      }
    }


  }

}


function itemBorderUpdate(item){
  if (item.groundx < 0){
    item.groundx = 0
  }else if (item.groundx > MAPWIDTH){
    item.groundx = MAPWIDTH
  }
  if (item.groundy < 0){
    item.groundy = 0
  } else if(item.groundy > MAPHEIGHT){
    item.groundy = MAPHEIGHT
  }
}


function getCurItem(currentPlayer){
  let inventoryPointer = currentPlayer.currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  let currentHoldingItem = currentPlayer.inventory[inventoryPointer] // if it is 0, it is fist
  return currentHoldingItem
}

function get_player_center_mouse_distance(mousePos, centerX, centerY){
  return Math.hypot(mousePos.x - centerX,mousePos.y - centerY)
}

function addProjectile(angle,currentGun,playerID,location,startDistance,holding=false){
  projectileId++
  const guninfoGET = gunInfo[currentGun]
  let  shakeProj = guninfoGET.shake
  if (holding){
    shakeProj *= 2 // double spread
  }
  const bulletSpeed = guninfoGET.projectileSpeed
  const velocity = { // with shake!
    x: Math.cos(angle) * bulletSpeed + (Math.random()-0.5) * shakeProj,
    y: Math.sin(angle) * bulletSpeed + (Math.random()-0.5) * shakeProj
  }
  const radius = 5

  let travelDistance = guninfoGET.travelDistance
  const projDamage =  guninfoGET.damage

  let color = 'black'
  if (currentGun==='flareGun'){
    //const currentGunID = backEndPlayers[playerID].inventory[backEndPlayers[playerID].currentSlot-1]
    const thisPlayer = backEndPlayers[playerID]
    const itemInfoFlareGun = getCurItem(thisPlayer).iteminfo
    color = itemInfoFlareGun.ammotype
    // recalculate distance: max travel distance or player mouse pos
    travelDistance = Math.min(guninfoGET.travelDistance, Math.max(startDistance, get_player_center_mouse_distance(thisPlayer.mousePos, thisPlayer.canvasWidth/2, thisPlayer.canvasHeight/2) - startDistance))
  }

  if (startDistance>0){
    backEndProjectiles[projectileId] = {
      x:location.x + Math.cos(angle)*startDistance, y:location.y + Math.sin(angle)*startDistance,radius,velocity, speed:bulletSpeed, playerId: playerID, gunName:currentGun, travelDistance, projDamage,color
    }
  } else{
    backEndProjectiles[projectileId] = {
      x:location.x, y:location.y,radius,velocity, speed:bulletSpeed, playerId: playerID, gunName:currentGun, travelDistance, projDamage, color
    }
  }

}

function safeDeleteProjectile(projID){
  const backEndProjectile = backEndProjectiles[projID]
  // if name is grenadeLauncher, explode and damage surrounding enemies and players!backEndProjectile.name
  // console.log(backEndProjectile.gunName)
  if (backEndProjectile.gunName==='grenadeLauncher'){
    explosion(backEndProjectile,12,playerID=backEndProjectile.playerId)
  } else if(backEndProjectile.gunName==='tankBuster'){
    explosion(backEndProjectile,12,playerID=backEndProjectile.playerId,shockWave=true)
  } else if(backEndProjectile.gunName==='flareGun'){
    // request an air drop!
    spawnAirstrike({x:backEndProjectile.x, y:backEndProjectile.y}, backEndProjectile.playerId ,signalColor = backEndProjectile.color)
  }

  delete backEndProjectiles[projID]
}


function safeDeletePlayer(playerId){
  // drop all item before removing
  const backEndPlayer = backEndPlayers[playerId]
  if (!backEndPlayer){ // somehow got deleted by other methods
    return
  }

  const inventoryItems = backEndPlayer.inventory
   
  for (let i=0;i<inventoryItems.length;i++){
    const curitemID = inventoryItems[i].myID
    if (curitemID===0){ // no fist
      continue
    }
    let backEndItem = backEndItems[curitemID]
    backEndItem.onground = true
    backEndItem.groundx = backEndPlayer.x + (Math.random() - 0.5)*100
    backEndItem.groundy = backEndPlayer.y + (Math.random() - 0.5)*100
    itemBorderUpdate(backEndItem)
  }

  ////////////////////////// integrate player death //////////////////
  // DROP armor
  const armorID = backEndPlayer.wearingarmorID
  const scopeID = backEndPlayer.wearingscopeID
  const vehicleID = backEndPlayer.ridingVehicleID

  if (armorID>0){
    let itemToUpdate = backEndItems[armorID]
    itemToUpdate.onground = true
    itemToUpdate.groundx = backEndPlayer.x
    itemToUpdate.groundy = backEndPlayer.y
  }
  // DROP scope
  if (scopeID>0){
    let itemToUpdate = backEndItems[scopeID]
    itemToUpdate.onground = true
    itemToUpdate.groundx = backEndPlayer.x
    itemToUpdate.groundy = backEndPlayer.y
  }
  // vehicle unoccupy
  if (backEndVehicles[vehicleID]){//exist
    getOffVehicle(playerId,vehicleID)
  }
  ////////////////////////// integrate player death //////////////////

  delete backEndPlayers[playerId]
}



function Moveplayer(playerGIVEN, WW, AA, SS, DD){
    const vehicleID = playerGIVEN.ridingVehicleID
    if (vehicleID>0){ // if riding something
      let vehicleOfPlayer = backEndVehicles[vehicleID]
      const maxSpeedVehicle = vehicleOfPlayer.speed
      playerGIVEN.speed = Math.min(maxSpeedVehicle, playerGIVEN.speed + 0.11)
      // console.log(playerGIVEN.speed )
      // if (vehicleOfPlayer.mytick > 30){ // only use a B2 sound since other sound is bad...
      //   // pushSoundRequest({x:playerGIVEN.x,y:playerGIVEN.y},`${vehicleOfPlayer.type}_moving`,TILE_SIZE*3, duration=1)
      //   pushSoundRequest({x:playerGIVEN.x,y:playerGIVEN.y},'B2_moving',TILE_SIZE*3, duration=1)
      //   vehicleOfPlayer.mytick = 0
      // }
      // vehicleOfPlayer.mytick += 1

    }

    if (WW){
      playerGIVEN.y -= playerGIVEN.speed
    }
    if (AA){
      playerGIVEN.x -= playerGIVEN.speed
    }
    if (SS){
      playerGIVEN.y += playerGIVEN.speed
    }
    if (DD){
      playerGIVEN.x += playerGIVEN.speed
    }

    // check boundary with objects also
    borderCheckWithObjects(playerGIVEN)
    
    const playerSides = {
      left: playerGIVEN.x - playerGIVEN.radius,
      right: playerGIVEN.x + playerGIVEN.radius,
      top: playerGIVEN.y - playerGIVEN.radius,
      bottom: playerGIVEN.y + playerGIVEN.radius
    }
  
    // MAP BORDER CHECK
    if (playerSides.left<0){ // restore position for backend
      playerGIVEN.x = playerGIVEN.radius
    }
    if (playerSides.right>MAPWIDTH){ // restore position for backend
      playerGIVEN.x = MAPWIDTH - playerGIVEN.radius
    }
    if (playerSides.top<0){ // restore position for backend
      playerGIVEN.y = playerGIVEN.radius
    }
    if (playerSides.bottom>MAPHEIGHT){ // restore position for backend
      playerGIVEN.y = MAPHEIGHT - playerGIVEN.radius
    }

  }
  

async function main(){
    const {ground2D, decals2D} = await loadMap(MAPNAME);

    io.on("connect", (socket) => {
        console.log("user connected",socket.id);
        socket.emit('map',{loadedMap:{ground:ground2D, decals: decals2D},MAPTILENUMBACKEND: MAPTILENUM, MAPNAMEBACKEND:MAPNAME})
        // give server info to a frontend
        socket.emit('serverVars', {gunInfo, consumableInfo,SHOOTER_VEHICLES_BACKEND})

        // remove player when disconnected (F5 etc.)
        socket.on('disconnect',(reason) => {
            console.log(reason)
            safeDeletePlayer(socket.id)

        })

        // initialize game when clicking button (submit name)
        socket.on('initGame',({username,playerX, playerY, playerColor,canvasHeight,canvasWidth,Myskin='default'})=>{
            // initialize inventory with fist
            let inventory =  new Array(INVENTORYSIZE).fill().map(() => (backEndItems[0])) // array points to references - fist can be shared for all players

            // default item for a player if exists
            for (let i=0;i<defaultGuns.length; i++){
              makeNdropItem('gun', defaultGuns[i], {x:0 ,y:0},onground=false)
              inventory[i] = backEndItems[itemsId]
            }

            playerJoinTimeout = setTimeout(function(){
            clearTimeout(playerJoinTimeout);
            backEndPlayers[socket.id] = {
                thisPlayerID:socket.id, // only for backend
                x:playerX,
                y:playerY,
                color: playerColor,
                radius: PLAYERRADIUS,
                score: 0,
                health: PLAYERHEALTH,
                username,
                inventory, // size 4
                currentSlot: 1, // 1~4
                mousePos: {x:0,y:0},
                wearingarmorID: -1,
                wearingscopeID: -1,
                getinhouse: false,
                speed:PLAYERSPEED, // not passed to frontend
                ridingVehicleID:-1,
                entityType:'player', // not passed to frontend
                canvasHeight,
                canvasWidth,
                skin:Myskin,
                onBoard:false,
                strikeID:-1,

            };
            USERCOUNT[0]++;
            } ,PLAYER_JOIN_DELAY)

        })

        // aux function for shoot
        function shootProjectile(angle,currentGun,startDistance,holding){
          const gunName = currentGun
          let startDistanceShoot = startDistance
          if (startDistance===0){ // player shot this, not on a vehicle: always shoot at gun's front end point
            startDistanceShoot = gunInfo[currentGun].size.length*2
          }
          

          for (let i=0;i< gunInfo[currentGun].num;i++){
            addProjectile(angle,currentGun,socket.id, backEndPlayers[socket.id],startDistanceShoot,holding)
          }
        }
        socket.on('shoot', ({angle,currentGun,startDistance=0,currentHoldingItemId=0,holding})=>{ // NOTE: reload does not use socket!!!
          if (!backEndPlayers[socket.id]) return // player not defined
          if (backEndPlayers[socket.id].onBoard){return} // cannot shoot if on board

          if (currentHoldingItemId>0){ // decrease ammo
            let thisGun = backEndItems[currentHoldingItemId]
            if (thisGun.name==='flareGun'){
              if (thisGun.iteminfo.ammo>0){
                thisGun.iteminfo.ammo = 0
              }
              shootProjectile(angle,currentGun,startDistance,holding)

            }else{ // not a flare gun, then ammo is not important / on vehicle turret etc.
              shootProjectile(angle,currentGun,startDistance,holding)
            }
          }else{ // on vehicle turret etc.
            shootProjectile(angle,currentGun,startDistance,holding)
          }
          // shootProjectile(angle,currentGun,startDistance)


        } )


          // eat
        socket.on('consume',({itemName,playerId,healamount,deleteflag, itemid,currentSlot}) => {
          let curplayer = backEndPlayers[playerId]
          if (!curplayer) {return}
          function APIdeleteItem(){ // change player current holding item to fist
            curplayer.inventory[currentSlot-1] = backEndItems[0]
            // delete safely
            backEndItems[itemid].deleteflag = deleteflag
          }

          if (itemName === 'medkit'){
            curplayer.health = PLAYERHEALTHMAX
            APIdeleteItem()
          } else if (curplayer.health + healamount <= PLAYERHEALTHMAX){
            curplayer.health += healamount
            APIdeleteItem()
          }
        })

        // place
        socket.on('place',({itemName,playerId,deleteflag, itemid,currentSlot,imgName}) => {
          let curplayer = backEndPlayers[playerId]
          if (!curplayer) {return}
          if (curplayer.onBoard){return} // cannot shoot if on board
          function APIdeleteItem(){ // change player current holding item to fist
            curplayer.inventory[currentSlot-1] = backEndItems[0]
            backEndItems[itemid].deleteflag = deleteflag
          }

          // for a barrel
          let hitpoints = BARREL_HEALTH
          let hitRadius = BARREL_RADIUS

          if (itemName==='barrel'){
            //console.log('placing: ',imgName)
          }else if (itemName==='mine'){    
            //console.log('placing mine')
            hitpoints = MINE_DETONATE_COUNTDOWN // count down #
            hitRadius = MINE_DETECTION_RADIUS // actually detection radius
          }else{
            console.log("WTF")
          }
          makeObjects(itemName, hitpoints, {center: {x:curplayer.x,y:curplayer.y}, radius: hitRadius, color:'gray',placerID:playerId}, imgName)

          APIdeleteItem()

        })
        
        // change gound item info from client side
        socket.on('updateitemrequest', ({itemid, requesttype,currentSlot=1, playerId=0})=>{
          let itemToUpdate = backEndItems[itemid]
          if (!itemToUpdate) {return}
          if (requesttype === 'pickupinventory'){
            itemToUpdate.onground = false
            if (backEndPlayers[playerId]){
              backEndPlayers[playerId].inventory[currentSlot-1] = backEndItems[itemid]// reassign item (only me)
            }
            //console.log(backEndPlayers[playerId].inventory[currentSlot-1].myID)
          } else if (requesttype === 'weararmor'){
            backEndPlayers[playerId].wearingarmorID = itemid
            itemToUpdate.onground = false
          }  else if (requesttype === 'scopeChange'){
            backEndPlayers[playerId].wearingscopeID = itemid
            itemToUpdate.onground = false
          } 
        })

        socket.on('updateitemrequestDROP', ({itemid, requesttype,currentSlot=1, groundx=0, groundy=0, playerId=0})=>{
          if (!backEndPlayers[socket.id]) return // player not defined
          if (backEndPlayers[socket.id].onBoard){return} // cannot shoot if on board

          let itemToUpdate = backEndItems[itemid]
          if (!itemToUpdate) {return}
          if(requesttype==='dropitem' || (!itemid)){ // not fist
            itemToUpdate.onground = true
            itemToUpdate.groundx = groundx
            itemToUpdate.groundy = groundy
            //console.log(`dropped: ${itemToUpdate.name}`)
          }

        })

        // house in-outs
        socket.on('houseEnter',() => {
          backEndPlayers[socket.id].getinhouse = true
        })
        socket.on('houseLeave',() => {
          backEndPlayers[socket.id].getinhouse = false
        })

        socket.on('getOffVehicle',({vehicleID})=>{
          getOffVehicle(socket.id,vehicleID)
        })
        socket.on('getOnVehicle',({vehicleID})=>{
          getOnVehicle(socket.id,vehicleID)
        })

        socket.on('takeOff',()=>{
          const player = backEndPlayers[socket.id]
          if (player && player.onBoard){
            safeTakeOff(player.strikeID)
          }
        })

        ///////////////////////////////// Frequent key-downs update ///////////////////////////////////////////////
        // update frequent keys at once (Movement & hold shoot)  //always fire hold = true since space was pressed
        socket.on('moveNshootUpdate', ({WW, AA, SS, DD, x, y})=>{
            let backEndPlayer = backEndPlayers[socket.id]
            if (!backEndPlayer){return}
            backEndPlayer.mousePos = {x,y}
            // Movement analysis
            Moveplayer(backEndPlayer, WW, AA, SS, DD)
        })

        // update frequent keys at once (Movement only)
        socket.on('movingUpdate', ({WW, AA, SS, DD, x, y})=>{
            let backEndPlayer = backEndPlayers[socket.id]
            if (!backEndPlayer){return}
            backEndPlayer.mousePos = {x,y}
            // Movement analysis
            Moveplayer(backEndPlayer, WW, AA, SS, DD)
        })

        // always fire hold = true since space was pressed
        socket.on('holdUpdate', ({x, y}) => {
            let backEndPlayer = backEndPlayers[socket.id]
            if (!backEndPlayer){return}
            backEndPlayer.mousePos = {x,y}
        })

        // hear player's mouse pos changes 
        socket.on('playermousechange', ({x,y})=>{
            let backEndPlayer = backEndPlayers[socket.id]
            if (!backEndPlayer){return}
            backEndPlayer.mousePos = {x,y}
        })

        ///////////////////////////////// Non-Frequent key-downs update ////////////////////////////////////////////
        socket.on('keydown',({keycode}) => {
            let backEndPlayer = backEndPlayers[socket.id]
            if (!backEndPlayer){ // if player was removed, do nothing
            return
            }

            // NOT A MOVEMENT
            switch(keycode) {
            case 'Digit1':
                //console.log('Digit1 presssed')
                backEndPlayer.currentSlot = 1
                break
            case 'Digit2':
                //console.log('Digit2 presssed')
                backEndPlayer.currentSlot = 2
                break
            case 'Digit3':
                //console.log('Digit3 presssed')
                backEndPlayer.currentSlot = 3
                break
            case 'Digit4':
                //console.log('Digit4 presssed')
                backEndPlayer.currentSlot = 4
                break
            case 'KeyF':
                //console.log('f presssed')
                socket.emit('interact',{backEndItems,backEndVehicles})
                break
            case 'KeyG':
                //console.log('g presssed')
                break
            case 'KeyR':
                //console.log('r presssed')
                socket.emit('reload')
                break
            default:
                break
            }
        })
      });


}


app.use(express.static("public"));
httpServer.listen(5000);

main();

let strike = true

function onBoardCheck(player){
  return player.onBoard
}

let ServerTime = 0
let GLOBALCLOCK = 0
// backend ticker - update periodically server info to clients
setInterval(() => {
  GLOBALCLOCK += TICKRATE
  // enemy spawn mechanism
  if ((GLOBALCLOCK > ENEMYSPAWNRATE) && (SPAWNENEMYFLAG) && (USERCOUNT[0]>0)){
    for (let i=0;i<ENEMYNUM;i++){
      spawnEnemies()
    }
    GLOBALCLOCK = 0 // init

    // print entity object's lengths
    console.log(`[ Entity amount check ${ServerTime} ]`)
    console.log(
      "Players       ",Object.keys(backEndPlayers).length,
    "\nEnemies       ",Object.keys(backEndEnemies).length,
    "\nProjectiles   ",Object.keys(backEndProjectiles).length,
    "\nItems         ",Object.keys(backEndItems).length,
    "\nVehicles      ",Object.keys(backEndVehicles).length,
    "\nObjects       ",Object.keys(backEndObjects).length,
    "\nAirstrikes    ",Object.keys(backEndAirstrikes).length,
    "\nSoundRequests ",Object.keys(backEndSoundRequest).length )
    ServerTime += 1
  }

  // red zone?
  // if ((USERCOUNT[0]>0) && strike){
  //   strike = false
  //   spawnAirstrike({x:MAPWIDTH/2,y:256},0, signalColor='red')
  // }

  // update players - speed info
  for (const id in backEndPlayers){
    let playerGET = backEndPlayers[id]

    if (playerGET.onBoard){
      const planeLocation = backEndAirstrikes[playerGET.strikeID]
      playerGET.x = planeLocation.x
      playerGET.y = planeLocation.y
    } else if (playerGET.ridingVehicleID>0){// riding something
      // lower the speed!
      playerGET.speed = Math.max(0, playerGET.speed - 0.1)
    } else { // not riding 
      Moveplayer(playerGET, false, false, false, false)
    }
    playerGET.x = Math.round(playerGET.x)
    playerGET.y = Math.round(playerGET.y)

  }


  // update projectiles
  for (const id in backEndProjectiles){
    let BULLETDELETED = false
    let projGET = backEndProjectiles[id]
    const gunNameOfProjectile = projGET.gunName
    const PROJECTILERADIUS = projGET.radius
    let myspeed = projGET.speed

    if (gunNameOfProjectile !== 'AWM'){
      if (gunNameOfProjectile === 'grenadeLauncher' || gunNameOfProjectile === 'fragment'){
        projGET.velocity.x *= HIGHFRICTION
        projGET.velocity.y *= HIGHFRICTION
        myspeed *= HIGHFRICTION
      }else if (gunNameOfProjectile === 'shockWave'){
        projGET.velocity.x *= EXTREMEFRICTION
        projGET.velocity.y *= EXTREMEFRICTION
        myspeed *= EXTREMEFRICTION
        if (myspeed <=  0.1){
          myspeed=0 // set to zero
        }
      }else{
        projGET.velocity.x *= FRICTION
        projGET.velocity.y *= FRICTION
        myspeed *= FRICTION
      }
    }

    projGET.x += projGET.velocity.x
    projGET.y += projGET.velocity.y

    projGET.travelDistance -= myspeed
    // travel distance check for projectiles
    if (projGET.travelDistance <= 0 || myspeed<=0.1){
      // console.log(projGET.travelDistance,myspeed)
      BULLETDELETED = true
      safeDeleteProjectile(id)
      continue // dont reference projectile that does not exist
    }

    // boundary check for projectiles
    if (projGET.x - PROJECTILERADIUS >= MAPWIDTH ||
        projGET.x + PROJECTILERADIUS <= 0 ||
        projGET.y - PROJECTILERADIUS >= MAPHEIGHT ||
        projGET.y + PROJECTILERADIUS <= 0 
      ) {
      BULLETDELETED = true
      safeDeleteProjectile(id)
      continue // dont reference projectile that does not exist
    }

    let COLLISIONTOLERANCE = Math.floor(gunInfo[gunNameOfProjectile].projectileSpeed/6) -1 // px
    
    // collision with objects
    for (const objid in backEndObjects) {
      const backEndObject = backEndObjects[objid]
      const objInfo = backEndObject.objectinfo


      let collisionDetectedObject 
      if (backEndObject.objecttype==='wall'){
        collisionDetectedObject = collide([objInfo.start.x,objInfo.start.y], [objInfo.end.x,objInfo.end.y], [projGET.x, projGET.y], PROJECTILERADIUS + objInfo.width/2 + COLLISIONTOLERANCE)
      } else if(backEndObject.objecttype==='hut' || backEndObject.objecttype==='barrel'){
        const DISTANCE = Math.hypot(projGET.x - objInfo.center.x, projGET.y - objInfo.center.y)
        collisionDetectedObject = (DISTANCE < PROJECTILERADIUS + objInfo.radius) // + COLLISIONTOLERANCE no tolerance
      } else if(backEndObject.objecttype==='mine'){ // projectiles cannot shoot this
        collisionDetectedObject = false
      } else{
        console.log("invalid object-projectile interaction: undefined or other name given to obj")
      }

      if (collisionDetectedObject) {
        // who got hit
        if (backEndObjects[objid]){ // safe
          backEndObjects[objid].health -= projGET.projDamage
          //console.log(`Object: ${objid} has health: ${backEndObjects[objid].health} remaining`)
          if (backEndObjects[objid].health <= 0){ //check
            safeDeleteObject(objid)
          } 
        }
        BULLETDELETED = true
        safeDeleteProjectile(id)
        break // only one obj can get hit by a projectile
      }
    }

    if (BULLETDELETED){ // dont check below if collided
      continue
    }

    // collision detection with players
    for (const playerId in backEndPlayers) {
      let backEndPlayer = backEndPlayers[playerId]
      if (onBoardCheck(backEndPlayer)){
        continue // move on: no collision with bullets
      }
      
      const DISTANCE = Math.hypot(projGET.x - backEndPlayer.x, projGET.y - backEndPlayer.y)
        if ((projGET.playerId !== playerId) && (DISTANCE < PROJECTILERADIUS + PLAYERRADIUS + COLLISIONTOLERANCE)) {
          // who got hit
          if (backEndPlayer){ // safe
          const armoredDamage = armorEffect(backEndPlayer.wearingarmorID, projGET.projDamage)
          //const armoredDamage = projGET.projDamage
          if (DISTANCE < PROJECTILERADIUS + PLAYERRADIUS + COLLISIONTOLERANCE/2){ // accurate/nice timming shot 
              backEndPlayer.health -= armoredDamage
          } else{ // not accurate shot
              backEndPlayer.health -= armoredDamage/2
          }
          if (backEndPlayer.health <= 0){ //check again
              // who shot projectile
              if (backEndPlayers[projGET.playerId]){ // safe
              backEndPlayers[projGET.playerId].score ++
              }
              safeDeletePlayer(playerId)} 
          }
          // delete projectile after inspecting who shot the projectile & calculating damage
          BULLETDELETED = true
          safeDeleteProjectile(id)
          break // only one player can get hit by a projectile
        }
    }
    // collision detection with enemies
    if (BULLETDELETED){ // dont check for loop with enemy 
      continue
    }
    for (const enemyId in backEndEnemies) {
      let backEndEnemy = backEndEnemies[enemyId]
      const DISTANCE = Math.hypot(projGET.x - backEndEnemy.x, projGET.y - backEndEnemy.y)
      if ((DISTANCE < PROJECTILERADIUS + backEndEnemy.radius + COLLISIONTOLERANCE)) {
        // who got hit
        if (backEndEnemy){ // safe
          const armoredDamage = armorEffect(backEndEnemy.wearingarmorID, projGET.projDamage)
            if (DISTANCE < PROJECTILERADIUS + backEndEnemy.radius + COLLISIONTOLERANCE/2){ // accurate/nice timming shot 
              backEndEnemy.health -= armoredDamage
            } else{ // not accurate shot
              backEndEnemy.health -= armoredDamage/2
            }
            if (backEndEnemy.health <= 0){ //check again
              if (backEndPlayers[projGET.playerId]){ // safe
                backEndPlayers[projGET.playerId].score ++
              }
              safeDeleteEnemy(enemyId)} 
        }
        // delete projectile after inspecting who shot the projectile & calculating damage
        BULLETDELETED = true
        safeDeleteProjectile(id)
        break // only one enemy can get hit by a projectile
      }
    }
    if (BULLETDELETED){ // dont check below
      continue
    }

    // collision check with vehicles
    for (const vehicleId in backEndVehicles) {
      let backEndVehicle = backEndVehicles[vehicleId]
      const DISTANCE = Math.hypot(projGET.x - backEndVehicle.x, projGET.y - backEndVehicle.y)
      if ((DISTANCE < PROJECTILERADIUS + backEndVehicle.radius + COLLISIONTOLERANCE)) {
        // who got hit
        if (backEndVehicle){ // safe
            backEndVehicle.health -= projGET.projDamage
            if (backEndVehicle.health <= 0){ //check again
              safeDeleteVehicle(vehicleId)} 
        }
        // delete projectile after inspecting who shot the projectile & calculating damage
        BULLETDELETED = true
        safeDeleteProjectile(id)
        break // only one enemy can get hit by a projectile
      }
    }
    if (BULLETDELETED){ // dont check below
      continue
    }
    // other

  }

  // update objects
  for (const id in backEndObjects){
    const backEndObject = backEndObjects[id]
    if (backEndObject.health <= 0){
      safeDeleteObject(id)
    }
  }

  // update items - dont have to be done fast
  for (const id in backEndItems){
    if (backEndItems[id].deleteRequest){
      delete backEndItems[id]
    }
  }

  // update vehicles
  for (const id in backEndVehicles){
    let vehicle = backEndVehicles[id]
    if (vehicle){ 
      if (vehicle.occupied){ // occupied then update position accordingly to the player who is riding
        updateVehiclePos(vehicle)
      }
    }
  }

  // update enemies
  for (const id in backEndEnemies){
    let enemy = backEndEnemies[id]
    const enemyRad = enemy.radius

    if (enemy.homing){ 
      const targetplayer = backEndPlayers[enemy.homingTargetId]
      if (targetplayer){// initial target still exists
        const angle = Math.atan2(
          targetplayer.y - enemy.y,
          targetplayer.x - enemy.x
        )
        
        enemy.x += enemy.speed * Math.cos(angle)
        enemy.y += enemy.speed * Math.sin(angle)
      }
      else{  // initial target died => dont move for a moment and walk randomly
        enemy.homing = false 
      }
    } else{ // just walk random direction
      enemy.x += enemy.velocity.x
      enemy.y += enemy.velocity.y
    }

    if (enemy.x - enemyRad >= MAPWIDTH ||
      enemy.x + enemyRad <= 0 ||
      enemy.y - enemyRad >= MAPHEIGHT ||
      enemy.y + enemyRad <= 0 
      ) {
        safeDeleteEnemy(id,leaveDrop = false)
      continue // dont reference enemy that does not exist
    }

    // collision detection
    for (const playerId in backEndPlayers) {
      let backEndPlayer = backEndPlayers[playerId]
      if (onBoardCheck(backEndPlayer)){
        continue // move on: no collision with enemies
      }
      const DISTANCE = Math.hypot(enemy.x - backEndPlayer.x, enemy.y - backEndPlayer.y)
      if ((DISTANCE < enemyRad + backEndPlayer.radius)) {
        // who got hit
        if (backEndPlayer){ // safe
          const armoredDamage = armorEffect(backEndPlayer.wearingarmorID, enemy.damage)
          backEndPlayer.health -= armoredDamage
          if (backEndPlayer.health <= 0){ //check alive
            safeDeletePlayer(playerId)} 
        }
        // delete enemy after calculating damage
        safeDeleteEnemy(id,leaveDrop = false)
        break // only one player can get hit by an enemy
      }
    }
    // boundary check with objects!
    if (!GHOSTENEMY){
      borderCheckWithObjects(enemy)
    }
  }

  // update airstrikes
  for (const id in backEndAirstrikes){
    updateAirstrike(id)
  }

  // update sound request (if any)
  for (const id in backEndSoundRequest){
    updateSoundRequest(id)
  }

    io.emit('updateFrontEnd',{backEndPlayers, backEndEnemies, backEndProjectiles, backEndObjects, backEndItems,backEndVehicles,backEndAirstrikes,backEndSoundRequest})
}, TICKRATE)




function makeNdropItem(itemtype, name, groundloc,onground=true,variantNameGiven=''){
  const groundx = groundloc.x
  const groundy = groundloc.y

  itemsId++
  let size
  let color
  let iteminfo 

  //different value
  if (itemtype === 'gun' || itemtype === 'melee'){
    const guninfoGET = gunInfo[name]
    size = guninfoGET.size
    color = 'white'
    let ammo = 0
    if (itemtype === 'melee'){
      color = 'black'
      ammo = 'inf'
    }
    let ammotype = guninfoGET.ammotype 

    if (name==='flareGun'){
      ammotype = variantNameGiven
      ammo = 1
    }

    iteminfo = {ammo,ammotype}

  } else if(itemtype === 'consumable'){
    const consumableinfoGET = consumableInfo[name]
    size = consumableinfoGET.size
    color = consumableinfoGET.color
    const amount = 1
    const healamount = consumableinfoGET.healamount
    iteminfo =  {amount,healamount}

  } else if(itemtype==='armor'){
    const armorinfoGET = armorInfo[name]
    size = armorinfoGET.size
    color = armorinfoGET.color
    const amount = armorinfoGET.amount
    iteminfo = {amount}
  } else if(itemtype==='scope'){
    size = {length:12, width:12}
    color = 'white'
    iteminfo = {scopeDist:parseInt(name)}
  } else if(itemtype==='placeable'){
    const placeableinfoGET = placeableInfo[name]
    size = placeableinfoGET.size
    color = placeableinfoGET.color // default drawing color if no image

    iteminfo = {variantName:variantNameGiven} 
  } else{
    console.log("invalid itemtype requested in makeNdropItem")
    return 
  }

  backEndItems[itemsId] = {
    itemtype, name, groundx, groundy, size, color, iteminfo, onground, myID: itemsId, deleteRequest:false
  }
  itemBorderUpdate(backEndItems[itemsId])
}



// safely create object
function makeObjects(objecttype, health, objectinfo, givenname = ''){
  objectId++
  let name = givenname
  if (givenname===''){
    name = objecttype // given default name is objecttype
  }

  let objectsideforbackend = {}

  if (objecttype === 'wall'){
    if (objectinfo.orientation==='vertical'){
      objectsideforbackend = {
        left: objectinfo.start.x - objectinfo.width/2,
        right: objectinfo.start.x + objectinfo.width/2,
        top: objectinfo.start.y,
        bottom: objectinfo.end.y,
        centerx: objectinfo.start.x, // same with end.x
        centery: ( objectinfo.start.y + objectinfo.end.y )/2
      }
    }else if(objectinfo.orientation==='horizontal'){
      objectsideforbackend = {
        left: objectinfo.start.x,
        right: objectinfo.end.x,
        top: objectinfo.start.y - objectinfo.width/2,
        bottom: objectinfo.start.y + objectinfo.width/2,
        centerx: ( objectinfo.start.x + objectinfo.end.x )/2,
        centery: objectinfo.start.y // same with end.y
      }
    }
  }

  //console.log(`new obj ID: ${objectId}`)

  backEndObjects[objectId] = {
    objecttype , myID:objectId, deleteRequest:false, health, objectinfo, objectsideforbackend, name
  }
}

function makeBox(location){ // location is top left corner
  const WALLWIDTH = 20
  makeObjects("wall", 30, {orientation: 'vertical',start:{x:location.x+WALLWIDTH,y:location.y}, end:{x:location.x+WALLWIDTH,y:location.y+200}, width:WALLWIDTH, color: 'gray'})
  makeObjects("wall", 30, {orientation: 'vertical',start:{x:location.x+300-WALLWIDTH,y:location.y}, end:{x:location.x+300-WALLWIDTH,y:location.y+200}, width:WALLWIDTH, color: 'gray'})
  makeObjects("wall", 30, {orientation: 'horizontal',start:{x:location.x,y:location.y}, end:{x:location.x+300,y:location.y}, width:WALLWIDTH, color: 'gray'})
  makeObjects("wall", 30, {orientation: 'horizontal',start:{x:location.x,y:location.y+200}, end:{x:location.x+300,y:location.y+200}, width:WALLWIDTH, color: 'gray'})
  
}

function makeHouse_2Tiles(location){ // location is top left corner
  const WALLWIDTH_HALF = 10
  const WALLWIDTH = WALLWIDTH_HALF*2
  const HOUSEWIDTH = TILE_SIZE*2
  const HOUSEHEIGHT = TILE_SIZE
  const DOORLEN = 40
  makeObjects("wall", 30, {orientation: 'vertical',start:{x:location.x+WALLWIDTH_HALF,y:location.y+DOORLEN}, end:{x:location.x+WALLWIDTH_HALF,y:location.y+HOUSEHEIGHT}, width:WALLWIDTH, color: 'gray'})
  makeObjects("wall", 30, {orientation: 'vertical',start:{x:location.x+HOUSEWIDTH-WALLWIDTH_HALF,y:location.y}, end:{x:location.x+HOUSEWIDTH-WALLWIDTH_HALF,y:location.y+HOUSEHEIGHT}, width:WALLWIDTH, color: 'gray'})
  makeObjects("wall", 30, {orientation: 'horizontal',start:{x:location.x,y:location.y}, end:{x:location.x+HOUSEWIDTH,y:location.y}, width:WALLWIDTH, color: 'gray'})
  makeObjects("wall", 30, {orientation: 'horizontal',start:{x:location.x,y:location.y+HOUSEHEIGHT}, end:{x:location.x+HOUSEWIDTH,y:location.y+HOUSEHEIGHT}, width:WALLWIDTH, color: 'gray'})
  
}

function one_tile_wall_vertical(location){
  const WALLWIDTH_HALF = 10
  const WALLWIDTH = WALLWIDTH_HALF*2
  makeObjects("wall", 30, {orientation: 'vertical',start:{x:location.x,y:location.y-WALLWIDTH_HALF}, end:{x:location.x,y:location.y+TILE_SIZE+WALLWIDTH_HALF}, width:WALLWIDTH, color: 'gray'})
}
function one_tile_wall_horizontal(location){
  const WALLWIDTH_HALF = 10
  const WALLWIDTH = WALLWIDTH_HALF*2
  makeObjects("wall", 30, {orientation: 'horizontal',start:{x:location.x-WALLWIDTH_HALF,y:location.y}, end:{x:location.x+TILE_SIZE+WALLWIDTH_HALF,y:location.y}, width:WALLWIDTH, color: 'gray'})
}

function makeHouse_15Tiles(location){ // location given is center tile's top left corner for these houses
  const WALLWIDTH_HALF = 10
  const WALLWIDTH = WALLWIDTH_HALF*2

  const houseRows = 5
  const houseCols = 3

  // adjust to have location to top left tile
  const x = location.x - TILE_SIZE
  const y = location.y - TILE_SIZE*2

  for (let i=0;i<2;i++){ // both sides
    for (let j=0;j<houseCols;j++){
      if (i===0 && j===1){ // door here
        // nothing - door will be added here
      } else{
        one_tile_wall_horizontal({x: x+TILE_SIZE*j , y: y+i*houseRows*TILE_SIZE})
      }
    }

    for (let j=0;j<houseRows;j++){
      one_tile_wall_vertical({x: x+i*houseCols*TILE_SIZE , y: y+TILE_SIZE*j})
    }

  }
}

function makeHouse_36Tiles(location){ // location given is roof tile's top left corner for these houses
  const WALLWIDTH_HALF = 10
  const WALLWIDTH = WALLWIDTH_HALF*2

  const houseRows = 6
  const houseCols = 6

  // adjust to have location to top left tile
  const x = location.x - TILE_SIZE*5
  const y = location.y - TILE_SIZE*5

  for (let i=0;i<2;i++){ // both sides
    for (let j=0;j<houseCols;j++){
      one_tile_wall_horizontal({x: x+TILE_SIZE*j , y: y+i*houseRows*TILE_SIZE})
    }

    for (let j=0;j<houseRows;j++){
      if (i===0 && j===2){
        // door here
      } else{
        one_tile_wall_vertical({x: x+i*houseCols*TILE_SIZE , y: y+TILE_SIZE*j})
      }

    }

  }
}

function makeHouse_42Tiles(location){ // location given is roof tile's top left corner for these houses
  const WALLWIDTH_HALF = 10
  const WALLWIDTH = WALLWIDTH_HALF*2


  // adjust to have location to top left tile
  const x1 = location.x - TILE_SIZE*7
  const y1 = location.y - TILE_SIZE*8

  const houseRows1 = 3
  const houseCols1 = 8
  for (let i=0;i<2;i++){ // both sides
    for (let j=0;j<houseCols1;j++){
      if (i===0 && (j===1 || j===6)){
        // door
      } else if (i===1 && j===6){
        // door 
      } else{
        one_tile_wall_horizontal({x: x1+TILE_SIZE*j , y: y1+i*houseRows1*TILE_SIZE})
      }
    }
    for (let j=0;j<houseRows1;j++){
      if (i===1){
        // this is a duplicate wall
      } else{
        one_tile_wall_vertical({x: x1+i*houseCols1*TILE_SIZE , y: y1+TILE_SIZE*j})
      }
    }
  }


  // adjust to have location to top left tile
  const x2 = location.x - TILE_SIZE*2
  const y2 = location.y - TILE_SIZE*8
  const houseRows2 = 9
  const houseCols2 = 3
  for (let i=0;i<2;i++){ // both sides
    for (let j=0;j<houseCols2;j++){
      if (i===0){
        // this is a duplicate wall
      } else{
        one_tile_wall_horizontal({x: x2+TILE_SIZE*j , y: y2+i*houseRows2*TILE_SIZE})
      }

    }
    for (let j=0;j<houseRows2;j++){
      if (i===0 && j===1){
        // door (vertical)
      } else{
        one_tile_wall_vertical({x: x2+i*houseCols2*TILE_SIZE , y: y2+TILE_SIZE*j})
      }
    }
  }
}


function makeHouse_Courtyard(location){ // location given is top left inner corner
  const WALLWIDTH_HALF = 10
  const WALLWIDTH = WALLWIDTH_HALF*2

  const x1 = location.x - TILE_SIZE
  const y1 = location.y - TILE_SIZE
  const houseRows1 = 8
  const houseCols1 = 8
  const doorOffset1 = 3

  for (let i=0;i<2;i++){ // both sides
    for (let j=0;j<houseCols1;j++){
      if (j===doorOffset1 || j===doorOffset1+1){
        // open space
      }else{
        one_tile_wall_horizontal({x: x1+TILE_SIZE*j , y: y1+i*houseRows1*TILE_SIZE})
      }

    }
    for (let j=0;j<houseRows1;j++){
      if (j===doorOffset1 || j===doorOffset1+1){
        // open space
      }else{
        one_tile_wall_vertical({x: x1+i*houseCols1*TILE_SIZE , y: y1+TILE_SIZE*j})
      }
    }
  }


  // adjust 
  const x2 = location.x + TILE_SIZE
  const y2 = location.y + TILE_SIZE
  const houseRows2 = 4
  const houseCols2 = 4
  const doorOffset2 = 1

  for (let i=0;i<2;i++){ // both sides
    for (let j=0;j<houseCols2;j++){
      if (j===doorOffset2 || j===doorOffset2+1){
        // open space
      }else{
        one_tile_wall_horizontal({x: x2+TILE_SIZE*j , y: y2+i*houseRows2*TILE_SIZE})
      }

    }
    for (let j=0;j<houseRows2;j++){
      if (j===doorOffset2 || j===doorOffset2+1){
        // open space
      }else{
        one_tile_wall_vertical({x: x2+i*houseCols2*TILE_SIZE , y: y2+TILE_SIZE*j})
      }
    }
  }
}


function safeDeleteObject(id){
  //console.log(`obj removed ID: ${id}`)
  const objToDelete = backEndObjects[id]
  if (objToDelete.objecttype==='barrel'){
    explosion(objToDelete.objectinfo.center,18,playerID=0)
  } else if(objToDelete.objecttype==='mine'){
    explosion(objToDelete.objectinfo.center,12,playerID=0,shockWave=true)
  }
  delete backEndObjects[id]
}


// only entity checking border here is: player & enemy
const VehicleTolerance = 5
function borderCheckWithObjects(entity){
  if (!entity) {return} // no need to check
  for (const id in backEndObjects){
    const obj = backEndObjects[id]

    if (obj.objecttype === 'wall'){
      const objSides = obj.objectsideforbackend
      const entitySides = {
        left: entity.x - entity.radius,
        right: entity.x + entity.radius,
        top: entity.y - entity.radius,
        bottom: entity.y + entity.radius
      }
      if (entity){// only when entity exists
        // LR check (hori)
        if (objSides.top < entity.y && entity.y < objSides.bottom){
          if (objSides.centerx < entity.x && entitySides.left < objSides.right){ // restore position for backend
            entity.x = entity.radius + objSides.right
          }
          if (objSides.centerx >= entity.x && entitySides.right > objSides.left){ // restore position for backend
            entity.x = objSides.left - entity.radius
          }
        } 

        //TB check (verti)
        if (objSides.left < entity.x && entity.x < objSides.right){
          if (objSides.centery < entity.y && entitySides.top < objSides.bottom){ // restore position for backend
            entity.y = objSides.bottom + entity.radius
          }
          if (objSides.centery >= entity.y && entitySides.bottom > objSides.top){ // restore position for backend
            entity.y = objSides.top - entity.radius
          }
        }
      }
    } 
    
    if(obj.objecttype === 'hut' || obj.objecttype === 'barrel'){
      const objinfoGET = obj.objectinfo
      const radiusSum = objinfoGET.radius + entity.radius
      const xDist = entity.x - objinfoGET.center.x
      const yDist = entity.y - objinfoGET.center.y 
      const Dist = Math.hypot(xDist,yDist)

      if (Dist < radiusSum){
        const angle = Math.atan2(
          yDist,
          xDist
        )
        entity.x = objinfoGET.center.x + Math.cos(angle) * radiusSum
        entity.y = objinfoGET.center.y + Math.sin(angle) * radiusSum
      }
    }else if(obj.objecttype === 'mine'){

      const objinfoGET = obj.objectinfo
      if (entity.entityType==='player' && objinfoGET.placerID===entity.thisPlayerID){      // if placer steps over it, it is okay
        // pass
      }else{
        const radiusSum = objinfoGET.radius + entity.radius
        const xDist = entity.x - objinfoGET.center.x
        const yDist = entity.y - objinfoGET.center.y 
        const Dist = Math.hypot(xDist,yDist)
  
        if (Dist < radiusSum){
          obj.health -= 1 // detonate count down! If stayed long enough, detonate
        }
      }
      
    }
    
  }

  // vehicle hitbox check
  for (const id in backEndVehicles){
    const obj = backEndVehicles[id]

    if (entity.entityType==="player"){
      if (entity.ridingVehicleID === id){
        continue 
      }
    }
    const radiusSum = obj.radius + entity.radius - VehicleTolerance
    const xDist = entity.x - obj.x
    const yDist = entity.y - obj.y 
    const Dist = Math.hypot(xDist,yDist)

    if (Dist < radiusSum){
      const angle = Math.atan2(
        yDist,
        xDist
      )
      entity.x = obj.x + Math.cos(angle) * radiusSum
      entity.y = obj.y + Math.sin(angle) * radiusSum
    }

  }

}





function spawnEnemies(){
  enemyId++
  ENEMYCOUNT ++
  const factor = 1 +  Math.random()  // 1~2
  const radius = Math.round(factor*16) // 16~32
  const speed = 3 - factor // 1~2

  let x = 64
  let y = 64
  if (MAPNAME==='Sahara'){
    x = TILE_SIZE*1 + TILE_SIZE_HALF
    y = TILE_SIZE*1 + TILE_SIZE_HALF
  }

  // if (Math.random() < 0.5) {
  //     x = Math.random() < 0.5 ? 0 - radius : MAPWIDTH + radius
  //     y = Math.random() * MAPHEIGHT
  // }else{
  //     x = Math.random() * MAPWIDTH
  //     y = Math.random() < 0.5 ? 0 - radius : MAPHEIGHT + radius
  // }


  let homing = false
  let homingTargetId = -1
  //let colorfactor = 100 + Math.round(factor*40)

  if (Math.random() > 0.5){ // 50% chance of homing!
    homing = true
    //colorfactor = Math.round(factor*40)
    const backEndPlayersKey = Object.keys(backEndPlayers)
    const playerNum = backEndPlayersKey.length

    if (playerNum===0){
      //console.log('No players')
      idx = 0
      homing = false
    }else{
      //console.log(`${playerNum} Players playing`)
      idx = Math.round(Math.random()* (playerNum - 1) ) // 0 ~ #player - 1
    }
    homingTargetId = backEndPlayersKey[idx]
  }
  // back ticks: ~ type this without shift!

  const color = "CadetBlue" //`hsl(${colorfactor},50%,50%)` // [0~360, saturation %, lightness %]
  const angle = Math.atan2(MAPHEIGHT/2 - y, MAPWIDTH/2 - x)
  const velocity = {
      x: Math.cos(angle)*speed,
      y: Math.sin(angle)*speed
  }

  const damage = 1
  const myID = enemyId
  const health = factor*8 - 1
  const wearingarmorID = -1 //none

  // (new Enemy({ex, ey, eradius, ecolor, evelocity}))
  backEndEnemies[enemyId] = {
    x,y,radius,velocity, myID, color, damage, health, homing, homingTargetId, speed, wearingarmorID, entityType: 'enemy'
  }
  //console.log(`spawned enemy ID: ${enemyId}`)
}


const enemyDropGuns = ['M249', 'VSS', 'ak47', 'FAMAS']

function safeDeleteEnemy(enemyid, leaveDrop = true){
  const enemyInfoGET = backEndEnemies[enemyid]
  if (!backEndEnemies[enemyid]) {return} // already removed somehow
  if (leaveDrop){
    const idxGUN = Math.round(Math.random()*(enemyDropGuns.length-1)) // 0 ~ 3
    const chance = Math.random()
    if (chance < 0.01){ // 1% chance to drop medkit
      makeNdropItem( 'consumable', 'medkit', {x:enemyInfoGET.x, y:enemyInfoGET.y})
    } else if (0.01 < chance && chance < 0.03){ // 2% chance to drop bandage
      makeNdropItem( 'consumable', 'bandage', {x:enemyInfoGET.x, y:enemyInfoGET.y})
    } else if (chance>0.999){ // 0.1% to drop guns
      makeNdropItem( 'gun', enemyDropGuns[idxGUN], {x:enemyInfoGET.x, y:enemyInfoGET.y})
    } 
  } 
  ENEMYCOUNT--
  delete backEndEnemies[enemyid]
}

function NONitemBorderUpdate(entity){
  if (entity.x < 0){
    entity.x = 1
  }else if (entity.x > MAPWIDTH){
    entity.x = MAPWIDTH-1
  }
  if (entity.y < 0){
    entity.y = 1
  } else if(entity.y > MAPHEIGHT){
    entity.y = MAPHEIGHT-1
  }
}

function spawnVehicle(location, type='car'){ // currently only makes cars
  vehicleId++
  const x = location.x
  const y = location.y
  
  let radius = 24
  let color = "Aquamarine"
  let warningcolor = "Crimson"
  let damage = 5 // bump into damage
  let health = 15
  let speed = 6 // for a car
  let info = {}
  //let travelDistance = TILE_SIZE*100 // fuel etc ?

  if (type==='car'){
    // do nothing
  } else if(type==='Fennek'){
    radius = 32
    color = "Olive"
    warningcolor = "IndianRed"
    damage = 10 // bump into damage
    health = 60
    speed = 3 
  } else if(type==='APC'){ // with turrets!
    radius = 30
    color = "OliveDrab"
    warningcolor = "Chocolate"
    damage = 5 // bump into damage
    health = 50
    speed = 4 
    info = {turretName:"FAMAS"}
  } else if(type==='tank'){ // with turrets!
    radius = 40
    color = "Olive"
    warningcolor = "IndianRed"
    damage = 10 // bump into damage
    health = 192
    speed = 1 
    info = {turretName:"grenadeLauncher"}
  } else if(type==='turret'){ // with turrets! - no sound effect
    radius = 52
    color = "WhiteSmoke"
    warningcolor = "IndianRed"
    damage = 0 // bump into damage
    health = 148
    speed = 0
    info = {turretName:"M249"}
  } else if(type==='raptor'){ // with turrets!
    radius = 26
    color = "PaleTurquoise"
    warningcolor = "SteelBlue"
    damage = 10 // bump into damage
    health = 40
    speed = 10 // max speed
    info = {turretName:"ak47"}
  } else if(type==='B2'){ // with turrets!
    radius = 28
    color = "Silver"
    warningcolor = "PeachPuff"
    damage = 10 // bump into damage
    health = 50
    speed = 8 // max speed
    info = {turretName:"tankBuster"} // becareful not to shoot itself!
  }


  backEndVehicles[vehicleId] = {
    x,y,radius,velocity:0, myID:vehicleId, color, warningcolor, damage, health, speed, type,occupied:false,ridingPlayerID:-1,info, mytick:0
  }
  NONitemBorderUpdate(backEndVehicles[vehicleId])
}

function getOnVehicle(playerID,vehicleID){
  if (backEndVehicles[vehicleID].occupied){ // if already occupied, block others 
    return 
  }
  if (backEndPlayers[playerID].ridingVehicleID>0){ // if player is already riding a vehicle, dont ride again
    return
  }
  backEndPlayers[playerID].ridingVehicleID = vehicleID
  // backEndPlayers[playerID].speed = backEndVehicles[vehicleID].speed

  // transport to vehicle center
  backEndPlayers[playerID].x = backEndVehicles[vehicleID].x
  backEndPlayers[playerID].y = backEndVehicles[vehicleID].y

  backEndVehicles[vehicleID].occupied = true
  backEndVehicles[vehicleID].ridingPlayerID = playerID
  //console.log(`player ${playerID} got on ${vehicleID}`)
}

function getOffVehicle(playerID,vehicleID=-1){ // vehicleID should be given if player cannot give vehicle id (e.g. death)
  let TrueVehicleID =-1

  if (backEndPlayers[playerID]){ // if player alive
    TrueVehicleID = backEndPlayers[playerID].ridingVehicleID // get the true vehicle ID since we can get one

    if (!(backEndPlayers[playerID].ridingVehicleID>0)){ // if player is not riding a vehicle (false alarm)
      return
    }
    backEndPlayers[playerID].ridingVehicleID = -1
    backEndPlayers[playerID].speed = PLAYERSPEED

    // for safe get off
    let getoffdirectionX = 10
    let getoffdirectionY = 10
    if (backEndPlayers[playerID].x > MAPWIDTH/2){
      getoffdirectionX = -10
    } 
    if (backEndPlayers[playerID].y > MAPHEIGHT/2){
      getoffdirectionY = -10
    } 
    backEndPlayers[playerID].x = backEndVehicles[vehicleID].x + getoffdirectionX
    backEndPlayers[playerID].y = backEndVehicles[vehicleID].y + getoffdirectionY
    //Moveplayer(backEndPlayers[playerID], false, false, false, false) // border check

  }

  if (TrueVehicleID===-1){ // use vehicleID given instead - when we cannot get id from player
    TrueVehicleID = vehicleID
  }

  backEndVehicles[TrueVehicleID].occupied = false
  backEndVehicles[TrueVehicleID].ridingPlayerID = -1
  //console.log(`player ${playerID} got off ${TrueVehicleID}`)
}

function safeDeleteVehicle(vehicleid){
  const vehicle = backEndVehicles[vehicleid]
  if (vehicle.occupied){ // vehicle.ridingPlayerID must exist
    getOffVehicle(vehicle.ridingPlayerID,vehicleid)
  }

  // explode
  explosion(vehicle, 18,playerID=0)

  delete backEndVehicles[vehicleid]
}

function updateVehiclePos(vehicle){
  const riderID = vehicle.ridingPlayerID
  const rider = backEndPlayers[riderID]
  if (rider){ // rider exist
    vehicle.x = rider.x
    vehicle.y = rider.y
  }
}

function explosion(location,BLASTNUM,playerID=0,shockWave=false){
  for (let i=0;i< BLASTNUM;i++){
    if (shockWave){
      addProjectile( (2*Math.PI/BLASTNUM)*i,'shockWave',playerID, location,0)// damaging all players nearby
    } else{
      addProjectile( (2*Math.PI/BLASTNUM)*i,'fragment',playerID, location,0)// damaging all players nearby
    }
  }
  pushSoundRequest(location,'explosion',TILE_SIZE*8, duration=1)
}



// 
const AIRSTRIKE_TYPE_DICT = {'red':'bomb','green':'supply','white':'transport', 'yellow':'vehicle request'} 
const STRIKE_INTERVAL_COEF = 10
const PLANE_PICKUP_RADIUS = 256 // plane rad is 384
const PLANE_SOUND_HEAR_RANGE = TILE_SIZE*16

function spawnAirstrike(location, callerID, signalColor='green'){ // currently only makes cars
  airstrikeId++
  let x = location.x
  // check x border
  if (x < 0){
    x = 1
  }else if (x > MAPWIDTH){
    x = MAPWIDTH-1
  }


  let speed = Math.min( ((MAPHEIGHT - location.y)/MAPHEIGHT)*6+2 , 5) // 2~5
  const y = MAPHEIGHT + PLANE_SOUND_HEAR_RANGE // goes up

  const signal = AIRSTRIKE_TYPE_DICT[signalColor]
  // default signal is supply/vehicle request
  let strike_Y_level = location.y
  let strikeNumber = 1

  if (signal==='bomb'){
    speed = 7 // fly fast and bomber (same speed as B2)
    strikeNumber = 16
    strike_Y_level = Math.round(location.y + (strikeNumber/2)*speed*STRIKE_INTERVAL_COEF)
  } else if(signal==='transport'){
    speed = 6
  }


  backEndAirstrikes[airstrikeId] = {
    x,y, myID:airstrikeId, signal, speed, strike_Y_level, strikeNumber, callerID, onBoard:false, mytick:0
  }

}

function updateAirstrike(airstrikeid){
  let airstrike = backEndAirstrikes[airstrikeid]
  airstrike.y -= airstrike.speed

  //console.log(airstrike.mytick)
  // sound effect of flying
  if (airstrike.mytick % 18===0 && airstrike.signal === 'bomb'){ // smallest tick
    pushSoundRequest({x:airstrike.x,y:airstrike.y},'B2_halfsec',PLANE_SOUND_HEAR_RANGE, duration=1)
    airstrike.mytick = 0
  } else if (airstrike.mytick % 92===0 && airstrike.signal === 'vehicle request'){ // next large tick
    pushSoundRequest({x:airstrike.x,y:airstrike.y},'plane_motor_2sec',PLANE_SOUND_HEAR_RANGE, duration=1)
    airstrike.mytick = 0
  } else if (airstrike.mytick % 102===0){ // other planes check this 
    pushSoundRequest({x:airstrike.x,y:airstrike.y},'plane_2sec',PLANE_SOUND_HEAR_RANGE, duration=1)
    airstrike.mytick = 0
  }
  airstrike.mytick += 1
  // sound effect of flying

  if (airstrike.y <= - PLANE_SOUND_HEAR_RANGE){
    safeDeleteAirstrike(airstrikeid)

  } else if (airstrike.y < PLAYERRADIUS*2 && airstrike.signal==='transport') {
    safeTakeOff(airstrikeid)// leave player behind: set player pos to endpos

  }else if (airstrike.y <= airstrike.strike_Y_level && airstrike.strikeNumber>0){
    airstrike.strikeNumber -= 1
    DeployAirstrike(airstrike)
  }
}

//'item_landing','vehicle_landing'
const AirstrikeGuns = ['grenadeLauncher','AWM','tankBuster']
function DeployAirstrike(airstrike){

  if (airstrike.signal==='bomb'){ // strike multiple times
    const x_turbulance = Math.round((Math.random()-0.5) * 100)+100
    for (let i=-1;i<2;i+=2){
      explosion({x:airstrike.x + i*x_turbulance, y:airstrike.y},18,playerID=0,shockWave=true)
    }
    airstrike.strike_Y_level -= airstrike.speed*STRIKE_INTERVAL_COEF
    //console.log('air bombing at ', location)

  } else if(airstrike.signal==='supply'){ // strike once

    const idxGUN = Math.round(Math.random()*(AirstrikeGuns.length-1)) 
    makeNdropItem('gun', AirstrikeGuns[idxGUN], {x:airstrike.x + 100, y:airstrike.y})
    makeNdropItem('scope', "2" ,{x:airstrike.x - 100, y:airstrike.y})
    makeNdropItem('armor', 'reduce', {x:airstrike.x, y:airstrike.y})

    pushSoundRequest({x:airstrike.x,y:airstrike.y},'item_landing',TILE_SIZE*3, duration=1)

  } else if(airstrike.signal==='vehicle request'){
    spawnVehicle({x:airstrike.x, y:airstrike.y},'tank')

    pushSoundRequest({x:airstrike.x,y:airstrike.y},'vehicle_landing',TILE_SIZE*6, duration=1)

  } else if(airstrike.signal==='transport'){ // NOTE: this is called only once!
    const caller = backEndPlayers[airstrike.callerID] 
    if (caller && !caller.onBoard){ // should not be onBoard yet
      // If distance is enough to pick up, pick up the player
      const playerDist = Math.hypot(caller.x - airstrike.x, caller.y - airstrike.y)
      console.log('TRIED TO PICK A PLAYER UP AT: ',airstrike.x,airstrike.y)

      if (playerDist <= PLANE_PICKUP_RADIUS && caller.ridingVehicleID===-1 && !caller.getinhouse){ // should not be riding & not inside a house
        console.log('PICKED UP A PLAYER AT: ',caller.x,caller.y)
        // player cannot listen to any events but F: prioritized to take off (check) first - done in the frontEnd
        // carry player: player location is the airstrike location - done in update player
        caller.onBoard = true
        caller.strikeID = airstrike.myID
        airstrike.onBoard = true

        pushSoundRequest({x:airstrike.x,y:airstrike.y},'player_pickup',TILE_SIZE*2, duration=1)


      } else{
        console.log('COULD NOT PICKUP A PLAYER. REASON: was player riding a vehicle? ',caller.ridingVehicleID!==-1,' / was player inside a house? ',caller.getinhouse)
      }

    }
  }


}


function safeTakeOff(airstrikeID){
  const airstrike = backEndAirstrikes[airstrikeID]
  const passenger = backEndPlayers[airstrike.callerID] 
  if (!passenger){// no passenger remaining
    return
  }
  if (passenger.onBoard && airstrike.onBoard){ // both on board
    // takeoff player: detatch the link
    passenger.onBoard = false
    passenger.strikeID = -1 
    airstrike.onBoard = false
    NONitemBorderUpdate(passenger)
    pushSoundRequest({x:airstrike.x,y:airstrike.y},'takeoff',TILE_SIZE*3, duration=1)
  }

}

function safeDeleteAirstrike(airstrikeid){ 
  delete backEndAirstrikes[airstrikeid]
}


function pushSoundRequest(location,soundName,soundDistance, duration=1){
  if (soundName==='turret_moving'){
    return
  }
  soundID++
  const x = location.x
  const y = location.y
  backEndSoundRequest[soundID] = {
    x,y, myID:soundID, soundName, soundDistance, duration
  }
}

function updateSoundRequest(soundRequestID){
  let soundObject = backEndSoundRequest[soundRequestID]
  if (soundObject.duration<=0){
    safeDeleteSoundRequest(soundRequestID)
  } 
  soundObject.duration -= 1

}

function safeDeleteSoundRequest(soundRequestID){
  delete backEndSoundRequest[soundRequestID]
}

