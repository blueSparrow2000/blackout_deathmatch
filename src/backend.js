// server constants
const TICKRATE = 15
const SCREENWIDTH = 1024
const SCREENHEIGHT = 576
const ITEMRADIUS = 16
let signalReset = false
const SHOWBLOODPARTICLE = true

// map info
const TILES_IN_ROW = 23 // only use designated tileset: 23 kinds of tiles are in a row
const TILE_SIZE_HALF = 64;
const TILE_SIZE = TILE_SIZE_HALF*2 //128;

///////////////////////////////////// MAP CONFIGURATION /////////////////////////////////////
const MAPDICT = {'Wilderness':{tilenum:30,difficulty:1,spawnrate:15000,playerSpawn:'Random', 
  enemySpawn:[{x:TILE_SIZE*1 + TILE_SIZE_HALF,y:TILE_SIZE*1 + TILE_SIZE_HALF}]},
   'Sahara':{tilenum:50,difficulty:2,spawnrate:30000,playerSpawn:'Random', enemySpawn:[{x:TILE_SIZE*1 + TILE_SIZE_HALF,y:TILE_SIZE*1 + TILE_SIZE_HALF}]},
   'MilitaryBase':{tilenum:100,difficulty:2,spawnrate:15000,playerSpawn:'Random', enemySpawn:[{x:TILE_SIZE*50,y:TILE_SIZE*10},{x:TILE_SIZE*20,y:TILE_SIZE*20},{x:TILE_SIZE*70,y:TILE_SIZE*10}]},
   'Tutorial':{tilenum:10,difficulty:1,spawnrate:20000,playerSpawn:{x:9*TILE_SIZE,y:9*TILE_SIZE}, enemySpawn:[{x: TILE_SIZE_HALF,y:TILE_SIZE_HALF},{x:TILE_SIZE*9+ TILE_SIZE_HALF,y:TILE_SIZE_HALF}]},
   'Arena':{tilenum:10,difficulty:3,spawnrate:10000,playerSpawn:'Random', enemySpawn:[{x:TILE_SIZE_HALF,y:TILE_SIZE_HALF}]}} 
   
let MAPNAME = 'Tutorial'//'Sahara' //'MilitaryBase' // 'MilitaryBase'  //    'Wilderness' //'Sahara' 
let MAPTILENUM = MAPDICT[MAPNAME].tilenum // can vary, but map is SQUARE!
const DIFFICULTY = MAPDICT[MAPNAME].difficulty // 1~3 3 is the hardest
const variantMapName = ['Sahara','MilitaryBase']
///////////////////////////////////// MAP CONFIGURATION /////////////////////////////////////


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
let backEndPlayers = {}
let backEndEnemies = {}
let backEndProjectiles = {}
let backEndThrowables = {}
let backEndItems = {}
let backEndVehicles = {}
backEndItems[0] = {
    itemtype: 'melee', groundx:0, groundy:0, size:{length:5, width:5}, name:'fist', color:'black', iteminfo:{ammo:'inf', ammotype:'bio'} ,onground:false, myID: 0, deleteRequest:false
}
let backEndObjects = {}
let backEndAirstrikes = {}
let backEndSoundRequest = {}
let backEndParticleRequest = {}
let backEndKillLog = []

let enemyId = 0
let projectileId = 0
let throwableId = 0
let itemsId = 0 
let objectId = 0
let vehicleId = 0
let airstrikeId = 0
let soundID = 0
let ParticleRequestID = 0

// player attributes
const INVENTORYSIZE = 4
const PLAYERRADIUS = 16 
const PLAYERSPEED = 2 // pixel
const PLAYERSPEED_ONWATER = 1
const DASH_DIST = TILE_SIZE*2 
const PLAYERHEALTH = 8
const PLAYERHEALTHMAX = 8
const HEALTHBOOSTMAX = 32
const GUNHEARRANGE = 700
const PLAYER_JOIN_DELAY = 1000
let lastWinnerName = ''
let lastWinnerID = -1


//to check if there exists any player left
let USERCOUNT = [0]

// for bullets
const FRICTION = 0.999//0.992
const HIGHFRICTION = 0.98
const EXTREMEFRICTION = 0.88

// enemy setting (manual)
const SPAWNENEMYFLAG = true
const ENEMYSPAWNRATE = MAPDICT[MAPNAME].spawnrate // 1~3 3 is the hardest
//30000
let ENEMYNUM = 1
let ENEMYCOUNT = 0
const ENEMYORBITDIST = 5*TILE_SIZE 
const ENEMTBACKSTEPDIST = TILE_SIZE + TILE_SIZE_HALF

const GROUNDITEMFLAG = true
let GHOSTENEMY = false

const ENTITYDISTRIBUTIONS = ["test", "battleRoyale", "deathmatch"]
const ENTITYDISTRIBUTION_MARK = 2

// for items
const MINE_DETECTION_RADIUS = 32
const MINE_DETONATE_COUNTDOWN = 10 // 1 tick = 15ms (20 tick is about 0.3s)

const BARREL_RADIUS = 24
const BARREL_HEALTH = 2


const gunInfo = {
    // 'railgun':{travelDistance:0, damage: 3, shake:0, num: 1, fireRate: 1000, projectileSpeed:0, magSize:2, reloadTime: 1800, ammotype:'battery', size: {length:50, width:5}}, // pierce walls and entities
    // 'CrossBow':{travelDistance:650, damage: 10, shake:0, num: 1, fireRate: 100, projectileSpeed:8, magSize: 1, reloadTime: 1400, ammotype:'bolt', size: {length:21, width:2}}, 
    // 'GuideGun':{travelDistance:800, damage: 3, shake:0, num: 1, fireRate: 2100, projectileSpeed:6, magSize: 5, reloadTime: 1800, ammotype:'superconductor', size: {length:35, width:8}}, 
    'grenadeLauncher':{travelDistance:576, damage: 3, shake:0, num: 1, fireRate: 1600, projectileSpeed:13, magSize: 6, reloadTime: 1800, ammotype:'fragment', size: {length:25, width:4}}, 
    'fragment':{travelDistance:192, damage: 2, shake:3, num: 1, fireRate: 100, projectileSpeed:8, magSize: 5, reloadTime: 1400, ammotype:'fragment', size: {length:13, width:1}}, 
    'tankBuster':{travelDistance:704, damage: 100, shake:0, num: 1, fireRate: 4000, projectileSpeed:10, magSize: 1, reloadTime: 6000, ammotype:'rocket', size: {length:35, width:4}}, 
    'shockWave':{travelDistance:192, damage: 15, shake:6, num: 1, fireRate: 300, projectileSpeed:18, magSize: 1, reloadTime: 1400, ammotype:'shockWave', size: {length:14, width:2}}, 
    'flareGun':{travelDistance:320, damage: 0, shake:0, num: 1, fireRate: 1000, projectileSpeed:3, magSize: 1, reloadTime: 1000, ammotype:'red', size: {length:15, width:4}}, // default is red
    'explosion':{travelDistance:32, damage: 1, shake:3, num: 1, fireRate: 500, projectileSpeed:6, magSize:1, reloadTime: 1000, ammotype:'hard', size: {length:0, width:3}},

    'Lynx':{travelDistance:3200, damage: 30, shake:0, num: 1, fireRate: 2200, projectileSpeed:60, magSize: 5, reloadTime: 4000, ammotype:'.50BMG', size: {length:60, width:3}}, 
    
    'M1':{travelDistance:2400, damage: 6, shake:0, num: 1, fireRate: 1300, projectileSpeed:42, magSize: 5, reloadTime: 3600, ammotype:'7mm', size: {length:42, width:3}}, 
    'mk14':{travelDistance:1216, damage: 3.5, shake:1, num: 1, fireRate: 650, projectileSpeed:34, magSize:14, reloadTime: 3300, ammotype:'7mm', size: {length:34, width:2} }, 
    'SLR':{travelDistance:2000, damage: 2.5, shake:1, num: 1, fireRate: 300, projectileSpeed:36, magSize: 10, reloadTime: 2700, ammotype:'7mm', size: {length:38, width:2}}, 
    'AWM':{travelDistance:2800, damage: 11, shake:0, num: 1, fireRate: 2000, projectileSpeed:32, magSize:  7, reloadTime: 4000, ammotype:'7mm', size: {length:50, width:3}}, 
    'Deagle':{travelDistance:640, damage: 3, shake:1, num: 1, fireRate: 350, projectileSpeed:20, magSize:7, reloadTime: 3300, ammotype:'7mm', size: {length:18, width:3}}, 
    
    'pistol':{travelDistance:640, damage: 1, shake:2, num: 1, fireRate: 300, projectileSpeed:18, magSize:15, reloadTime: 1100, ammotype:'5mm', size: {length:17, width:2}}, 
    'M249':{travelDistance:960, damage: 1, shake:1, num: 1, fireRate: 100, projectileSpeed:26, magSize:100, reloadTime: 7200, ammotype:'5mm', size: {length:28, width:6}},
    'VSS':{travelDistance:1216, damage: 1, shake:1, num: 1, fireRate: 100, projectileSpeed:21, magSize:20, reloadTime: 2300, ammotype:'5mm' , size: {length:27, width:2}}, 
    'ak47':{travelDistance:832, damage: 1, shake:1, num: 1, fireRate: 110, projectileSpeed:25, magSize:30, reloadTime: 2000, ammotype:'5mm', size: {length:28, width:3}}, 
    'FAMAS':{travelDistance:704, damage: 1, shake:2, num: 1, fireRate: 90, projectileSpeed:23, magSize: 30, reloadTime: 3200, ammotype:'5mm', size: {length:22, width:3}}, 

    's686':{travelDistance:320, damage: 1, shake:4, num: 6, fireRate: 180, projectileSpeed:11, magSize:2, reloadTime: 2500, ammotype:'12G', size: {length:13, width:5}},
    'DBS':{travelDistance:448, damage: 1, shake:2, num: 3, fireRate: 300, projectileSpeed:14, magSize:14, reloadTime: 6000, ammotype:'12G', size: {length:16, width:5}},
    'usas12':{travelDistance:448, damage: 0, shake:1, num: 1, fireRate: 250, projectileSpeed:12, magSize:5, reloadTime: 2800, ammotype:'12G', size: {length:18, width:4}},
    
    'ump45':{travelDistance:800, damage: 0.8, shake:1, num: 1, fireRate: 85, projectileSpeed:19, magSize:25, reloadTime: 2700, ammotype:'45ACP', size: {length:19, width:4}},
    'vector':{travelDistance:650, damage: 0.8, shake:1, num: 1, fireRate: 50, projectileSpeed:21, magSize:19, reloadTime: 2600, ammotype:'45ACP', size: {length:18, width:3}},
    'mp5':{travelDistance:700, damage: 0.8, shake:1, num: 1, fireRate: 70, projectileSpeed:22, magSize:30, reloadTime: 2100, ammotype:'45ACP', size: {length:20, width:3}},
    'MG3':{travelDistance:700, damage: 0.8, shake:0, num: 1, fireRate: 35, projectileSpeed:17, magSize:100, reloadTime: 1600, ammotype:'45ACP', size: {length:13, width:2}},
    
    
    'fist':{travelDistance:24, damage: 0.5, shake:0, num: 1, fireRate: 300, projectileSpeed:6, magSize:0, reloadTime: 0, ammotype:'bio', size: {length:0, width:4}},
    'knife':{travelDistance:32, damage: 1, shake:0, num: 1, fireRate: 200, projectileSpeed:8, magSize:0, reloadTime: 0, ammotype:'sharp', size: {length:0, width:2}},
    'bat':{travelDistance:48, damage: 2, shake:1, num: 1, fireRate: 500, projectileSpeed:6, magSize:0, reloadTime: 0, ammotype:'hard', size: {length:0, width:3}},

  }
const gunOrderInDeathmatch = ['AWM','vector','s686','ak47','SLR','FAMAS','usas12','mp5','M249','mk14','VSS','DBS','ump45','M1','Deagle','pistol']
const PICKABLE_GUNS = ['flareGun', 'Lynx','tankBuster','grenadeLauncher','MG3']
const PENETRATION_GUNS = ['Lynx', 'shockWave']
const finalScore = gunOrderInDeathmatch.length - 1

let defaultGuns = [gunOrderInDeathmatch[0]]//['tankBuster','shockWave','fragment','grenadeLauncher']// 

// 'guntypes' is except for grenade launcher and fragments! Since they are OP
const gunTypes = [ 'M1', 'mk14', 'SLR','AWM',    'pistol','VSS', 'M249', 'ak47', 'FAMAS',    's686','DBS', 'usas12',     'ump45','vector','mp5'] // except special guns: 'tankBuster', 'grenadeLauncher', 'fragment'
const flareTypes = ['red','green','yellow','white','purple']
const meleeTypes = ['knife','bat']



const consumableTypes = ['bandage','medkit','adrenaline', 'drink']
const consumableInfo = {
'bandage': {size:{length:8, width:8}, color: '#99A3A3', healamount: 2, consumeTime: 1000 },
'medkit': {size:{length:12, width:12}, color: '#560319', healamount: PLAYERHEALTHMAX, consumeTime: 4000},
'adrenaline': {size:{length:12, width:12}, color: '#E2F516', healamount: 6.4, consumeTime: 1500},
'drink': {size:{length:12, width:12}, color: '#C58917', healamount: 3.2, consumeTime: 1000},
}

const armorTypes = ['absorb', 'reduce', 'turtle', 'anti blast']
const armorInfo = {
'absorb':{color: 'DarkTurquoise',size:{length:12, width:12}, amount:5, radius:1},
'reduce':{color: 'DeepSkyBlue',size:{length:12, width:12}, amount:5, radius:2},
'turtle':{color: '#006A4E',size:{length:12, width:12}, amount:5, radius:3},
'anti blast':{color: '#C88141',size:{length:12, width:12}, amount:5, radius:3.5},
}

const scopeTypes = ['1','2'] // currently available scope!

const vehicleTypes = ['car','Fennek','APC', 'tank', 'turret', 'raptor','B2']
const SHOOTER_VEHICLES_BACKEND = ["APC", "tank" ,"turret" ,"raptor","B2"]
const FLYING_VEHICLES = ["raptor","B2"]

const placeableTypes = ['barrel', 'mine']
const placeableInfo = {
'barrel':{color: '#0B6121',size:{length:12, width:12},variantName:''},
'mine':{color: '#AEB404',size:{length:12, width:12},variantName:''},
}

const throwableTypes = ['grenade', 'smoke', 'flash']
const throwableInfo = {
  'grenade':{travelDistance:1200, speed:21, shake:1, color: '#2A0A12', size: {length:0, width:3}},
  'smoke':{travelDistance:600, speed:10,  shake:1, color: '#B6B6B4',  size: {length:0, width:3}},
  'flash':{travelDistance:1200, speed:21, shake:1, color: '#E0FFFF', size: {length:0, width:3}},
}


function updateKillLog(killerName,killedName,reason='',serverkill= false){
  if (!killedName){
    killedName = 'Player'
  }
  // server kill (barrel/mines/airstrike etc.)
  if (serverkill){
    backEndKillLog.push(`${killedName} was killed by ${reason}`)
    return
  }
  if (!killerName){
    killerName = 'Player'
  }
  // not a server kill (player killed player)
  if (reason){
    backEndKillLog.push(`${killerName} killed ${killedName} with ${reason}`)
  } else{
    backEndKillLog.push(`${killerName} killed ${killedName}`)
  }
  
}

let check = false

function refreshKillLog(){
  if (backEndKillLog.length){ // length >0
    if (check){
      //console.log(backEndKillLog.length)
      backEndKillLog = []
      check = false
    }else{
      check = true
    }
  }
}


function armorEffect(armorID, damage){
  if (armorID <= 0){ // no armor
    return damage
  }
  const armortype = backEndItems[armorID].name
  switch (armortype){
    case 'absorb': // absorb 0.2 damage: immune to fist
      if (damage>0.8){ 
        return Math.max(damage - 0.4, 0)
      }
      return Math.max(damage - 0.2, 0)
    case 'reduce': // reduce 10% of damage
    //console.log("reduce")
      if (damage>3){// reduce 30% of damage if large
        return (7*damage)/10
      }
      return (9*damage)/10
    case 'turtle': // 
      return damage/2
    case 'anti blast': // 
      if (damage===15){ // shockwave
        return 1
      } else if (damage===2){ // fragment
        return 0.5
      }
      return damage
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
  else if (MAPNAME==='Wilderness' && ENTITYDISTRIBUTIONS[ENTITYDISTRIBUTION_MARK]==="deathmatch"){
    // special tile locations in 'Wilderness'

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

    makeNdropItem('scope', "1", getCoordTilesCenter(TILESLOC["house1"]))
    // makeNdropItem('gun', 'ump45', getCoordTilesCenter(TILESLOC["house1"]))
    // makeNdropItem('gun', 'vector', getCoordTilesCenter(TILESLOC["house2"]))
    // makeNdropItem('gun', 'mp5', getCoordTilesCenter(TILESLOC["house3"]))

    // some guns 
    const rock1loc = getCoordTilesCenter(TILESLOC["rock1"])
    // makeNdropItem('gun', 'AWM', rock1loc)
    makeNdropItem('scope', "2", rock1loc) // scope 3 is laggy to other PCs
    // console.log(rockloc)
    // console.log(MAPWIDTH)
    const rock2loc = getCoordTilesCenter(TILESLOC["rock2"])
    // makeNdropItem('gun', 'M249', rock2loc)
    makeNdropItem('scope', "1", rock2loc)

    const sandroad1loc = getCoordTilesCenter(TILESLOC["sandroad1"])
    // makeNdropItem('gun', 'usas12', sandroad1loc)

    const sandroad2loc = getCoordTilesCenter(TILESLOC["sandroad2"])
    // makeNdropItem('gun', 's686', sandroad2loc)

    const tree2loc = getCoordTilesCenter(TILESLOC["tree2"])
    // makeNdropItem('gun', 'grenadeLauncher', tree2loc)
    

    // makeNdropItem('gun', 'FAMAS', getCoordTilesCenter(TILESLOC["tree3"]))
    makeNdropItem('melee', 'knife', getCoordTilesCenter(TILESLOC["tree4"]))
    // makeNdropItem('gun', 'ak47', getCoordTilesCenter(TILESLOC["tree5"]))


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

  else if (MAPNAME==='Sahara' && ENTITYDISTRIBUTIONS[ENTITYDISTRIBUTION_MARK]==="deathmatch"){
    resetMap('Sahara')
  }
  else if (MAPNAME==='MilitaryBase' && ENTITYDISTRIBUTIONS[ENTITYDISTRIBUTION_MARK]==="deathmatch"){
    resetMap('MilitaryBase')
  }
  else if (MAPNAME==='Tutorial' ){//&& ENTITYDISTRIBUTIONS[ENTITYDISTRIBUTION_MARK]==="battleRoyale" // in this mode, you pickup guns - TBU
    resetMap('Tutorial')
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

function addThrowable(angle,playerID,location, type='grenade',holding=false){
  throwableId++
  const infoGET = throwableInfo[type] 
  let  shakeProj = infoGET.shake
  if (holding){
    shakeProj = 2*shakeProj+1 // double spread + extra spread
  }
  let speed = infoGET.speed

  const thisPlayer = backEndPlayers[playerID]
  // recalculate speed: max speed or player mouse pos
  const max_mouse_distance = 30
  speed = Math.min(speed, Math.max(0, get_player_center_mouse_distance(thisPlayer.mousePos, thisPlayer.canvasWidth/2, thisPlayer.canvasHeight/2)/max_mouse_distance))

  const velocity = { // with shake!
    x: Math.cos(angle) * speed + (Math.random()-0.5) * shakeProj,
    y: Math.sin(angle) * speed + (Math.random()-0.5) * shakeProj
  }
  const radius = 4

  let travelDistance = infoGET.travelDistance

  let color = infoGET.color

  backEndThrowables[throwableId] = {
      x:location.x, y:location.y,radius,velocity, speed, playerId: playerID, travelDistance, color, type, myID:throwableId
    }
}

function safeDeleteThrowable(throwID){
  const backEndThrowable = backEndThrowables[throwID]

  if (backEndThrowable.type==='grenade'){
    explosion(backEndThrowable,12,playerID=backEndThrowable.playerId,shockWave=true,small = false)
    explosion(backEndThrowable,24,playerID=backEndThrowable.playerId,shockWave=false,small = false)    
  } else if(backEndThrowable.type==='flash'){
    io.emit('flash',{x:backEndThrowable.x, y:backEndThrowable.y}) // send location

  } else if(backEndThrowable.type==='smoke'){
    // deploy a smoke drawable
    pushParticleRequest(backEndThrowable.x, backEndThrowable.y, 'smoke', 0)

  }

  delete backEndThrowables[throwID]
}

function addProjectile(angle,currentGun,playerID,location,startDistance,holding=false){
  projectileId++
  const guninfoGET = gunInfo[currentGun]
  let  shakeProj = guninfoGET.shake
  if (holding){
    shakeProj = 2*shakeProj+1 // double spread + extra spread
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
  } else if (currentGun==='Lynx'){// fire two bullets at the same time
    backEndProjectiles[projectileId] = {
      x:location.x + Math.cos(angle)*150, y:location.y + Math.sin(angle)*150,radius,velocity, speed:bulletSpeed, playerId: playerID, gunName:currentGun, travelDistance, projDamage,color
    }
    projectileId++
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
  } else if(backEndProjectile.gunName==='usas12'){
    const frags = 3 + Math.round(Math.random()*2) // 3~5
    explosion(backEndProjectile,frags,playerID=backEndProjectile.playerId,shockWave=false,small = true)
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

  // drop only a medkit (no other inventory stuffs - melee weapons & consumables in inventory are deleted)
  makeNdropItem('consumable', 'medkit',{x:backEndPlayer.x + (Math.random() - 0.5)*100, y:backEndPlayer.y + (Math.random() - 0.5)*100})


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

// for (let i=0;i<defaultGuns.length; i++){
//   makeNdropItem('gun', defaultGuns[i], {x:0 ,y:0},onground=false)
//   inventory[i] = backEndItems[itemsId]
// }


function updateGunBasedOnScore(shooterID){ 
  const player = backEndPlayers[shooterID]
  if (!player){ // if does not exist
    return
  }
  const score = player.score
  player.dash = 1 // also update player's dash

  if (score >= finalScore){
    lastWinnerName = player.username
    lastWinnerID = shooterID
    console.log("winner has been selected: ",lastWinnerName)
    // player.health = 0 // immediate death to the winner...
    // kill all players and reset the map
    signalReset = true
    return
  }


  const playerholdinggun = player.inventory[0]
  backEndItems[playerholdinggun.myID].deleteflag = true // what about not deleting it... umm... not good but.. 

  // now add the item based on the score
  const newGunID = makeNdropItem('gun', gunOrderInDeathmatch[score], {x:0 ,y:0},onground=false)
  player.inventory[0] = backEndItems[newGunID]

}


function killAllPlayers(){
  for (const playerId in backEndPlayers) {
    // let backEndPlayer = backEndPlayers[playerId]
    // backEndPlayer.health = 0
    delete backEndPlayers[playerId]
  }
}

// AUTO DROPPER
function auto_dropper(TILESLOC_N_REQUEST){
const mapDropKeys = Object.keys(TILESLOC_N_REQUEST)
const ItemDictionary_For_Random = {'gun':gunTypes, 'scope':scopeTypes, 'consumable':consumableTypes,'melee':meleeTypes,'armor':armorTypes,'throwable':throwableTypes, 'placeable': placeableTypes}
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
    
  } else if (tileloc_request.request[0]==="flare"){ 
    if (tileloc_request.request[1]==='random'){
      const maxVariationOfItem = flareTypes.length
      const idxItem = Math.round(Math.random()*(maxVariationOfItem-1))
      makeNdropItem('gun', 'flareGun', getCoordTilesCenter(tileloc_request),onground=true,variantNameGiven=flareTypes[idxItem]) //spawnVehicle(getCoordTilesCenter(tileloc_request),vehicleTypes[idxItem])

    }else{ // specified
      makeNdropItem('gun', 'flareGun', getCoordTilesCenter(tileloc_request),onground=true,variantNameGiven=tileloc_request.request[1]) //spawnVehicle(getCoordTilesCenter(tileloc_request),tileloc_request.request[1])
    }

  } else if (tileloc_request.request[0]==="placeable" && variantMapName.includes(MAPNAME)){ // only if in variant maps
    if (tileloc_request.request[1]==='random'){
      const maxVariationOfItem = placeableTypes.length
      const idxItem = Math.round(Math.random()*(maxVariationOfItem-1))
      makeNdropItem(tileloc_request.request[0], ItemList[idxItem],getCoordTilesCenter(tileloc_request),onground=true,variantNameGiven=`${MAPNAME}${ItemList[idxItem]}`) 

    }else{ // specified
      makeNdropItem(tileloc_request.request[0], tileloc_request.request[1],getCoordTilesCenter(tileloc_request),onground=true,variantNameGiven=`${MAPNAME}${tileloc_request.request[1]}`) 
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
}

const waterY1 = 50*TILE_SIZE
const waterY2 = 60*TILE_SIZE
const waterX1 = 46*TILE_SIZE
const waterX2 = 49*TILE_SIZE
function waterCheck(playerGET){ // for military map only
  if ( (playerGET.x <= waterX1|| playerGET.x >= waterX2) && (waterY1 <= playerGET.y && playerGET.y <= waterY2) ){
    return true
  }
  return false

}

function resetMap(MapNameGiven){
  if (MapNameGiven==='Sahara'){
    const TILESLOC_N_REQUEST = {
      // 'APCLocation1':{row: 24, col:5, request:['vehicle','turret']},
      // 'APCLocation2':{row: 27, col:5, request:['vehicle','turret']},
      // 'APCLocation3':{row: 43, col:11, request:['vehicle','APC']},
      // 'APCLocation4':{row: 8, col:11, request:['vehicle','APC']},
      'CarLoc1':{row: 20, col:22, request:['vehicle','car']},
      'CarLoc2':{row: 12, col:30, request:['vehicle','car']},
      'CarLoc3':{row: 12, col:34, request:['vehicle','car']},
      'CarLoc4':{row: 12, col:45, request:['vehicle','car']},
      'CarLoc5':{row: 29, col:42, request:['vehicle','car']},
      'CarLoc6':{row: 32, col:42, request:['vehicle','car']},
      'CarLoc7':{row: 29, col:29, request:['vehicle','car']},
      'CarLoc8':{row: 32, col:29, request:['vehicle','car']},
      // 'RandomTreeLoc1':{row: 8, col:15, request:['gun','random']},
      // 'RandomTreeLoc2':{row: 11, col:11, request:['gun','random']},
      // 'RandomTreeLoc3':{row: 14, col:13, request:['gun','random']},
      // 'RandomTreeLoc4':{row: 17, col:9, request:['gun','random']},
      // 'RandomTreeLoc5':{row: 19, col:14, request:['gun','random']},
      // 'RandomTreeLoc6':{row: 22, col:12, request:['gun','random']},
      // 'RandomTreeLoc7':{row: 25, col:8, request:['gun','random']},
      // 'RandomTreeLoc8':{row: 27, col:12, request:['gun','random']},
      // 'RandomTreeLoc9':{row: 27, col:14, request:['gun','random']},
      // 'RandomTreeLoc10':{row: 30, col:9, request:['gun','random']},
      // 'RandomTreeLoc11':{row: 32, col:12, request:['gun','random']},
      // 'RandomTreeLoc12':{row: 36, col:12, request:['gun','random']},
      // 'RandomTreeLoc13':{row: 37, col:10, request:['gun','random']},
      // 'RandomTreeLoc14':{row: 39, col:14, request:['gun','random']},
      // 'RandomTreeLoc15':{row: 42, col:13, request:['gun','random']},
      // 'RandomTreeLoc16':{row: 44, col:15, request:['gun','random']},
      'House_15TilesRoof1':{row: 46, col:24, request:['throwable','random']},
      'House_15TilesRoof2':{row: 46, col:29, request:['throwable','random']},
      'House_15TilesRoof3':{row: 46, col:34, request:['throwable','random']},
      'House_15TilesRoof4':{row: 46, col:39, request:['throwable','random']},
      'House_15TilesRoof5':{row: 46, col:44, request:['throwable','random']},
      'House_15TilesCenter1':{row: 44, col:23, request:['consumable','random']},
      'House_15TilesCenter2':{row: 44, col:28, request:['consumable','random']},
      'House_15TilesCenter3':{row: 44, col:33, request:['consumable','random']},
      'House_15TilesCenter4':{row: 44, col:38, request:['consumable','random']},
      'House_15TilesCenter5':{row: 44, col:43, request:['consumable','random']},
      'House_CourtyardCorner1':{row: 28, col:38, request:['consumable','medkit']},
      'House_CourtyardCorner2':{row: 28, col:33, request:['consumable','adrenaline']},
      'House_CourtyardCorner3':{row: 33, col:33, request:['consumable','medkit']},
      'House_CourtyardCorner4':{row: 33, col:38, request:['consumable','adrenaline']},
      'CourtyardCorner1':{row: 30, col:35, request:['scope','random']},
      'CourtyardCorner2':{row: 30, col:36, request:['scope','random']},
      'CourtyardCorner3':{row: 31, col:35, request:['scope','random']},
      'CourtyardCorner4':{row: 31, col:36, request:['scope','random']},
      'GardenCenter1':{row: 19, col:37, request:['consumable','adrenaline']},
      'House_36TilesRoof1':{row: 18, col:28, request:['consumable','random']},
      'House_36TilesItemPoints1':{row: 13, col:23, request:['armor','random']},
      'House_36TilesItemPoints2':{row: 13, col:28, request:['armor','random']},
      'House_36TilesItemPoints3':{row: 18, col:23, request:['armor','random']},
      'House_42TilesRoof1':{row: 21, col:43, request:['consumable','random']},
      'House_42TilesItemPoints1':{row: 14, col:36, request:['armor','random']},
      'House_42TilesItemPoints2':{row: 13, col:43, request:['armor','random']},
      'RockyItempoints1':{row: 1, col:29, request:['melee','random']},
      'RockyItempoints2':{row: 0, col:32, request:['melee','random']},
      'RockyItempoints3':{row: 1, col:37, request:['melee','random']},
      'RockyItempoints4':{row: 2, col:48, request:['melee','random']},
      // 'ForestItemPoints1':{row: 30, col:49, request:['gun','random']},
      // 'ForestItemPoints2':{row: 28, col:49, request:['gun','random']},
      // 'ForestItemPoints3':{row: 24, col:49, request:['gun','random']},
      // 'ForestItemPoints4':{row: 35, col:49, request:['gun','random']},
      // 'ForestItemPoints5':{row: 20, col:49, request:['gun','random']},
    } 
  
    // AUTO DROPPER
    auto_dropper(TILESLOC_N_REQUEST)

    // MANUAL DROP
    // test feature
    makeNdropItem('scope', "3" ,getCoordTilesCenter({row:1,col:1})) // get with your own risk: will be laggy!
    // for (let i=0;i<5;i++){
    //   makeNdropItem('throwable', "grenade" ,getCoordTilesCenter({row:1,col:2})) // get with your own risk: will be laggy!
    //   makeNdropItem('throwable', "smoke" ,getCoordTilesCenter({row:1,col:3})) // get with your own risk: will be laggy!
    //   makeNdropItem('throwable', "flash" ,getCoordTilesCenter({row:1,col:4})) // get with your own risk: will be laggy!
    // }

    // makeNdropItem('placeable', 'barrel' ,getCoordTilesCenter({row:2,col:3})) 
    makeNdropItem('placeable', 'barrel' ,getCoordTilesCenter({row:2,col:4}),onground=true,variantNameGiven='Saharabarrel') 
   
    for (let i=0;i<2;i++){
      makeNdropItem('placeable', 'mine' ,getCoordTilesCenter({row:47,col:2}),onground=true,variantNameGiven='Saharamine') 
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
    makeNdropItem('gun', 'flareGun', getCoordTilesCenter({row:48,col:48}),onground=true,variantNameGiven='purple') //spawnVehicle(getCoordTilesCenter(tileloc_request),vehicleTypes[idxItem])

    // makeNdropItem( 'armor', 'turtle', getCoordTilesCenter({row:46,col:48}))
    // makeNdropItem( 'armor', 'anti blast', getCoordTilesCenter({row:45,col:48}))


    // MAKE HOUSES
    for (let i=0;i<5;i++){
      makeHouse_15Tiles(getCoordTiles(TILESLOC_N_REQUEST[`House_15TilesCenter${i+1}`]))
    }
  
    makeHouse_36Tiles(getCoordTiles(TILESLOC_N_REQUEST['House_36TilesRoof1']))
    makeHouse_42Tiles(getCoordTiles(TILESLOC_N_REQUEST['House_42TilesRoof1']))
    makeHouse_Courtyard(getCoordTiles(TILESLOC_N_REQUEST['House_CourtyardCorner2'])) // top left inner corner


  
    // // Make custom vehicles
    // spawnVehicle(getCoordTilesCenter({row:46,col:1}),'car')
    // spawnVehicle(getCoordTilesCenter({row:46,col:2}), 'tank')
    // // // these are for next map: military base
    // spawnVehicle(getCoordTilesCenter({row:46,col:3}), 'raptor')
    // spawnVehicle(getCoordTilesCenter({row:46,col:4}), 'B2')
    // spawnVehicle(getCoordTilesCenter({row:46,col:5}), 'Fennek')
    // spawnVehicle(getCoordTilesCenter({row:46,col:6}), 'APC')
    // spawnVehicle(getCoordTilesCenter({row:46,col:7}), 'turret')
  
  
    // MAKE OBJECTS
    const BarrelRowNum = 2
    const BarrelColNum = 3
    
    for (let i=0;i<BarrelRowNum;i++){
      for (let j=0;j<BarrelColNum;j++){
        makeObjects("barrel", BARREL_HEALTH, {center:getCoordTilesCenter({row: 6+i, col:1+j}), radius: BARREL_RADIUS, color:'gray',placerID:0}, givenname ='Saharabarrel')
      }
    }
  
    for (let i=0;i<BarrelRowNum;i++){
      for (let j=0;j<BarrelColNum;j++){
        makeObjects("barrel", BARREL_HEALTH, {center:getCoordTilesCenter({row: 40+i, col:1+j}), radius: BARREL_RADIUS, color:'gray',placerID:0}, givenname ='Saharabarrel')
      }
    }
  

  }else if (MapNameGiven=== 'MilitaryBase'){   
    const TILESLOC_N_REQUEST = {
'WatchTower1':{row: 7, col:7, request:['vehicle','turret']},
'WatchTower2':{row: 7, col:77, request:['vehicle','turret']},
'WatchTower3':{row: 32, col:7, request:['vehicle','turret']},
'WatchTower4':{row: 32, col:77, request:['vehicle','turret']},
'WatchTower5':{row: 32, col:52, request:['vehicle','turret']},
'WatchTowerScope1':{row: 8, col:8, request:['scope','3']},
'WatchTowerScope2':{row: 8, col:76, request:['scope','3']},
'WatchTowerScope3':{row: 31, col:76, request:['scope','3']},
'WatchTowerScope4':{row: 31, col:52, request:['scope','3']},
'WatchTowerScope5':{row: 31, col:8, request:['scope','3']},
'CommandCenterPoint1':{row: 11, col:11, request:['flare','red']},
'CommandCenterPoint2':{row: 11, col:23, request:['flare','green']},
'CommandCenterPoint3':{row: 11, col:15, request:['flare','white']},
'CommandCenterPoint4':{row: 11, col:19, request:['flare','purple']},
'CommandCenterPoint5':{row: 17, col:17, request:['flare','random']},
'Tanks1':{row: 7, col:32, request:['vehicle','tank']},
'Tanks2':{row: 12, col:32, request:['vehicle','tank']},
'Fenneks1':{row: 7, col:37, request:['vehicle','Fennek']},
'Fenneks2':{row: 12, col:37, request:['vehicle','Fennek']},
'APCs1':{row: 7, col:42, request:['vehicle','APC']},
'APCs2':{row: 12, col:42, request:['vehicle','APC']},
'HangarCargo1':{row: 84, col:13, request:['vehicle','raptor']},
'HangarCargo2':{row: 84, col:27, request:['vehicle','raptor']},
'HangarCargo3':{row: 81, col:21, request:['vehicle','raptor']},
'Cargo1':{row: 28, col:16, request:['vehicle','car']},
'Cargo2':{row: 28, col:23, request:['vehicle','car']},
'Cargo3':{row: 26, col:23, request:['vehicle','car']},
'Cargo4':{row: 26, col:16, request:['vehicle','car']},
'House_15TilesRoof1':{row: 65, col:22, request:['throwable','random']},
'House_15TilesRoof2':{row: 65, col:27, request:['throwable','random']},
'House_15TilesRoof3':{row: 65, col:32, request:['throwable','random']},
'House_15TilesRoof4':{row: 65, col:37, request:['throwable','random']},
'House_15TilesCenter1':{row: 63, col:21, request:['consumable','bandage']},
'House_15TilesCenter2':{row: 63, col:26, request:['consumable','bandage']},
'House_15TilesCenter3':{row: 63, col:31, request:['consumable','bandage']},
'House_15TilesCenter4':{row: 63, col:36, request:['consumable','bandage']},
'House_CourtyardCorner1':{row: 39, col:93, request:['consumable','medkit']},
'House_CourtyardCorner2':{row: 39, col:88, request:['consumable','adrenaline']},
'House_CourtyardCorner3':{row: 44, col:88, request:['consumable','medkit']},
'House_CourtyardCorner4':{row: 44, col:93, request:['consumable','adrenaline']},
'House_CourtyardCorner5':{row: 65, col:95, request:['consumable','medkit']},
'House_CourtyardCorner6':{row: 65, col:90, request:['consumable','adrenaline']},
'House_CourtyardCorner7':{row: 70, col:90, request:['consumable','medkit']},
'House_CourtyardCorner8':{row: 70, col:95, request:['consumable','adrenaline']},
'CourtyardCorner1':{row: 41, col:90, request:['scope','random']},
'CourtyardCorner2':{row: 41, col:91, request:['scope','random']},
'CourtyardCorner3':{row: 42, col:90, request:['scope','random']},
'CourtyardCorner4':{row: 42, col:91, request:['scope','random']},
'CourtyardCorner5':{row: 67, col:92, request:['scope','random']},
'CourtyardCorner6':{row: 67, col:93, request:['scope','random']},
'CourtyardCorner7':{row: 68, col:93, request:['scope','random']},
'CourtyardCorner8':{row: 68, col:92, request:['scope','random']},
'House_36TilesRoof1':{row: 95, col:95, request:['throwable','smoke']},
'House_36TilesItemPoints1':{row: 90, col:95, request:['armor','random']},
'House_36TilesItemPoints2':{row: 90, col:90, request:['armor','random']},
'House_36TilesItemPoints3':{row: 95, col:90, request:['armor','random']},
'House_42TilesRoof1':{row: 83, col:84, request:['throwable','flash']},
'House_42TilesItemPoints1':{row: 76, col:77, request:['armor','random']},
'House_42TilesItemPoints2':{row: 75, col:84, request:['armor','random']},
'Bridge1':{row: 49, col:46, request:['throwable','random']},
'Bridge2':{row: 49, col:48, request:['throwable','random']},
'Bridge3':{row: 60, col:46, request:['throwable','random']},
'Bridge4':{row: 60, col:48, request:['throwable','random']},
    } 
  
    // AUTO DROPPER - GENERATE ITEMS / VEHICLES
    auto_dropper(TILESLOC_N_REQUEST)


    // MAKE HOUSES
    for (let i=0;i<4;i++){
      makeHouse_15Tiles(getCoordTiles(TILESLOC_N_REQUEST[`House_15TilesCenter${i+1}`]))
    }
    makeHouse_36Tiles(getCoordTiles(TILESLOC_N_REQUEST['House_36TilesRoof1']))
    makeHouse_42Tiles(getCoordTiles(TILESLOC_N_REQUEST['House_42TilesRoof1']))
    for (let i=0;i<2;i++){
      makeHouse_Courtyard(getCoordTiles(TILESLOC_N_REQUEST[`House_CourtyardCorner${2+(i)*4}`])) // top left inner corner
    }
    makeBridge(getCoordTiles(TILESLOC_N_REQUEST['Bridge1']))
      
    // MAKE OBJECTS
    const BarrelRowNum = 2
    const BarrelColNum = 3
    
    for (let i=0;i<BarrelRowNum;i++){
      for (let j=0;j<BarrelColNum;j++){
        makeObjects("barrel", BARREL_HEALTH, {center:getCoordTilesCenter({row: 6+i, col:1+j}), radius: BARREL_RADIUS, color:'gray',placerID:0}, givenname ='Saharabarrel')
      }
    }
  
    for (let i=0;i<BarrelRowNum;i++){
      for (let j=0;j<BarrelColNum;j++){
        makeObjects("barrel", BARREL_HEALTH, {center:getCoordTilesCenter({row: 40+i, col:1+j}), radius: BARREL_RADIUS, color:'gray',placerID:0}, givenname ='Saharabarrel')
      }
    }

  }else if (MapNameGiven=== 'Tutorial'){   
    const TILESLOC_N_REQUEST = {
'house1':{row: 5, col:1, request:['scope','1']},
'house2':{row: 5, col:4, request:['scope','1']},
'adrenaline1':{row: 9, col:9, request:['consumable','adrenaline']},
'medkit1':{row: 9, col:8, request:['consumable','medkit']},
'knife1':{row: 9, col:7, request:['melee','knife']},
'grenade1':{row: 9, col:6, request:['throwable','grenade']},
'flash1':{row: 9, col:5, request:['throwable','flash']},
'smoke1':{row: 9, col:4, request:['throwable','smoke']},
'flares1':{row: 9, col:3, request:['flare','random']},
'flares2':{row: 9, col:2, request:['flare','random']},
'flares3':{row: 9, col:1, request:['flare','random']},
'flares4':{row: 9, col:0, request:['flare','random']},
'car1':{row: 8, col:3, request:['vehicle','car']},
    } 
  
    // AUTO DROPPER - GENERATE ITEMS / VEHICLES
    auto_dropper(TILESLOC_N_REQUEST)
    for (let i=0;i<2;i++){
      makeNdropItem('placeable', 'barrel' ,getCoordTilesCenter({row:8,col:7}),onground=true) 
    }
    for (let i=0;i<2;i++){
      makeNdropItem('placeable', 'mine' ,getCoordTilesCenter({row:8,col:8}),onground=true,variantNameGiven='Saharamine') 
    }

    // MAKE HOUSES
    for (let i=0;i<2;i++){
      makeHouse_2Tiles(getCoordTiles(TILESLOC_N_REQUEST[`house${i+1}`]))
    }

    for (let i=0;i<10;i++){
      one_tile_wall_horizontal({x: i*TILE_SIZE, y:TILE_SIZE })
    }


      
    // MAKE OBJECTS - walls on top to prevent enemy from comming



  }

 
  
}

function resetServer(){
  killAllPlayers()
  for (const entityid in backEndEnemies) {
    // safeDeleteEnemy(entityid)
    delete backEndEnemies[entityid]
  }
  for (const entityid in backEndProjectiles) {
    // safeDeleteProjectile(entityid)
    delete backEndProjectiles[entityid]
  }
  for (const entityid in backEndThrowables) {
    // safeDeleteProjectile(entityid)
    delete backEndThrowables[entityid]
  }
  for (const entityid in backEndVehicles) {
    // safeDeleteVehicle(entityid)
    delete backEndVehicles[entityid]
  }
  for (const entityid in backEndObjects) {
    // safeDeleteObject(entityid)
    delete backEndObjects[entityid]
  }
  for (const entityid in backEndItems) {
    // backEndItems[entityid].deleteRequest = true
    delete backEndItems[entityid]
  }
  backEndItems[0] = {
    itemtype: 'melee', groundx:0, groundy:0, size:{length:5, width:5}, name:'fist', color:'black', iteminfo:{ammo:'inf', ammotype:'bio'} ,onground:false, myID: 0, deleteRequest:false
  }
  for (const entityid in backEndAirstrikes) {
    safeDeleteAirstrike(entityid)
  }
  for (const entityid in backEndSoundRequest) {
    safeDeleteSoundRequest(entityid)
  }
  for (const entityid in backEndParticleRequest) {
    safeDeleteParticleRequest(entityid)
  }
  
  enemyId = 0
  projectileId = 0
  itemsId = 0 
  objectId = 0
  vehicleId = 0
  airstrikeId = 0
  soundID = 0

  resetMap(MAPNAME)
}


function Moveplayer(playerGIVEN, WW, AA, SS, DD){
    const vehicleID = playerGIVEN.ridingVehicleID
    if (vehicleID>0){ // if riding something
      let vehicleOfPlayer = backEndVehicles[vehicleID]
      const maxSpeedVehicle = vehicleOfPlayer.speed
      // playerGIVEN.speed = Math.min(maxSpeedVehicle, playerGIVEN.speed + 0.11)
      const v_x_prev  = vehicleOfPlayer.v_x
      const v_y_prev = vehicleOfPlayer.v_y
      if (WW){
        vehicleOfPlayer.v_y -= vehicleOfPlayer.acceleration
      }
      if (AA){
        vehicleOfPlayer.v_x -= vehicleOfPlayer.acceleration
      }
      if (SS){
        vehicleOfPlayer.v_y += vehicleOfPlayer.acceleration
      }
      if (DD){
        vehicleOfPlayer.v_x += vehicleOfPlayer.acceleration
      }
      // MAX speed bdry
      if (Math.abs(vehicleOfPlayer.v_y) > maxSpeedVehicle){
        vehicleOfPlayer.v_y = v_y_prev
      }

      if (Math.abs(vehicleOfPlayer.v_x) > maxSpeedVehicle){
        vehicleOfPlayer.v_x = v_x_prev
      }

      // console.log(playerGIVEN.speed )
      // if (vehicleOfPlayer.mytick > 30){ // only use a B2 sound since other sound is bad...
      //   // pushSoundRequest({x:playerGIVEN.x,y:playerGIVEN.y},`${vehicleOfPlayer.type}_moving`,TILE_SIZE*3, duration=1)
      //   pushSoundRequest({x:playerGIVEN.x,y:playerGIVEN.y},'B2_moving',TILE_SIZE*3, duration=1)
      //   vehicleOfPlayer.mytick = 0
      // }
      // vehicleOfPlayer.mytick += 1
      return
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

    playerGIVEN.x = Math.round(playerGIVEN.x)
    playerGIVEN.y = Math.round(playerGIVEN.y)
  }
  
function APIdeleteItem(curplayer,deleteflag, itemid,currentSlot){ // change player current holding item to fist
  curplayer.inventory[currentSlot-1] = backEndItems[0]
  backEndItems[itemid].deleteflag = deleteflag
}

async function main(){
    const {ground2D, decals2D} = await loadMap(MAPNAME);

    io.on("connect", (socket) => {
      socket.request=null; // save memory

        console.log("user connected",socket.id);
        // give server info to a frontend
        socket.emit('serverVars', {loadedMap:{ground:ground2D, decals: decals2D},MAPTILENUMBACKEND: MAPTILENUM, MAPNAMEBACKEND:MAPNAME, gunInfo, consumableInfo,SHOOTER_VEHICLES_BACKEND, lastWinnerName})

        // remove player when disconnected (F5 etc.)
        socket.on('disconnect',(reason) => {
            console.log(reason)
            safeDeletePlayer(socket.id)

        })

        // initialize game when clicking button (submit name)
        socket.on('initGame',({username,canvasHeight,canvasWidth,Myskin='default'})=>{
            // initialize inventory with fist
            let inventory =  new Array(INVENTORYSIZE).fill().map(() => (backEndItems[0])) // array points to references - fist can be shared for all players

            // default item for a player if exists
            for (let i=0;i<defaultGuns.length; i++){
              makeNdropItem('gun', defaultGuns[i], {x:0 ,y:0},onground=false)
              inventory[i] = backEndItems[itemsId]
            }


            let playerX = MAPWIDTH * Math.random() //0 //
            let playerY = MAPHEIGHT * Math.random() //MAPHEIGHT// 
            const playerColor =  'black'//`hsl(${Math.random()*360},100%,70%)`
            if (MAPDICT[MAPNAME].playerSpawn==='Random'){
              // pass
            }
            else{
              playerX = MAPDICT[MAPNAME].playerSpawn.x // TILE_SIZE*9
              playerY = MAPDICT[MAPNAME].playerSpawn.y // TILE_SIZE*9 
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
                flashed:false,
                on_water:false,
                healthboost:0,
                dash: 1,

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
            if (PICKABLE_GUNS.includes(thisGun.name)){
              if (thisGun.iteminfo.ammo>0){
                thisGun.iteminfo.ammo -= 1
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

        socket.on('dash',({angle})=>{
          let playerGIVEN = backEndPlayers[socket.id]
          if (!playerGIVEN){return}

          // if in the vehicle, no dash
          const vehicleID = playerGIVEN.ridingVehicleID
          if (vehicleID>0){ // if riding something
            return
          }

          playerGIVEN.x += Math.cos(angle)*DASH_DIST
          playerGIVEN.y += Math.sin(angle)*DASH_DIST
      
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
      
          playerGIVEN.x = Math.round(playerGIVEN.x)
          playerGIVEN.y = Math.round(playerGIVEN.y)
        // dash end
          playerGIVEN.dash -= 1

        })


          // eat
        socket.on('consume',({itemName,playerId,healamount,deleteflag, itemid,currentSlot}) => {
          let curplayer = backEndPlayers[playerId]
          if (!curplayer) {return}

          if (itemName === 'medkit'){
            curplayer.health = PLAYERHEALTHMAX
          } else if (itemName === 'adrenaline'){
            curplayer.healthboost = HEALTHBOOSTMAX  // max boost is 32
          } else if (itemName === 'drink'){
            curplayer.healthboost = Math.min(curplayer.healthboost + 16, HEALTHBOOSTMAX )
          }else if (curplayer.health + healamount <= PLAYERHEALTHMAX){ // bandage
            curplayer.health += healamount
          }
          APIdeleteItem(curplayer,deleteflag, itemid,currentSlot)
        })

        // place
        socket.on('place',({itemName,playerId,deleteflag, itemid,currentSlot,imgName}) => {
          let curplayer = backEndPlayers[playerId]
          if (!curplayer) {return}
          if (curplayer.onBoard){return} // cannot shoot if on board


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
            console.log("Not placeable item")
          }
          makeObjects(itemName, hitpoints, {center: {x:curplayer.x,y:curplayer.y}, radius: hitRadius, color:'gray',placerID:playerId}, givenname = imgName, placerID = playerId)

          APIdeleteItem(curplayer,deleteflag, itemid,currentSlot)
        })
        
       
        // throw
        socket.on('throw',({itemName,playerId,deleteflag, itemid,currentSlot,angle,holding}) => {
          let curplayer = backEndPlayers[playerId]
          if (!curplayer) {return}
          if (curplayer.onBoard){return} // cannot shoot if on board

          addThrowable(angle, socket.id, backEndPlayers[socket.id],type= itemName,holding)
          APIdeleteItem(curplayer,deleteflag, itemid,currentSlot)
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
  if (signalReset) {
    resetServer()
    signalReset = false
    GLOBALCLOCK = 0
    ServerTime = 0
    io.emit('resetServer',{lastWinnerName})
    const socketById = io.sockets.sockets.get(lastWinnerID);
    if (socketById){
      socketById.emit("winnerMessage")
    }
  }

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
    "\nThrowables    ",Object.keys(backEndThrowables).length,
    "\nItems         ",Object.keys(backEndItems).length,
    "\nVehicles      ",Object.keys(backEndVehicles).length,
    "\nObjects       ",Object.keys(backEndObjects).length,
    "\nAirstrikes    ",Object.keys(backEndAirstrikes).length,
    "\nSoundRequests ",Object.keys(backEndSoundRequest).length,
    "\nParticleRequests ",Object.keys(backEndParticleRequest).length )
    ServerTime += 1
  }

  refreshKillLog()
  // red zone?
  // if ((USERCOUNT[0]>0) && strike){
  //   strike = false
  //   spawnAirstrike({x:MAPWIDTH/2,y:256},0, signalColor='red')
  // }

  // update players - speed info
  for (const id in backEndPlayers){
    let playerGET = backEndPlayers[id]
    const VID = playerGET.ridingVehicleID

    
    // check health boost
    if (playerGET.healthboost > 0 && GLOBALCLOCK%720===0 ){
      playerGET.healthboost -= 1
      playerGET.health = Math.min(playerGET.health+0.2, PLAYERHEALTH) // capacity upto max health
    }
    

    if (playerGET.onBoard){
      const planeLocation = backEndAirstrikes[playerGET.strikeID]
      playerGET.x = Math.round(planeLocation.x)
      playerGET.y = Math.round(planeLocation.y)      
    } 
    //////////// WATER CHECKING /////////
    else if (MAPNAME==='MilitaryBase'  && waterCheck(playerGET) && VID>0){//entering water with vehicle
      if (!FLYING_VEHICLES.includes(backEndVehicles[VID].type)){
        // getoff vehicle!
        getOffVehicle(id,VID)
        // playerGET.speed = PLAYERSPEED_ONWATER
        waterLogVehicle(VID)
        
      }
      playerGET.on_water = true
    } else if (MAPNAME==='MilitaryBase' && !playerGET.on_water && waterCheck(playerGET) && !(VID>0)){//entering water without vehicle
      // playerGET.speed = PLAYERSPEED_ONWATER
      playerGET.on_water = true

    } else if (MAPNAME==='MilitaryBase' && playerGET.on_water && !waterCheck(playerGET)){// escaping water
      // playerGET.speed = PLAYERSPEED
      playerGET.on_water = false

    }
    else { 
      if (playerGET.on_water){
        playerGET.speed = PLAYERSPEED_ONWATER
      }else{
        playerGET.speed = PLAYERSPEED
      }
      ////////////// WATER CHECKING //////////
      Moveplayer(playerGET, false, false, false, false)
    }
    // playerGET.x = Math.round(playerGET.x)
    // playerGET.y = Math.round(playerGET.y)

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
    if (projGET.travelDistance <= 0 || myspeed<=1){
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
              let whoshotProj = backEndPlayers[projGET.playerId]
              if (whoshotProj){ // safe
                whoshotProj.score ++
                updateKillLog(whoshotProj.username,backEndPlayer.username,reason = projGET.gunName)
                updateGunBasedOnScore(projGET.playerId)
              }else{ // server kill - explosion (fragments)
                updateKillLog(0,backEndPlayer.username,reason = 'explosion',serverkill= true)
              }
 
              safeDeletePlayer(playerId)} 
          }
          // add blood particle
          if (SHOWBLOODPARTICLE){
            pushParticleRequest(projGET.x, projGET.y, 'blood', 0,duration=1)
          }
          // delete projectile after inspecting who shot the projectile & calculating damage
          if (!PENETRATION_GUNS.includes(projGET.gunName)){
            BULLETDELETED = true
            safeDeleteProjectile(id)
            break // only one player can get hit by a projectile
          }


          
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
                updateGunBasedOnScore(projGET.playerId)
              }
              safeDeleteEnemy(enemyId)} 
        }
        if (SHOWBLOODPARTICLE){
          pushParticleRequest(projGET.x, projGET.y, 'blood', 0,duration=1)
        }
        // delete projectile after inspecting who shot the projectile & calculating damage
        if (!PENETRATION_GUNS.includes(projGET.gunName)){
          BULLETDELETED = true
          safeDeleteProjectile(id)
          break // only one enemy can get hit by a projectile
        }
        
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

  
  // update throwables 
  for (const id in backEndThrowables){
    // let THROWABLEDELETED = false
    let throwGET = backEndThrowables[id]
    const PROJECTILERADIUS = throwGET.radius
    // let myspeed = throwGET.speed

    throwGET.velocity.x *= HIGHFRICTION
    throwGET.velocity.y *= HIGHFRICTION
    throwGET.speed *= HIGHFRICTION
    throwGET.x += throwGET.velocity.x
    throwGET.y += throwGET.velocity.y

    throwGET.travelDistance -= throwGET.speed
    // travel distance check for projectiles
    if (throwGET.travelDistance <= 0 || throwGET.speed<=0.1){
      // console.log(throwGET.travelDistance,myspeed)
      // THROWABLEDELETED = true
      safeDeleteThrowable(id)
      continue
    } else if (throwGET.x - PROJECTILERADIUS >= MAPWIDTH ||
        throwGET.x + PROJECTILERADIUS <= 0 ||
        throwGET.y - PROJECTILERADIUS >= MAPHEIGHT ||
        throwGET.y + PROJECTILERADIUS <= 0 
      ) {
      // boundary check for projectiles
      // THROWABLEDELETED = true
      safeDeleteThrowable(id)
      continue
    }

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
      updateVehiclePos(vehicle)
    }
  }

  // update enemies
  for (const id in backEndEnemies){
    let enemy = backEndEnemies[id]
    const enemyRad = enemy.radius

    if (enemy.homing){ 
      const targetplayer = backEndPlayers[enemy.homingTargetId]
      if (targetplayer){// initial target still exists
        const x_dist = targetplayer.x - enemy.x
        const y_dist = targetplayer.y - enemy.y

        const angle = Math.atan2(
          y_dist,
          x_dist
        )

        let normal_move = 0
        if (ENEMYORBITDIST > Math.hypot(x_dist,y_dist)){
          normal_move = enemy.speed
          if (Math.random()>enemy.bias){
            normal_move *= -1
          }
        }

        const cos =  Math.cos(angle)
        const sin =  Math.sin(angle)

        // auxiliary movement
        enemy.x += enemy.speed * cos + normal_move*sin
        enemy.y += enemy.speed * sin - normal_move*cos
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
          const armoredDamage = armorEffect(backEndPlayer.wearingarmorID, enemy.health) //enemy.damage
          backEndPlayer.health -= armoredDamage
          if (backEndPlayer.health <= 0){ //check alive
            updateKillLog(0,backEndPlayer.username,reason = 'zombie',serverkill= true)
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

  for (const id in backEndParticleRequest){
    updateParticleRequest(id)
  }

  io.emit('updateFrontEnd',{backEndPlayers, backEndEnemies, backEndProjectiles, backEndObjects, backEndItems,backEndVehicles,backEndAirstrikes,backEndSoundRequest, backEndParticleRequest, backEndKillLog,backEndThrowables})
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
    }else if(name==='Lynx'){
      ammo = 5
    }else if(name==='tankBuster'){
      ammo = 1
    }else if(name==='grenadeLauncher'){
      ammo = 6
    }else if(name==='MG3'){
      ammo = 200
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
  } else if(itemtype==='throwable'){
    const throwableinfoGET = throwableInfo[name]
    size = throwableinfoGET.size
    color = throwableinfoGET.color // default drawing color if no image
    iteminfo = {} 
  } else{
    console.log("invalid itemtype requested in makeNdropItem")
    return -1
  }

  backEndItems[itemsId] = {
    itemtype, name, groundx, groundy, size, color, iteminfo, onground, myID: itemsId, deleteRequest:false
  }
  itemBorderUpdate(backEndItems[itemsId])

  return itemsId // in case needed
}



// safely create object
function makeObjects(objecttype, health, objectinfo, givenname = '', placerID = 0){
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
    objecttype , myID:objectId, deleteRequest:false, health, objectinfo, objectsideforbackend, name, placerID
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
  // makeObjects("wall", 30, {orientation: 'vertical',start:{x:location.x+WALLWIDTH_HALF,y:location.y+DOORLEN}, end:{x:location.x+WALLWIDTH_HALF,y:location.y+HOUSEHEIGHT}, width:WALLWIDTH, color: 'gray'})
  
  one_tile_wall_vertical({x:location.x+HOUSEWIDTH , y: location.y})

  for (let i=0;i<2;i++){
    for (let j=0;j<2;j++){
      one_tile_wall_horizontal({x: location.x+TILE_SIZE*j , y: location.y+ HOUSEHEIGHT*i})
    }
  }

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


function makeBridge(location){ // location given is top left
  // adjust to have location to top left tile
  const x = location.x
  const y = location.y
  const wall_length = 12
  for (let i=0;i<2;i++){
    for (let j=0;j<wall_length;j++){
      one_tile_wall_vertical({x: x+i*3*TILE_SIZE , y: y+TILE_SIZE*j})
    }
  }
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

function makeHouse_CommandCenter(location){ // location given is
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

function makeHouse_Barracks(location){ // location given is
}

function makeHouse_MedicCenter(location){ // location given is
}

function makeHouse_Tanks(location){ // location given is
}

function makeHouse_Armory(location){ // location given is
}

function makeHouse_Guarage(location){ // location given is
}

function makeHouse_Cargo(location){ // location given is
}

function makeHouse_Hangar(location){ // location given is
}


function safeDeleteObject(id){
  //console.log(`obj removed ID: ${id}`)
  const objToDelete = backEndObjects[id]
  if (objToDelete.objecttype==='barrel'){
    explosion(objToDelete.objectinfo.center,18,playerID=objToDelete.placerID)
  } else if(objToDelete.objecttype==='mine'){
    explosion(objToDelete.objectinfo.center,12,playerID=objToDelete.placerID,shockWave=true)
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


  if (entity.entityType==="vehicle" ){
    // for (const id in backEndVehicles){
    //   const obj = backEndVehicles[id]
  
    //   if (entity.myID === id){
    //     continue 
    //   }
      
    //   const radiusSum2 = obj.radius + entity.radius - VehicleTolerance
    //   const xDist = entity.x - obj.x
    //   const yDist = entity.y - obj.y 
    //   const Dist = Math.hypot(xDist,yDist)

    //   if (Dist < radiusSum2){
    //     const angle2 = Math.atan2(
    //       yDist,
    //       xDist
    //     )
    //     entity.x = obj.x + Math.cos(angle2) * radiusSum2
    //     entity.y = obj.y + Math.sin(angle2) * radiusSum2
    //   }
    // }
    return
  }

  //vehicle hitbox check
  for (const id in backEndVehicles){
    const obj = backEndVehicles[id]

    if (entity.entityType=== "player" && entity.ridingVehicleID === id){
      continue 
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


function throwable_reflection_with_Objects(entity){
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
            entity.velocity.x = -entity.velocity.x
          }
          if (objSides.centerx >= entity.x && entitySides.right > objSides.left){ // restore position for backend
            entity.velocity.x = -entity.velocity.x
          }
        } 

        //TB check (verti)
        if (objSides.left < entity.x && entity.x < objSides.right){
          if (objSides.centery < entity.y && entitySides.top < objSides.bottom){ // restore position for backend
            entity.velocity.y = -entity.velocity.y
          }
          if (objSides.centery >= entity.y && entitySides.bottom > objSides.top){ // restore position for backend
            entity.velocity.y = -entity.velocity.y
          }
        }
      }
    } 
    
    // if(obj.objecttype === 'hut' || obj.objecttype === 'barrel'){
    //   const objinfoGET = obj.objectinfo
    //   const radiusSum = objinfoGET.radius + entity.radius
    //   const xDist = entity.x - objinfoGET.center.x
    //   const yDist = entity.y - objinfoGET.center.y 
    //   const Dist = Math.hypot(xDist,yDist)

    //   if (Dist < radiusSum){
    //     const angle = Math.atan2(
    //       yDist,
    //       xDist
    //     )
    //     entity.x = objinfoGET.center.x + Math.cos(angle) * radiusSum
    //     entity.y = objinfoGET.center.y + Math.sin(angle) * radiusSum
    //   }
    // }
  }
  // vehicle hitbox check
  // for (const id in backEndVehicles){
  //   const obj = backEndVehicles[id]

  //   const radiusSum = obj.radius + entity.radius - VehicleTolerance
  //   const xDist = entity.x - obj.x
  //   const yDist = entity.y - obj.y 
  //   const Dist = Math.hypot(xDist,yDist)

  //   if (Dist < radiusSum){
  //     const angle = Math.atan2(
  //       yDist,
  //       xDist
  //     )
  //     entity.x = obj.x + Math.cos(angle) * radiusSum
  //     entity.y = obj.y + Math.sin(angle) * radiusSum
  //   }

  // }

}



const spawn_locations = MAPDICT[MAPNAME].enemySpawn
const num_spawn_loc = spawn_locations.length-1

function spawnEnemies(){
  enemyId++
  ENEMYCOUNT ++
  const factor = Math.round((1 +  Math.random())*10)/10 // 1~2
  const radius = 12 + Math.round(factor*4) // 16~20
  const speed = DIFFICULTY+2.5 - factor // DIFFICULTY+0.5~1.5

  const loc = spawn_locations[Math.round(Math.random()* (num_spawn_loc))]
  let x = loc.x
  let y = loc.y

  // if (Math.random() < 0.5) {
  //     x = Math.random() < 0.5 ? 0 - radius : MAPWIDTH + radius
  //     y = Math.random() * MAPHEIGHT
  // }else{
  //     x = Math.random() * MAPWIDTH
  //     y = Math.random() < 0.5 ? 0 - radius : MAPHEIGHT + radius
  // }


  // all enemies are homing
  let homing = true
  let homingTargetId = -1
  //let colorfactor = 100 + Math.round(factor*40)

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

  // back ticks: ~ type this without shift!

  const color = "CadetBlue" //`hsl(${colorfactor},50%,50%)` // [0~360, saturation %, lightness %]
  const angle = Math.atan2(MAPHEIGHT/2 - y, MAPWIDTH/2 - x)
  const velocity = {
      x: Math.cos(angle)*speed,
      y: Math.sin(angle)*speed
  }

  const damage = 1
  const myID = enemyId
  const health = 5 + DIFFICULTY + factor*2 // 5 + D + 2~4 
  const wearingarmorID = -1 //none

  let bias = 0.3 - (Math.round(Math.random()*10)/40)
  if (Math.random()>0.5){
    bias = 1-bias 
  }

  // (new Enemy({ex, ey, eradius, ecolor, evelocity}))
  backEndEnemies[enemyId] = {
    x,y,radius,velocity, myID, color, damage, health, homing, homingTargetId, speed, wearingarmorID, entityType: 'enemy',bias
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
  let health = 30
  let speed = 6 // for a car
  let acceleration = 0.12
  let info = {}
  //let travelDistance = TILE_SIZE*100 // fuel etc ?

  if (type==='car'){
    // do nothing
  } else if(type==='Fennek'){
    radius = 32
    color = "Olive"
    warningcolor = "IndianRed"
    damage = 10 // bump into damage
    health = 90
    speed = 4 
    acceleration = 0.08
  } else if(type==='APC'){ // with turrets!
    radius = 30
    color = "OliveDrab"
    warningcolor = "Chocolate"
    damage = 5 // bump into damage
    health = 60
    speed = 3
    acceleration = 0.1
    info = {turretName:"FAMAS"}
  } else if(type==='tank'){ // with turrets!
    radius = 45
    color = "Olive"
    warningcolor = "IndianRed"
    damage = 10 // bump into damage
    health = 192
    speed = 1 
    acceleration = 0.05
    info = {turretName:"grenadeLauncher"}
  } else if(type==='turret'){ // with turrets! - no sound effect
    radius = 52
    color = "WhiteSmoke"
    warningcolor = "IndianRed"
    damage = 0 // bump into damage
    health = 148
    speed = 0
    acceleration = 0
    info = {turretName:"M249"}
  } else if(type==='raptor'){ // with turrets!
    radius = 26
    color = "PaleTurquoise"
    warningcolor = "SteelBlue"
    damage = 10 // bump into damage
    health = 40
    speed = 12 // max speed
    acceleration = 0.18
    info = {turretName:"ak47"}
  } else if(type==='B2'){ // with turrets!
    radius = 28
    color = "Silver"
    warningcolor = "PeachPuff"
    damage = 10 // bump into damage
    health = 50
    speed = 10 
    acceleration = 0.14
    info = {turretName:"tankBuster"} // becareful not to shoot itself!
  }


  backEndVehicles[vehicleId] = {
    x,y,radius,v_x:0, v_y:0, acceleration,deceleration:acceleration/2, myID:vehicleId, color, warningcolor, damage, health, speed, type,entityType:'vehicle',occupied:false,ridingPlayerID:-1,info, mytick:0
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

function waterLogVehicle(vehicleID){ // when on water, vehicle may never be used again
  backEndVehicles[vehicleID].occupied = true
  backEndVehicles[vehicleID].ridingPlayerID = -1
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

const vehicle_speed_tolerance = 0.01
function updateVehiclePos(vehicle){
  const riderID = vehicle.ridingPlayerID
  const rider = backEndPlayers[riderID]

  if (vehicle.v_x**2 + vehicle.v_y**2 === 0){ // 0 velocity then do nothing
    return 
  }

  vehicle.x = Math.round(vehicle.x + vehicle.v_x)
  vehicle.y = Math.round(vehicle.y + vehicle.v_y)

  // decelerate 
  vehicle.v_x = (vehicle.v_x>0) ? vehicle.v_x - vehicle.deceleration : vehicle.v_x + vehicle.deceleration
  vehicle.v_y = (vehicle.v_y>0) ? vehicle.v_y - vehicle.deceleration : vehicle.v_y + vehicle.deceleration

  if (Math.abs(vehicle.v_x) < vehicle_speed_tolerance){
    vehicle.v_x = 0
  }
  if (Math.abs(vehicle.v_y) < vehicle_speed_tolerance){
    vehicle.v_y = 0
  }


  // collision check
  // check boundary with objects also
  borderCheckWithObjects(vehicle)
      
  const Sides = {
    left: vehicle.x - vehicle.radius,
    right: vehicle.x + vehicle.radius,
    top: vehicle.y - vehicle.radius,
    bottom: vehicle.y + vehicle.radius
  }

  // MAP BORDER CHECK
  if (Sides.left<0){ // restore position for backend
    vehicle.x = vehicle.radius
  }
  if (Sides.right>MAPWIDTH){ // restore position for backend
    vehicle.x = MAPWIDTH - vehicle.radius
  }
  if (Sides.top<0){ // restore position for backend
    vehicle.y = vehicle.radius
  }
  if (Sides.bottom>MAPHEIGHT){ // restore position for backend
    vehicle.y = MAPHEIGHT - vehicle.radius
  }

  if (rider){ // rider exist
    rider.x = vehicle.x 
    rider.y = vehicle.y 
  }

}

function explosion(location,BLASTNUM,playerID=0,shockWave=false,small=false){
  for (let i=0;i< BLASTNUM;i++){
    if (shockWave){
      addProjectile( (2*Math.PI/BLASTNUM)*i,'shockWave',playerID, location,0)// damaging all players nearby
    } else if (small) {
      addProjectile( (2*Math.PI/BLASTNUM)*i,'explosion',playerID, location,0)// damaging all players nearby
    } else{
      addProjectile( (2*Math.PI/BLASTNUM)*i,'fragment',playerID, location,0)// damaging all players nearby
    }
  }
  pushSoundRequest(location,'explosion',TILE_SIZE*8, duration=1)
}



// 
const AIRSTRIKE_TYPE_DICT = {'red':'bomb','green':'supply','white':'transport', 'yellow':'vehicle request', 'purple':'cover'} 
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
    speed = 8 // fly fast and bomb (near speed as B2)
    strikeNumber = 16
    strike_Y_level = Math.round(location.y + (strikeNumber/2)*speed*STRIKE_INTERVAL_COEF)
  } else if(signal==='transport'){
    speed = 7
  }else if(signal==='cover'){
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
const AirstrikeGuns = ['Lynx','grenadeLauncher','MG3'] //'tankBuster',
function DeployAirstrike(airstrike){

  if (airstrike.signal==='bomb'){ // strike multiple times
    const x_turbulance = Math.round((Math.random()-0.5) * 100)+100
    for (let i=-1;i<2;i+=2){
      explosion({x:airstrike.x + i*x_turbulance, y:airstrike.y},18,playerID=airstrike.callerID,shockWave=true)
    }
    airstrike.strike_Y_level -= airstrike.speed*STRIKE_INTERVAL_COEF
    //console.log('air bombing at ', location)

  } else if(airstrike.signal==='supply'){ // strike once

    const idxGUN = Math.round(Math.random()*(AirstrikeGuns.length-1)) 
    // makeNdropItem('consumable', 'medkit', {x:airstrike.x + 100, y:airstrike.y})
    makeNdropItem('gun', AirstrikeGuns[idxGUN], {x:airstrike.x, y:airstrike.y} )
    makeNdropItem('scope', "2" ,{x:airstrike.x - 100, y:airstrike.y})
    makeNdropItem('armor', 'turtle', {x:airstrike.x + 100, y:airstrike.y})

    pushSoundRequest({x:airstrike.x,y:airstrike.y},'item_landing',TILE_SIZE*3, duration=1)

  } else if(airstrike.signal==='vehicle request'){
    spawnVehicle({x:airstrike.x, y:airstrike.y},'Fennek')

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
  }else if(airstrike.signal==='cover'){ 
    makeObjects("wall", 120, {orientation: 'vertical',start:{x:airstrike.x,y:airstrike.y-100}, end:{x:airstrike.x,y:airstrike.y+100}, width:20, color: 'gray'})
    makeObjects("wall", 120, {orientation: 'horizontal',start:{x:airstrike.x-100,y:airstrike.y}, end:{x:airstrike.x+100,y:airstrike.y}, width:20, color: 'gray'})
    
    pushSoundRequest({x:airstrike.x,y:airstrike.y},'item_landing',TILE_SIZE*6, duration=1)
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


function pushParticleRequest(x,y,particleName, velocity, duration=1){
  ParticleRequestID++
  backEndParticleRequest[ParticleRequestID] = {
    x,y, myID:ParticleRequestID,particleName, velocity, duration
  }
}

function updateParticleRequest(particleRequestID){
  let particleObject = backEndParticleRequest[particleRequestID]
  if (particleObject.duration<=0){
    safeDeleteParticleRequest(particleRequestID)
  } 
  particleObject.duration -= 1
}

function safeDeleteParticleRequest(particleRequestID){
  delete backEndParticleRequest[particleRequestID]
}
