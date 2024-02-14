// frontend constants
const TICKRATE = 15
const SCREENWIDTH = 1024
const SCREENHEIGHT = 576
const ITEMRADIUS = 24
const PROJECTILERADIUS = 3

// map info
let groundMap = [[]];
let decalMap = [[]];
const TILES_IN_ROW = 23;
const TILE_SIZE_HALF = 64;
const TILE_SIZE = TILE_SIZE_HALF*2 //128;
let MAPTILENUM // can vary get from the server
let MAPNAME // get from the server
let WALLCOLOR = 'gray' // default

//'PowderBlue' // glass color
let SHOOTER_VEHICLES

let MAPWIDTH 
let MAPHEIGHT

let cursorX = 0
let cursorY = 0

const frontEndPlayers = {} 
const frontEndProjectiles = {} 
const frontEndItems = {}
const frontEndEnemies = {}
const frontEndObjects = {}
const frontEndVehicles = {}
const frontEndAirstrikes = {}
const frontEndSoundRequest = {}

// player info 
let Myskin = 'default'
let frontEndPlayer
let listen = true // very important for event listener 
const AIRSTRIKEDIST_ADDITIONAL = 8 // additional distance to see the airdrop (+3 is just enough to see it)


const PLAYERRADIUS = 16 
// semaphores
let fireTimeout
let reloadTimeout
let interactTimeout
const INTERACTTIME = 300
const ITEM_THAT_TAKESUP_INVENTORY = ['gun', 'consumable', 'melee' , 'placeable']

const LobbyBGM = new Audio("/sound/Lobby.mp3")
const shothitsound = new Audio("/sound/shothit.mp3")
const playerdeathsound = new Audio("/sound/playerdeath.mp3")
const interactSound = new Audio("/sound/interact.mp3")


const mapImage = new Image();
mapImage.src = "/tiles1.png"

const planeImage = new Image();
planeImage.src = "/images/plane.png"

const planeImageMINIMAP = new Image();
planeImageMINIMAP.src = "/images/plane_minimap.png"



let skinImages = {}
const skinKeys = ['default','HALO','VOID','FROST','TAEGEUK','GRADIENT','CANDY','JAVA','PYTHON','LINUX']
for (let i=0;i<skinKeys.length;i++){
  const skinKey = skinKeys[i]
  skinImages[skinKey] = new Image()
  skinImages[skinKey].src = `/playerSkins/${skinKey}.png`
}

let myPCSkin = skinImages["default"] // default


// with frame
let minimapImage = new Image();

const MINIMAPFRAMESIZE = 550
const MINIMAPFRAMESIZE_HALF = 275
const MINIMAPSIZE = 512
const MINIMAPSIZE_HALF = 256


// resolution upgrade - retina display gives value 2
//const devicePixelRatio = window.devicePixelRatio || 1 //defaut 1

// function resizeIt(){
//   window.resizeTo(640,640)
// }
// window.on_load = resizeIt
// window.onresize = resizeIt

const canvasEl = document.getElementById('canvas');
canvasEl.width = window.innerWidth//SCREENWIDTH* devicePixelRatio//window.innerWidth* devicePixelRatio
canvasEl.height = window.innerHeight//SCREENHEIGHT* devicePixelRatio//window.innerHeight* devicePixelRatio
const canvas = canvasEl.getContext("2d");
//canvas.scale(devicePixelRatio,devicePixelRatio) 

const pointEl = document.querySelector('#pointEl')


// get socket
const socket = io()//io(`ws://localhost:5000`);

socket.on('connect', ()=>{
    console.log("connected!");
})

socket.on('map', ({loadedMap,MAPTILENUMBACKEND,MAPNAMEBACKEND})=>{
    groundMap = loadedMap.ground;
    decalMap = loadedMap.decals;

    MAPTILENUM = MAPTILENUMBACKEND
    MAPNAME = MAPNAMEBACKEND
    MAPWIDTH = TILE_SIZE*MAPTILENUM
    MAPHEIGHT =TILE_SIZE*MAPTILENUM

    // set minimap
    minimapImage.src = `/minimap_${MAPNAME}.png`

    // set wall color
    if (MAPNAME==='Sahara'){
      WALLCOLOR = 'Wheat'//'DarkGoldenRod' //'BurlyWood'//'DarkGoldenRod' //'Peru'
    }

})


// initialize server variables
let gunInfoFrontEnd = {}
let gunInfoKeysFrontEnd = []

let frontEndGunSounds = {}
let frontEndGunReloadSounds = {}
let itemImages = {}

let frontEndConsumableSounds = {}
let consumableInfoKeysFrontEnd = []

socket.on('serverVars',( {gunInfo, consumableInfo, SHOOTER_VEHICLES_BACKEND})=>{
    SHOOTER_VEHICLES = SHOOTER_VEHICLES_BACKEND

    // gun infos
    gunInfoKeysFrontEnd = Object.keys(gunInfo)
    for (let i=0;i<gunInfoKeysFrontEnd.length;i++){
      const gunkey = gunInfoKeysFrontEnd[i]
      gunInfoFrontEnd[gunkey] = gunInfo[gunkey]
  
      // load sounds
      frontEndGunSounds[gunkey] =  new Audio(`/sound/${gunkey}.mp3`)
      if (gunkey !== 'fist' && gunkey !== 'knife' && gunkey !== 'bat'){ // these three dont have reload sounds
        frontEndGunReloadSounds[gunkey] = new Audio(`/reloadSound/${gunkey}.mp3`)
      }

      // load images
      itemImages[gunkey] = new Image()
      itemImages[gunkey].src = `/images/${gunkey}.png`

    }
  
    // consumable infos
    consumableInfoKeysFrontEnd = Object.keys(consumableInfo)
    for (let i=0;i<consumableInfoKeysFrontEnd.length;i++){
      const conskey = consumableInfoKeysFrontEnd[i]
      gunInfoFrontEnd[conskey] = consumableInfo[conskey]
  
      // load sounds
      frontEndConsumableSounds[conskey] =  new Audio(`/consumeSound/${conskey}.mp3`)

      // load images
      itemImages[conskey] = new Image()
      itemImages[conskey].src = `/images/${conskey}.png`

    }

  
    console.log("front end got the variables from the server")
  })

  
const keys = {
    w:{
      pressed: false
    },
    a:{
      pressed: false
    },
    s:{
      pressed: false
    },
    d:{
      pressed: false
    },
    digit1:{ // weapon slot 1
      pressed: false
    },
    digit2:{ // weapon slot 1
      pressed: false
    },
    digit3:{ // fist slot
      pressed: false
    },
    digit4:{ // medkit slot
      pressed: false
    },
    f:{ // interact - grab/change items of current slot etc
      pressed: false
    },
    space:{ // hold fire
      pressed: false
    },
    g:{ // minimap
      pressed: false
    },
    r:{ // reload
      pressed: false
    },
    q:{ // drop
      pressed: false
    },
}


window.addEventListener('keydown', (event) => {
if (!frontEndPlayers[socket.id]) return // if player does not exist
switch(event.code) {
    case 'KeyW':
    case 'ArrowUp':
    keys.w.pressed = true
    break
    case 'KeyA':
    case 'ArrowLeft':
    keys.a.pressed = true
    break
    case 'KeyS':
    case 'ArrowDown':
    keys.s.pressed = true
    break
    case 'KeyD':
    case 'ArrowRight':
    keys.d.pressed = true
    break
    case 'Digit1':
    keys.digit1.pressed = true
    break
    case 'Digit2':
    keys.digit2.pressed = true
    break
    case 'Digit3':
    keys.digit3.pressed = true
    break
    case 'Digit4':
    keys.digit4.pressed = true
    break
    case 'KeyF':
    keys.f.pressed = true
    break
    case 'Space':
    keys.space.pressed = true
    break
    case 'KeyG':
    keys.g.pressed = true
    break
    case 'KeyR':
    keys.r.pressed = true
    break
    case 'KeyQ':
      keys.q.pressed = true
    break
}
})

window.addEventListener('keyup',(event)=>{
if (!frontEndPlayers[socket.id]) return // if player does not exist
switch(event.code) {
    case 'KeyW':
    case 'ArrowUp':
    keys.w.pressed = false
    break
    case 'KeyA':
    case 'ArrowLeft':
    keys.a.pressed = false
    break
    case 'KeyS':
    case 'ArrowDown':
    keys.s.pressed = false
    break
    case 'KeyD':
    case 'ArrowRight':
    keys.d.pressed = false
    break
    case 'Digit1':
    keys.digit1.pressed = false
    break
    case 'Digit2':
    keys.digit2.pressed = false
    break
    case 'Digit3':
    keys.digit3.pressed = false
    break
    case 'Digit4':
    keys.digit4.pressed = false
    break
    case 'KeyF':
    keys.f.pressed = false
    break
    case 'Space':
    keys.space.pressed = false
    break
    case 'KeyG':
    keys.g.pressed = false
    break
    case 'KeyR':
    keys.r.pressed = false
    break
    case 'KeyQ':
      keys.q.pressed = false
    break
}
})

addEventListener('mousemove', (event) => {
    cursorX = (event.clientX)
    cursorY = (event.clientY)
})

function getAngle(event){
  const angle = Math.atan2(event.clientY - canvasEl.height/2, event.clientX - canvasEl.width/2)
  return angle
}
function getCurItem(currentPlayer){
  let inventoryPointer = currentPlayer.currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  let currentHoldingItemId = currentPlayer.inventory[inventoryPointer] // if it is 0, it is fist
  let currentHoldingItem = frontEndItems[currentHoldingItemId]
  return currentHoldingItem
}


function shootCheck(event,holding = false){
  if (!gunInfoFrontEnd){ // if gun info is undefined, do not fire bullet
    return
  }
  if (!frontEndPlayer){return}


  // get currently holding item
  let inventoryPointer = frontEndPlayer.currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  let currentHoldingItemId = frontEndPlayer.inventory[inventoryPointer] // if it is 0, it is fist
  let currentHoldingItem = frontEndItems[currentHoldingItemId]

  if (!currentHoldingItem) {return} // undefined case

  if ((currentHoldingItem.itemtype==='consumable')){ // eat
    // dont need to check amount since we will delete item if eaten
    const currentItemName = currentHoldingItem.name
    const CONSUMERATE = 1000

    if (!listen) {return} // not ready to eat
    listen = false // block
  
    const consumeSound = frontEndConsumableSounds[currentItemName]// new Audio(`/consumeSound/${currentItemName}.mp3`)
    consumeSound.play()

    fireTimeout = window.setTimeout(function(){ if (!frontEndPlayer) {clearTimeout(fireTimeout);return}; socket.emit('consume',{
      itemName: currentHoldingItem.name,
      playerId: socket.id,
      healamount: currentHoldingItem.healamount,
      deleteflag: true, // current version, delete right away
      itemid: currentHoldingItemId,
      currentSlot: frontEndPlayer.currentSlot,
    }) ;
      clearTimeout(fireTimeout);
      listen = true},CONSUMERATE)
    return
  } 



  ///////////////////////////// If inside a vehicle 
  const vehicleID = frontEndPlayer.ridingVehicleID
  if (vehicleID>0){ // if player is riding => cannot shoot!
    const vehicleType = frontEndVehicles[vehicleID].type
    if (SHOOTER_VEHICLES.includes(vehicleType)){
      const currentGunName = frontEndVehicles[vehicleID].turretName
      const guninfGET = gunInfoFrontEnd[currentGunName]
      const GUNFIRERATE = guninfGET.fireRate

      if (!listen) {return} // not ready to fire
      listen = false // block
    
      socket.emit("shoot", {angle:getAngle(event),currentGun:currentGunName, startDistance:frontEndVehicles[vehicleID].radius + guninfGET.projectileSpeed,holding})
    
      fireTimeout = window.setTimeout(function(){ if (!frontEndPlayer) {clearTimeout(fireTimeout);return};clearTimeout(fireTimeout);listen = true},GUNFIRERATE)
      return
    }else{
      return
    }
  } 
  ///////////////////////////// If inside vehicle 


  if ((currentHoldingItem.itemtype==='placeable')){ // place
    // dont need to check amount since we will delete item if eaten
    const currentItemName = currentHoldingItem.name
    const PLACERATE = 100

    if (!listen) {return} // not ready to eat
    listen = false // block

    interactSound.play()

    fireTimeout = window.setTimeout(function(){ if (!frontEndPlayer) {clearTimeout(fireTimeout);return}; socket.emit('place',{
      itemName: currentHoldingItem.name,
      playerId: socket.id,
      deleteflag: true, // current version, delete right away
      itemid: currentHoldingItemId,
      currentSlot: frontEndPlayer.currentSlot,
      imgName:currentHoldingItem.imgName,
    }) ;
      clearTimeout(fireTimeout);
      listen = true},PLACERATE)
    return
  }

  if ((!(currentHoldingItem.itemtype==='melee')) && currentHoldingItem.ammo <= 0){ // no ammo - unable to shoot
    reloadGun() // auto reload when out of ammo
    return
  }

  const currentGunName = currentHoldingItem.name
  const guninfGET = gunInfoFrontEnd[currentGunName]
  const GUNFIRERATE = guninfGET.fireRate
  
  if (!listen) {return} // not ready to fire
  listen = false // block

  socket.emit("shoot", {angle:getAngle(event),currentGun:currentGunName,currentHoldingItemId,holding})

  if (!(currentHoldingItem.itemtype==='melee')){ // not malee, i.e. gun!
    // decrease ammo here!!!!!
    currentHoldingItem.ammo -= 1 
    //console.log(`${currentGunName} ammo: ${currentHoldingItem.ammo}`)
  }

  //console.log("fired")
  fireTimeout = window.setTimeout(function(){ if (!frontEndPlayer) {clearTimeout(fireTimeout);return};clearTimeout(fireTimeout);listen = true},GUNFIRERATE)
  //console.log("ready to fire")
}


addEventListener('click', (event) => {
  shootCheck(event)

})


// periodically request backend server
setInterval(()=>{
  if (keys.f.pressed){
    socket.emit('keydown',{keycode:'KeyF'})
  }
  // dont have to emit since they are seen by me(a client, not others)
  if (keys.g.pressed){
    // not emitting when G
    //socket.emit('keydown',{keycode:'KeyG'})
  }

  if (listen) {
      if (keys.digit1.pressed){
          socket.emit('keydown',{keycode:'Digit1'})
      }
      if (keys.digit2.pressed){
          socket.emit('keydown',{keycode:'Digit2'})
      }
      if (keys.digit3.pressed){
          socket.emit('keydown',{keycode:'Digit3'})
      }
      if (keys.digit4.pressed){
          socket.emit('keydown',{keycode:'Digit4'})
      }

      if (keys.r.pressed){ // reload lock? click once please... dont spam click. It will slow your PC
          socket.emit('keydown',{keycode:'KeyR'})
      }
      if (keys.q.pressed){ //
        //socket.emit('keydown',{keycode:'KeyQ'})
        if (!frontEndPlayer){return}
        let inventoryPointer = frontEndPlayer.currentSlot - 1 // current slot is value between 1 to 4
        if (!inventoryPointer) {inventoryPointer = 0} // default 0
        const currentHoldingItemId = frontEndPlayer.inventory[inventoryPointer] // if it is 0, it is fist

        dropItem(currentHoldingItemId)
        socket.emit('updateitemrequest',{itemid:0, requesttype:'pickupinventory',currentSlot: frontEndPlayer.currentSlot,playerId:socket.id}) // update to fist
        frontEndPlayer.inventory[inventoryPointer] = 0 // front end should also be changed

    }
  }

  const Movement = keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed

  if (Movement && keys.space.pressed){ // always fire hold = true since space was pressed
  // update frequent keys at once (Movement & hold shoot)
      socket.emit('moveNshootUpdate', {WW: keys.w.pressed, AA: keys.a.pressed,SS: keys.s.pressed,DD: keys.d.pressed, x:cursorX, y:cursorY})
      shootCheck({clientX:cursorX, clientY:cursorY},true)
  } else if (Movement){
  // update frequent keys at once (Movement only)
      socket.emit('movingUpdate', {WW: keys.w.pressed, AA: keys.a.pressed, SS: keys.s.pressed, DD: keys.d.pressed, x:cursorX, y:cursorY})

  } else if(keys.space.pressed){ // always fire hold = true since space was pressed
      socket.emit('holdUpdate',{x:cursorX, y:cursorY})
      shootCheck({clientX:cursorX, clientY:cursorY},true)
  } else{ // builtin
      socket.emit('playermousechange', {x:cursorX,y:cursorY}) // report mouseposition every TICK, not immediately
  } 


},TICKRATE)


function reloadGun(){
  if (!gunInfoFrontEnd){ // if gun info is undefined, do not reload
    return
  }
  // reload only when player is created
  if (!frontEndPlayer){return}
  let currentHoldingItem = getCurItem(frontEndPlayer)

  //check currentHolding is a gun or not
  if (!(currentHoldingItem.itemtype==='gun')){ // not a gun, dont reload
    return
  }

  if (currentHoldingItem.ammo === currentHoldingItem.magSize){ // full ammo - unable to reload
    //console.log("ammo full!")
    return
  }

  const CHECKammotype = currentHoldingItem.ammotype

  const currentGunName = currentHoldingItem.name
  const GUNRELOADRATE = gunInfoFrontEnd[currentGunName].reloadTime

  if (currentGunName==='flareGun'){ // not reloadable
    //console.log("flaregun cannot be reloaded")
    return
  }


  //console.log("reload commit")
  if (!listen) {return} // not ready to reload
  listen = false // block
  //console.log("reloading!")

  let reloadSound = frontEndGunReloadSounds[currentGunName] //new Audio(`/reloadSound/${currentGunName}.mp3`)
  reloadSound.play()
  // reload ammo here!!!!!

  frontEndPlayer.reloading = true

  reloadTimeout = window.setTimeout(function(){
    //console.log(`${currentGunName} ammo: ${currentHoldingItem.ammo}`);
    clearTimeout(reloadTimeout); if (frontEndPlayer) {currentHoldingItem.restock(socket.id); frontEndPlayer.reloading = false; listen = true};
    }, GUNRELOADRATE)
  
}

// reload
socket.on('reload',()=>{
  reloadGun()
})


function dropItem(currentHoldingItemId){
  if (currentHoldingItemId===0){// fist - nothing to do
    return
  }

  // if (droppingItem.itemtype === 'gun'){
  //   // empty out the gun (retrieve the ammo back)
  //   // frontEndPlayer.getAmmo(curItemGET.ammotype,curItemGET.ammo)
  //   // reset ammo
  //   // curItemGET.ammo = 0
  // } else if(droppingItem.itemtype === 'consumable'){
  //   // nothing to do since consumables do not stack currently...
  // } else if(droppingItem.itemtype === 'melee'){
  //   //console.log("NOT IMPLEMENTED!")
  // }

  // change onground flag
  // update ground location
  socket.emit('updateitemrequestDROP',{itemid:currentHoldingItemId,
    requesttype:'dropitem',
    groundx:frontEndPlayer.x, 
    groundy:frontEndPlayer.y
  })

}


function interactVehicle(id,backEndVehicles){
  if (!listen) {return} // not ready to interact
  listen = false 



  let currentVehicle = backEndVehicles[id]
  if (frontEndPlayer.ridingVehicleID>0){ // already riding a vehicle
    interactSound.play()
    socket.emit('getOffVehicle',{vehicleID: id})
  }else{ // not riding a vehicle
    if (!currentVehicle.occupied){ // interact when you can get in
      interactSound.play()
      socket.emit('getOnVehicle',{vehicleID: id})
    }
  }

  interactTimeout = window.setTimeout(function(){
    clearTimeout(interactTimeout);
    if (frontEndPlayer){listen = true;    // reload when pick up
    }}, INTERACTTIME)

}


function interactItem(itemId,backEndItems){
  //console.log(frontEndPlayers[socket.id].inventory)
  // current slot item 
  //let frontEndPlayer = frontEndPlayers[socket.id]
  let inventoryPointer = frontEndPlayer.currentSlot - 1 // current slot is value between 1 to 4
  if (!inventoryPointer) {inventoryPointer = 0} // default 0
  
  let currentHoldingItemId = frontEndPlayer.inventory[inventoryPointer] // if it is 0, it is fist
  let currentHoldingItem = frontEndItems[currentHoldingItemId]

  //console.log("interact commit")
  if (!listen) {return} // not ready to interact
  listen = false 
  //console.log("interacting!")


  interactSound.play()

  // interact here!
  // make the item unpickable for other players => backenditem onground switch to false
  const pickingItem = backEndItems[itemId]

  if(ITEM_THAT_TAKESUP_INVENTORY.includes(pickingItem.itemtype) ){
    //console.log(`itemId: ${itemId} / inventorypointer: ${inventoryPointer}`)
    dropItem(currentHoldingItemId)
    socket.emit('updateitemrequest',{itemid:itemId, requesttype:'pickupinventory',currentSlot: frontEndPlayer.currentSlot,playerId:socket.id})
    frontEndPlayer.inventory[inventoryPointer] = itemId // front end should also be changed
  } else if (pickingItem.itemtype === 'armor'){
    //drop current armor - to be updated
    const currentwearingarmorID = frontEndPlayer.wearingarmorID
    //console.log(currentwearingarmorID)
    if (currentwearingarmorID > 0 ){
      // get item id and drop it
      socket.emit('updateitemrequestDROP',{itemid:currentwearingarmorID,
        requesttype:'dropitem',
        groundx:frontEndPlayer.x, 
        groundy:frontEndPlayer.y
      })
    }
    frontEndPlayer.wearingarmorID = itemId
    socket.emit('updateitemrequest',{itemid:itemId, requesttype:'weararmor',playerId:socket.id})

  } else if (pickingItem.itemtype === 'scope'){
    //drop current armor - to be updated
    const currentwearingscopeID = frontEndPlayer.wearingscopeID

    // IMPORTANT: Should check in-house again if scope is picked up inside the house!
    if (frontEndPlayer.getinhouse){
      frontEndPlayer.getinhouse = false // prediction
      socket.emit('houseLeave')
    }

    //console.log(currentwearingscopeID)
    if (currentwearingscopeID > 0 ){
      // get item id and drop it
      socket.emit('updateitemrequestDROP',{itemid:currentwearingscopeID,
        requesttype:'dropitem',
        groundx:frontEndPlayer.x, 
        groundy:frontEndPlayer.y
      })
    }
    frontEndPlayer.wearingscopeID = itemId
    // console.log(pickingItem.iteminfo.scopeDist)
    updateSightChunk(pickingItem.iteminfo.scopeDist) // change scope!
    socket.emit('updateitemrequest',{itemid:itemId, requesttype:'scopeChange',playerId:socket.id})
  }

  interactTimeout = window.setTimeout(function(){
    clearTimeout(interactTimeout);
    if (frontEndPlayer){listen = true;    // reload when pick up
    reloadGun()}}, INTERACTTIME)
}

// iteract
socket.on('interact',({backEndItems,backEndVehicles})=>{
    if (!frontEndPlayer){return}

    // manual takeoff
    if (frontEndPlayer.onBoard){
      // take off!
      socket.emit('takeOff')
      return
    }

    let foundOneFlag = false

    // client collision check - reduce server load
    for (const id in backEndVehicles){
      const vehicle = backEndVehicles[id]
      const DISTANCE = Math.hypot(vehicle.x - frontEndPlayer.x, vehicle.y - frontEndPlayer.y)
      if ((DISTANCE < vehicle.radius + frontEndPlayer.radius)) {
        interactVehicle(id,backEndVehicles)
        foundOneFlag = true
        break
      }
    }
    if (foundOneFlag){
      return
    }
    for (const id in backEndItems){
      // Among frontEndItems: pick the first item that satisfies the below conditions
      // only when item is near - collision check with player and item!
      // only when item is onground
      const item = backEndItems[id]
      // const itemSizeObj = item.size
      // let itemRadius = Math.max(itemSizeObj.length, itemSizeObj.width)
      const DISTANCE = Math.hypot(item.groundx - frontEndPlayer.x, item.groundy - frontEndPlayer.y)
      if (item.onground && (DISTANCE < ITEMRADIUS + frontEndPlayer.radius)) {
        interactItem(id,backEndItems)
        foundOneFlag = true
        break
      }
    }
    if (foundOneFlag){
      return
    }

})


function playSoundEffectGun(gunName,DISTANCE,thatGunSoundDistance){
  let gunSound = frontEndGunSounds[gunName].cloneNode(true) //new Audio(`/sound/${gunName}.mp3`)
    if (DISTANCE > 100){
      gunSound.volume = Math.round( 10*(thatGunSoundDistance - (DISTANCE-100))/thatGunSoundDistance ) / 10
    }
    gunSound.play()
    gunSound.remove()
}





let MySoundEffects = {}
const mysoundeffectkeys = ['explosion', 'takeoff','plane_2sec','plane_motor_2sec','B2_halfsec','item_landing','vehicle_landing','player_pickup',   'tank_moving','car_moving','B2_moving','raptor_moving','APC_moving','Fennek_moving']
for (let i=0;i<mysoundeffectkeys.length;i++){
  const soundkey = mysoundeffectkeys[i]
  const soundstring = `/sound/${soundkey}.mp3`
  MySoundEffects[soundkey] = new Audio(soundstring)
}


function playSoundEffect(gunName,DISTANCE,thatGunSoundDistance){
  if (!mysoundeffectkeys.includes(gunName)){
    console.log('no sound for: ',gunName)
    return
  }
  let gunSound = MySoundEffects[gunName].cloneNode(true) //new Audio(`/sound/${gunName}.mp3`)
    if (DISTANCE > 100){
      gunSound.volume = Math.round( 10*(thatGunSoundDistance - (DISTANCE-100))/thatGunSoundDistance ) / 10
    }
    gunSound.play()
    gunSound.remove()
}


// backend -> front end signaling
socket.on('updateFrontEnd',({backEndPlayers, backEndEnemies, backEndProjectiles, backEndObjects, backEndItems,backEndVehicles,backEndAirstrikes,backEndSoundRequest})=>{
    /////////////////////////////////////////////////// 1.PLAYER //////////////////////////////////////////////////
    const myPlayerID = socket.id

    for (const id in backEndPlayers){
      const backEndPlayer = backEndPlayers[id]
  
      // add player from the server if new
      if (!frontEndPlayers[id]){
        // Item: inventory management
        const inventorySize = backEndPlayer.inventory.length
        let frontEndInventory = []
        for (let i=0;i<inventorySize;i++){
          const backEndItem = backEndPlayer.inventory[i]
          let isItem = instantiateItem(backEndItem,backEndItem.myID) // add item to frontenditem on index: backEndItem.myID
          frontEndInventory[i] = backEndItem.myID // put itemsId to frontenditem list - like a pointer
        }
        
        frontEndPlayers[id] = new Player({
          x: backEndPlayer.x, 
          y: backEndPlayer.y, 
          radius: backEndPlayer.radius, 
          color: backEndPlayer.color,
          username: backEndPlayer.username,
          health: backEndPlayer.health,
          currentSlot: 1,
          inventory: frontEndInventory,
          currentPos: {x:cursorX,y:cursorY}, // client side prediction mousepos
          score: backEndPlayer.score,
          wearingarmorID: backEndPlayer.wearingarmorID,
          wearingscopeID: backEndPlayer.wearingscopeID, 
          getinhouse:backEndPlayer.getinhouse,
          ridingVehicleID:backEndPlayer.ridingVehicleID,
          canvasHeight:backEndPlayer.canvasHeight,
          canvasWidth:backEndPlayer.canvasWidth,
          skin:backEndPlayer.skin,
          onBoard: backEndPlayer.onBoard
        })
  
          document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}"> > ${backEndPlayer.username} </div>`
  
      } else {      // player already exists
            let frontEndPlayerOthers = frontEndPlayers[id] 

            frontEndPlayerOthers.x = backEndPlayer.x
            frontEndPlayerOthers.y = backEndPlayer.y

            // update players attributes
            frontEndPlayerOthers.health = backEndPlayer.health
            frontEndPlayerOthers.score = backEndPlayer.score
            frontEndPlayerOthers.wearingarmorID = backEndPlayer.wearingarmorID
            frontEndPlayerOthers.wearingscopeID = backEndPlayer.wearingscopeID
            frontEndPlayerOthers.getinhouse = backEndPlayer.getinhouse 
            frontEndPlayerOthers.ridingVehicleID = backEndPlayer.ridingVehicleID
            frontEndPlayerOthers.skin = backEndPlayer.skin
            frontEndPlayerOthers.onBoard = backEndPlayer.onBoard
            // canvas width and height changed => init Game!

            // inventory attributes
            frontEndPlayerOthers.currentSlot = backEndPlayer.currentSlot
            // Item: inventory management
            const inventorySize = backEndPlayer.inventory.length
            for (let i=0;i<inventorySize;i++){
                const backEndItem = backEndPlayer.inventory[i]
                frontEndPlayerOthers.inventory[i] = backEndItem.myID
            }
    
            if (id === myPlayerID){ // client side prediction - mouse pointer
                frontEndPlayerOthers.cursorPos = {x:cursorX,y:cursorY}
    
            }else{
                frontEndPlayerOthers.cursorPos = backEndPlayer.mousePos
            }
  
      }
    }
  
    frontEndPlayer = frontEndPlayers[myPlayerID] // assign global variable
  
    // remove player from the server if current player does not exist in the backend
    for (const id in frontEndPlayers){
        if (!backEndPlayers[id]){
            const divToDelete = document.querySelector(`div[data-id="${id}"]`)
            divToDelete.parentNode.removeChild(divToDelete)
        
            // if I dont exist
            if (id === myPlayerID) {     // reshow the start button interface
                const mePlayer = frontEndPlayers[myPlayerID]
        
                pointEl.innerHTML = mePlayer.score
                playerdeathsound.play()
                document.querySelector('#usernameForm').style.display = 'block'
                //socket.emit('playerdeath',{playerId: id, armorID: mePlayer.wearingarmorID, scopeID: mePlayer.wearingscopeID,vehicleID:mePlayer.ridingVehicleID})
                LobbyBGM.play()
            }
            else{ // other player died
                shothitsound.play()
            }
        
            delete frontEndPlayers[id]
            return // pass below steps since I died
        }
    }
    /////////////////////////////////////////////////// 2.ENEMIES //////////////////////////////////////////////////
    for (const id in backEndEnemies) {
      const backEndEnemy = backEndEnemies[id]
  
      if (!frontEndEnemies[id]){ // new 
        frontEndEnemies[id] = new Enemy({
          x: backEndEnemy.x, 
          y: backEndEnemy.y, 
          radius: backEndEnemy.radius, 
          color: backEndEnemy.color, 
          velocity: backEndEnemy.velocity,
          damage: backEndEnemy.damage,
          health: backEndEnemy.health,
          wearingarmorID: backEndEnemy.wearingarmorID
        })
  
      } else { // already exist
        let frontEndEnemy = frontEndEnemies[id]
        frontEndEnemy.health = backEndEnemy.health
        frontEndEnemy.x = backEndEnemy.x
        frontEndEnemy.y = backEndEnemy.y
      }
    
    }
    // remove deleted enemies
    for (const frontEndEnemyId in frontEndEnemies){
      if (!backEndEnemies[frontEndEnemyId]){
       delete frontEndEnemies[frontEndEnemyId]
      }
    }
  
    /////////////////////////////////////////////////// 3.PROJECTILES //////////////////////////////////////////////////
    for (const id in backEndProjectiles) {
      const backEndProjectile = backEndProjectiles[id]
      const gunName = backEndProjectile.gunName
  
      if (!frontEndProjectiles[id]){ // new projectile
        frontEndProjectiles[id] = new Projectile({
          x: backEndProjectile.x, 
          y: backEndProjectile.y, 
          radius: backEndProjectile.radius, 
          color: backEndProjectile.color, // only call when available
          velocity: backEndProjectile.velocity,
          gunName
        })
  
        // player close enough should hear the sound (when projectile created) - for me
        const me = frontEndPlayers[myPlayerID]
        if (me){

          const DISTANCE = Math.hypot(backEndProjectile.x - me.x, backEndProjectile.y - me.y)

          const sightdistanceProjectile = (sightChunk+1)*TILE_SIZE + TILE_SIZE_HALF

          const thatGunSoundDistance = Math.max(backEndProjectile.travelDistance, sightdistanceProjectile)  //900
          if (gunName === 'shockWave' ||gunName === 'fragment'){// these are explosions
            // pass
          } else if (gunName && (DISTANCE-100 < thatGunSoundDistance) ){ 
            playSoundEffectGun(gunName,DISTANCE,thatGunSoundDistance)
          //   let gunSound = frontEndGunSounds[gunName].cloneNode(true) //new Audio(`/sound/${gunName}.mp3`)
          //   if (DISTANCE > 100){
          //     gunSound.volume = Math.round( 10*(thatGunSoundDistance - (DISTANCE-100))/thatGunSoundDistance ) / 10
          //   }
          //   gunSound.play()
          //   gunSound.remove()
          }
        }



  
      } else { // already exist
        let frontEndProj = frontEndProjectiles[id]
        frontEndProj.x = backEndProjectile.x
        frontEndProj.y = backEndProjectile.y

      }
    
    }
    // remove deleted projectiles
    for (const frontEndProjectileId in frontEndProjectiles){
      if (!backEndProjectiles[frontEndProjectileId]){
       delete frontEndProjectiles[frontEndProjectileId]
      }
    }
  
  
    /////////////////////////////////////////////////// 4.OBJECTS //////////////////////////////////////////////////
    for (const id in backEndObjects) {
      const backEndObject = backEndObjects[id]
  
      if (!frontEndObjects[id]){ // new 
        if (backEndObject.objecttype === 'wall'){
          frontEndObjects[id] = new Wall({
            objecttype: backEndObject.objecttype, 
            health: backEndObject.health, 
            objectinfo: backEndObject.objectinfo,
            name:backEndObject.name,
          })
        } else if(backEndObject.objecttype === 'barrel' ||backEndObject.objecttype === 'mine' ){
          frontEndObjects[id] = new PlaceableObject({
            objecttype: backEndObject.objecttype, 
            health: backEndObject.health, 
            objectinfo: backEndObject.objectinfo,
            name:backEndObject.name,
          })
        }else if(backEndObject.objecttype === 'hut'){
          frontEndObjects[id] = new Hut({
            objecttype: backEndObject.objecttype, 
            health: backEndObject.health, 
            objectinfo: backEndObject.objectinfo,
            name:backEndObject.name,
          })
        }
  
  
      } else { // already exist
        // update health attributes if changed
        frontEndObjects[id].health = backEndObject.health
  
      }
    }
    // remove deleted 
    for (const Id in frontEndObjects){
      if (!backEndObjects[Id]){
       delete frontEndObjects[Id]
      }
    }
  
    /////////////////////////////////////////////////// 5.ITEMS //////////////////////////////////////////////////
    for (const id in backEndItems) {
      if (!frontEndItems[id]){ // new
        const backEndItem = backEndItems[id]
        instantiateItem(backEndItem,id)
      } else { // already exist
        // update items attributes
        const backEndItem = backEndItems[id]
        let frontEndItem = frontEndItems[id]
        frontEndItem.groundx = backEndItem.groundx
        frontEndItem.groundy = backEndItem.groundy
        frontEndItem.onground = backEndItem.onground
        // only update important gun's ammo (flare gun is one time use)
        if (backEndItem.name==='flareGun'){
          frontEndItem.ammo = backEndItem.iteminfo.ammo
        }
      }
    }
    // remove deleted 
    for (const frontEndItemId in frontEndItems){
      if (!backEndItems[frontEndItemId]){
       delete frontEndItems[frontEndItemId]
      }
    }

    /////////////////////////////////////////////////// 6.VEHICLES //////////////////////////////////////////////////
    for (const id in backEndVehicles) {
      const backEndVehicle = backEndVehicles[id]
  
      if (!frontEndVehicles[id]){ // new 
        instantiateVehicle(backEndVehicle,id)
  
      } else { // already exist
        let frontEndVehicle = frontEndVehicles[id]
        frontEndVehicle.health = backEndVehicle.health
        frontEndVehicle.x = backEndVehicle.x
        frontEndVehicle.y = backEndVehicle.y
        frontEndVehicle.occupied = backEndVehicle.occupied
        frontEndVehicle.ridingPlayerID = backEndVehicle.ridingPlayerID
      }
    
    }
    // remove deleted vehicles
    for (const frontEndVehicleId in frontEndVehicles){
      if (!backEndVehicles[frontEndVehicleId]){
       delete frontEndVehicles[frontEndVehicleId]
      }
    }

    /////////////////////////////////////////////////// 7.AIRSTRIKES //////////////////////////////////////////////////
    for (const id in backEndAirstrikes) {
      const backEndAirstrike = backEndAirstrikes[id]
  

      //x,y, myID:airstrikeId, signal, speed, strike_Y_level, strikeNumber
      if (!frontEndAirstrikes[id]){ // new 
        frontEndAirstrikes[id] = {
          x: backEndAirstrike.x, 
          y: backEndAirstrike.y, 
        }
      } else { // already exist
        let frontEndAirstrike = frontEndAirstrikes[id]
        frontEndAirstrike.y = backEndAirstrike.y
      }
    
    }
    // remove deleted 
    for (const frontEndAirstrikeId in frontEndAirstrikes){
      if (!backEndAirstrikes[frontEndAirstrikeId]){
       delete frontEndAirstrikes[frontEndAirstrikeId]
      }
    }

    /////////////////////////////////////////////////// 8.Sound effects //////////////////////////////////////////////////
    for (const id in backEndSoundRequest) {
      const backendSR = backEndSoundRequest[id]

      //x,y, myID:airstrikeId, signal, speed, strike_Y_level, strikeNumber
      if (!frontEndSoundRequest[id]){ // new 
        // add and play the sound!
        frontEndSoundRequest[id] = {
          x:backendSR.x,
          y:backendSR.y,
          soundName:backendSR.soundName,
          soundDistance:backendSR.soundDistance,
        }

        // player close enough should hear the sound (when projectile created) - for me
        const me = frontEndPlayers[myPlayerID]
        if (me){
          const DISTANCE = Math.hypot(backendSR.x - me.x, backendSR.y - me.y)
          const thatGunSoundDistance = backendSR.soundDistance
          if (DISTANCE-100 < thatGunSoundDistance){ // more wider
            playSoundEffect(backendSR.soundName,DISTANCE,thatGunSoundDistance)
          }
        }
      } else { // already exist
        // no update
      }
    }
    // remove deleted 
    for (const soundId in frontEndSoundRequest){
      if (!backEndSoundRequest[soundId]){
       delete frontEndSoundRequest[soundId]
      }
    }


})


function getMinimapLoc(MiniMapRatio,x,y){
  return {x:Math.round(x*MiniMapRatio), y:Math.round(y*MiniMapRatio)}
}


// init cam
let camX = 100
let camY = 100

const centerX = Math.round(canvasEl.width/2)
const centerY = Math.round(canvasEl.height/2)

canvas.font ='italic bold 24px sans-serif'
const defaultSightChunk = 2
let chunkInfo 
let sightChunk = defaultSightChunk


function updateSightChunk(scopeDist){
  sightChunk = defaultSightChunk + scopeDist
}

function loop(){
    canvas.clearRect(0,0,canvasEl.width, canvasEl.height)  

    if (!frontEndPlayer){ // if not exists - draw nothing
      canvas.fillStyle = 'black'
      canvas.fillText("loading...",centerX - 50,centerY + 30)
      window.requestAnimationFrame(loop);
      return
    }


    // OTHERS
    if (keys.g.pressed){ // draw minimap
      canvas.drawImage(minimapImage, 
        0,
        0,
        MINIMAPFRAMESIZE,MINIMAPFRAMESIZE,
        centerX - MINIMAPFRAMESIZE_HALF, centerY - MINIMAPFRAMESIZE_HALF, 
        MINIMAPFRAMESIZE,MINIMAPFRAMESIZE
        )
        const MiniMapRatio = MINIMAPSIZE/MAPWIDTH

        
        // const locationOnMinimap = frontEndPlayer.getMinimapLoc(MiniMapRatio)
        const locationOnMinimap = getMinimapLoc(MiniMapRatio,frontEndPlayer.x,frontEndPlayer.y)

        // draw player
        canvas.drawImage(myPCSkin, centerX - MINIMAPSIZE_HALF + locationOnMinimap.x - PLAYERRADIUS, centerY - MINIMAPSIZE_HALF + locationOnMinimap.y - PLAYERRADIUS)


        // draw airstrike location
        for (const id in frontEndAirstrikes){ 
          const frontEndAirstrike = frontEndAirstrikes[id]
          const currentplaneloc = getMinimapLoc(MiniMapRatio,frontEndAirstrike.x,frontEndAirstrike.y)
          canvas.drawImage(planeImageMINIMAP, centerX - MINIMAPSIZE_HALF + currentplaneloc.x - 24, centerY - MINIMAPSIZE_HALF + currentplaneloc.y - 32)
        }


        window.requestAnimationFrame(loop);
        return
    }


    // CAMERA 
    camX = frontEndPlayer.x - centerX
    camY = frontEndPlayer.y - centerY


      // ADVANCED GROUNDTILES
      chunkInfo = getChunk(frontEndPlayer.x,frontEndPlayer.y)

      // SIGHT DISTANCE IS CHANGED IF PLAYER IS IN THE HOUSE CHUNK - house chunk has id===50

      const { id } =groundMap[chunkInfo.rowNum][chunkInfo.colNum]
      
      if (!frontEndPlayer.getinhouse && id === 50 && !frontEndPlayer.onBoard){ //  get in house for the first time
        frontEndPlayer.getinhouse = true // prediction
        socket.emit('houseEnter')
        updateSightChunk(-1)
      }
      if (frontEndPlayer.getinhouse && id !== 50){ // get out of the house for the first time
        frontEndPlayer.getinhouse = false // prediction
        socket.emit('houseLeave')
        if (frontEndPlayer.wearingscopeID>0){// if scope
          updateSightChunk(frontEndItems[frontEndPlayer.wearingscopeID].scopeDist)
        } else{ // default scope: 0
          updateSightChunk(0) 
        }
      }


      for (let row = chunkInfo.rowNum-sightChunk;row < chunkInfo.rowNum + sightChunk+1;row++){
        for (let col = chunkInfo.colNum-sightChunk;col < chunkInfo.colNum + sightChunk+1 ;col++){
            if (row < 0 || col < 0 || row >= groundMap.length || col >= groundMap[0].length){
              continue
            }
            const { id } = groundMap[row][col];
            const imageRow = parseInt(id / TILES_IN_ROW);
            const imageCol = id % TILES_IN_ROW;

            canvas.drawImage(mapImage, 
                imageCol * TILE_SIZE,
                imageRow * TILE_SIZE,
                TILE_SIZE,TILE_SIZE,
                col*TILE_SIZE - camX, 
                row*TILE_SIZE - camY,
                TILE_SIZE,TILE_SIZE
                );
        }
    }
    // ADVANCED GROUNDTILES

    // ITEMS
    for (const id in frontEndItems){
      const item = frontEndItems[id]
      const gunImg = itemImages[item.name]
      if (frontEndPlayer.IsVisible(chunkInfo,getChunk(item.groundx,item.groundy),sightChunk) ){
        item.draw(canvas, camX, camY, {img:gunImg,offset:ITEMRADIUS})
      }
    }

      // ENEMIES
      canvas.fillStyle = "CadetBlue" 
      for (const id in frontEndEnemies){ 
        const frontEndEnemy = frontEndEnemies[id]
        if (frontEndPlayer.IsVisible(chunkInfo,getChunk(frontEndEnemy.x,frontEndEnemy.y),sightChunk) ){
          frontEndEnemy.draw(canvas, camX, camY)
        }
      }

    // PROJECTILES
    canvas.strokeStyle = 'black'
    canvas.lineWidth = PROJECTILERADIUS  // fixed: for performance
    for (const id in frontEndProjectiles){ 
        const frontEndProjectile = frontEndProjectiles[id]
        if (frontEndPlayer.IsVisible(chunkInfo,getChunk(frontEndProjectile.x,frontEndProjectile.y),sightChunk) ){
          frontEndProjectile.draw(canvas, camX, camY)
        }
    }

    // VEHICLES
    //canvas.strokeStyle = "black" // same stroke style with projectiles
    canvas.lineWidth = 4
    for (const id in frontEndVehicles){ 
      const frontEndVehicle = frontEndVehicles[id]
      if (frontEndPlayer.IsVisible(chunkInfo,getChunk(frontEndVehicle.x,frontEndVehicle.y),sightChunk) ){
        frontEndVehicle.draw(canvas, camX, camY)
      }
    }


    ///////////////////////////////// PLAYERS /////////////////////////////////
    canvas.fillStyle = 'white'
    // canvas.strokeStyle = 'black' // same stroke style with projectiles
    if (!frontEndPlayer.onBoard){ // draw myself in the center
        const currentHoldingItem = getCurItem(frontEndPlayer)
        frontEndPlayer.displayAttribute(canvas, camX, camY, currentHoldingItem)
        if (gunInfoFrontEnd){
          const thisguninfo = gunInfoFrontEnd[currentHoldingItem.name]
          frontEndPlayer.drawGun(canvas, camX, camY, centerX , centerY , currentHoldingItem, thisguninfo)
        }
        canvas.drawImage(myPCSkin, centerX - PLAYERRADIUS, centerY - PLAYERRADIUS)
    }

    for (const id in frontEndPlayers){ 
      const currentPlayer = frontEndPlayers[id]
      if (currentPlayer.onBoard){ // do not draw anything if on board
        continue
      }
      if (id !== socket.id){ // other players
          if (!frontEndPlayer.IsVisible(chunkInfo,getChunk(currentPlayer.x,currentPlayer.y),sightChunk) ){
            continue
          }

          const currentHoldingItem = getCurItem(currentPlayer)
          if (gunInfoFrontEnd){
            const thisguninfo = gunInfoFrontEnd[currentHoldingItem.name]
            currentPlayer.drawGun(canvas, camX, camY, -1, -1, currentHoldingItem, thisguninfo)
          }
          canvas.drawImage(skinImages[currentPlayer.skin], currentPlayer.x - camX- PLAYERRADIUS, currentPlayer.y - camY- PLAYERRADIUS)
      }
    }

    // This loop is for displaying health & name
    canvas.lineWidth = 8
    if (!frontEndPlayer.onBoard){ // draw myself in the center
      frontEndPlayer.displayHealth(canvas, camX, camY, centerX , centerY - PLAYERRADIUS*2)
    }

    for (const id in frontEndPlayers){ 
      const currentPlayer = frontEndPlayers[id]
      if (currentPlayer.onBoard){ // do not draw anything if on board
        continue
      }
      if (id !== socket.id){ // other players
          if (!frontEndPlayer.IsVisible(chunkInfo,getChunk(currentPlayer.x,currentPlayer.y),sightChunk) ){
            continue
          }
          if (!currentPlayer.getinhouse){ // display player info only if they are not inside the house!
            currentPlayer.displayHealth(canvas, camX, camY, -1, -1)
            currentPlayer.displayName(canvas, camX, camY)
          }
      }
    }
    ///////////////////////////////// PLAYERS /////////////////////////////////

    // WALLS
    canvas.strokeStyle = WALLCOLOR
    //canvas.fillStyle = WALLCOLOR
    for (const id in frontEndObjects){
      const obj = frontEndObjects[id]
      if (frontEndPlayer.IsVisible(chunkInfo,getChunk(obj.x,obj.y),sightChunk) ){
        obj.draw(canvas, camX, camY)
      }
    }





    // ADVANCED NON OPAC
    for (let row = chunkInfo.rowNum-sightChunk;row < chunkInfo.rowNum + sightChunk+1;row++){
      for (let col = chunkInfo.colNum-sightChunk;col < chunkInfo.colNum + sightChunk+1 ;col++){
        if (row < 0 || col < 0 || row >= groundMap.length || col >= groundMap[0].length){
          continue
        }
        const { id } = decalMap[row][col] ?? {id:undefined};
        const imageRow = parseInt(id / TILES_IN_ROW);
        const imageCol = id % TILES_IN_ROW;

        if ((130 <= id && id <= 134) || id===107 ){ //opacity
          // not customed here
        } else if(id === 188 || id === 50){ // ceiling of the house
          if (!frontEndPlayer.getinhouse){ // not in a house, draw ceiling
            canvas.drawImage(mapImage, 
              imageCol * TILE_SIZE,
              imageRow * TILE_SIZE,
              TILE_SIZE,TILE_SIZE,
              col*TILE_SIZE - camX, 
              row*TILE_SIZE - camY,
              TILE_SIZE,TILE_SIZE
              );
          }
        }else { // non-opaque things (if(135 <= id && id <= 137): rocks)
          canvas.drawImage(mapImage, 
            imageCol * TILE_SIZE,
            imageRow * TILE_SIZE,
            TILE_SIZE,TILE_SIZE,
            col*TILE_SIZE - camX, 
            row*TILE_SIZE - camY,
            TILE_SIZE,TILE_SIZE
            );
        } 
      }
    }
    // ADVANCED NON OPAC


    // GLOBAL ALPHA CHANGES
    canvas.save();
    // ADVANCED PLANTS (OPAQUE)
    canvas.globalAlpha = 0.8;

    for (let row = chunkInfo.rowNum-sightChunk;row < chunkInfo.rowNum + sightChunk+1;row++){
      for (let col = chunkInfo.colNum-sightChunk;col < chunkInfo.colNum + sightChunk+1 ;col++){
        if (row < 0 || col < 0 || row >= groundMap.length || col >= groundMap[0].length){
          continue
        }
        const { id } = decalMap[row][col] ?? {id:undefined};
        const imageRow = parseInt(id / TILES_IN_ROW);
        const imageCol = id % TILES_IN_ROW;
        if (130 <= id && id <= 134){ // grass - opacity
          canvas.drawImage(mapImage, 
            imageCol * TILE_SIZE,
            imageRow * TILE_SIZE,
            TILE_SIZE,TILE_SIZE,
            col*TILE_SIZE - camX, 
            row*TILE_SIZE - camY,
            TILE_SIZE,TILE_SIZE
            );
        } else if (id===107){ // overhanges (roofs) - opacity but not clear as house
          canvas.drawImage(mapImage, 
            imageCol * TILE_SIZE,
            imageRow * TILE_SIZE,
            TILE_SIZE,TILE_SIZE,
            col*TILE_SIZE - camX, 
            row*TILE_SIZE - camY,
            TILE_SIZE,TILE_SIZE
            );
        }
      }
    }
    // ADVANCED PLANTS


    // Air strike
    // canvas.globalAlpha = 0.9;
    for (const id in frontEndAirstrikes){ 
      const frontEndAirstrike = frontEndAirstrikes[id]
      if (frontEndPlayer.IsVisible(chunkInfo,getChunk(frontEndAirstrike.x,frontEndAirstrike.y),sightChunk+AIRSTRIKEDIST_ADDITIONAL) ){
        canvas.drawImage(planeImage,frontEndAirstrike.x - camX - 384, frontEndAirstrike.y - camY - 558)
      }
    }

    canvas.restore();
    // GLOBAL ALPHA CHANGES




    if (frontEndPlayer.onBoard){ // show text message
      canvas.fillText('Press F to take off!', centerX - 110, centerY + PLAYERRADIUS*2)
    }

    

    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);




function getChunk(x,y){ // returns the tile row and col where player is standing at
  return {rowNum:Math.floor(y/TILE_SIZE), colNum:Math.floor(x/TILE_SIZE)}
}

function resetKeys(){
    let keysKey = Object.keys(keys)
    for (let i=0;i<keysKey.length;i++){
      const keykey = keysKey[i]
      keys[keykey].pressed = false
    }
}

// START (button clicked)
document.querySelector('#usernameForm').addEventListener('submit', (event) => {
    event.preventDefault()
    LobbyBGM.pause()
    LobbyBGM.currentTime = 0
    pointEl.innerHTML = 0 // init score
    document.querySelector('#usernameForm').style.display = 'none' // unblock the screen

    // init player info
    resetKeys()
    listen = true // initialize the semaphore
    updateSightChunk(0) // scope to 0
    const playerX = MAPWIDTH * Math.random() //0 //
    const playerY = MAPHEIGHT * Math.random() //MAPHEIGHT// 
    const playerColor =  `hsl(${Math.random()*360},100%,70%)`

    const myUserName = document.querySelector('#usernameInput').value

    // Skin change here
    //console.log('|',myUserName,'|')
    if (skinKeys.includes(myUserName)){
      Myskin=myUserName
    }else{
      Myskin='default'
    }

    myPCSkin = skinImages[Myskin]
    //console.log(myPCSkin.src)
    socket.emit('initGame', {username:myUserName, playerX, playerY, playerColor,canvasHeight:canvasEl.height,canvasWidth:canvasEl.width,Myskin})
 })
  


 function instantiateVehicle(backEndVehicle,id){
  if (backEndVehicle.type === 'car'){
    frontEndVehicles[id] = new Car({ 
      x: backEndVehicle.x, 
      y: backEndVehicle.y, 
      radius: backEndVehicle.radius, 
      color: backEndVehicle.color, 
      warningcolor: backEndVehicle.warningcolor,
      velocity: backEndVehicle.velocity,
      damage: backEndVehicle.damage,
      health: backEndVehicle.health,
      occupied: backEndVehicle.occupied,
      ridingPlayerID: backEndVehicle.ridingPlayerID,
      type: backEndVehicle.type
    })
    return true
  } else if(backEndVehicle.type === 'Fennek'){
    frontEndVehicles[id] = new Fennek({ 
      x: backEndVehicle.x, 
      y: backEndVehicle.y, 
      radius: backEndVehicle.radius, 
      color: backEndVehicle.color, 
      warningcolor: backEndVehicle.warningcolor,
      velocity: backEndVehicle.velocity,
      damage: backEndVehicle.damage,
      health: backEndVehicle.health,
      occupied: backEndVehicle.occupied,
      ridingPlayerID: backEndVehicle.ridingPlayerID,
      type: backEndVehicle.type
    })
    return true
  } else if(backEndVehicle.type === 'APC'){
    frontEndVehicles[id] = new APC({ 
      x: backEndVehicle.x, 
      y: backEndVehicle.y, 
      radius: backEndVehicle.radius, 
      color: backEndVehicle.color, 
      warningcolor: backEndVehicle.warningcolor,
      velocity: backEndVehicle.velocity,
      damage: backEndVehicle.damage,
      health: backEndVehicle.health,
      occupied: backEndVehicle.occupied,
      ridingPlayerID: backEndVehicle.ridingPlayerID,
      type: backEndVehicle.type,
      turretName: backEndVehicle.info.turretName
    })
    return true
  } else if(backEndVehicle.type === 'tank'){
    frontEndVehicles[id] = new TANK({ 
      x: backEndVehicle.x, 
      y: backEndVehicle.y, 
      radius: backEndVehicle.radius, 
      color: backEndVehicle.color, 
      warningcolor: backEndVehicle.warningcolor,
      velocity: backEndVehicle.velocity,
      damage: backEndVehicle.damage,
      health: backEndVehicle.health,
      occupied: backEndVehicle.occupied,
      ridingPlayerID: backEndVehicle.ridingPlayerID,
      type: backEndVehicle.type,
      turretName: backEndVehicle.info.turretName
    })
    return true
  } else if(backEndVehicle.type === 'turret'){
    frontEndVehicles[id] = new TURRET({ 
      x: backEndVehicle.x, 
      y: backEndVehicle.y, 
      radius: backEndVehicle.radius, 
      color: backEndVehicle.color, 
      warningcolor: backEndVehicle.warningcolor,
      velocity: backEndVehicle.velocity,
      damage: backEndVehicle.damage,
      health: backEndVehicle.health,
      occupied: backEndVehicle.occupied,
      ridingPlayerID: backEndVehicle.ridingPlayerID,
      type: backEndVehicle.type,
      turretName: backEndVehicle.info.turretName
    })
    return true
  } else if(backEndVehicle.type === 'raptor'){
    frontEndVehicles[id] = new RAPTOR({ 
      x: backEndVehicle.x, 
      y: backEndVehicle.y, 
      radius: backEndVehicle.radius, 
      color: backEndVehicle.color, 
      warningcolor: backEndVehicle.warningcolor,
      velocity: backEndVehicle.velocity,
      damage: backEndVehicle.damage,
      health: backEndVehicle.health,
      occupied: backEndVehicle.occupied,
      ridingPlayerID: backEndVehicle.ridingPlayerID,
      type: backEndVehicle.type,
      turretName: backEndVehicle.info.turretName
    })
    return true
  } else if(backEndVehicle.type === 'B2'){
    frontEndVehicles[id] = new B2({ 
      x: backEndVehicle.x, 
      y: backEndVehicle.y, 
      radius: backEndVehicle.radius, 
      color: backEndVehicle.color, 
      warningcolor: backEndVehicle.warningcolor,
      velocity: backEndVehicle.velocity,
      damage: backEndVehicle.damage,
      health: backEndVehicle.health,
      occupied: backEndVehicle.occupied,
      ridingPlayerID: backEndVehicle.ridingPlayerID,
      type: backEndVehicle.type,
      turretName: backEndVehicle.info.turretName
    })
    return true
  } else{
    console.log("not implemented vehicle or invalid name")
    return false
  }

 }



 function instantiateItem(backendItem,id){ // switch case
  if (backendItem.itemtype==='gun'){
    //console.log('gun dropped!')
    frontEndItems[id] = new Gun({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo:{ammo:backendItem.iteminfo.ammo ,ammotype: backendItem.iteminfo.ammotype }
    })
    frontEndItems[id].magSize = gunInfoFrontEnd[backendItem.name].magSize
    frontEndItems[id].reloadTime = gunInfoFrontEnd[backendItem.name].reloadTime
    return true
  } else if (backendItem.itemtype==='consumable') {
    frontEndItems[id] = new Consumable({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo:{amount:backendItem.iteminfo.amount , healamount:backendItem.iteminfo.healamount }
    })
    return true
  } else if (backendItem.itemtype==='melee') { // same with guns?
    frontEndItems[id] = new Melee({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo: {ammo:backendItem.iteminfo.ammo ,ammotype: backendItem.iteminfo.ammotype}
    })
    return true
  } else if (backendItem.itemtype==='armor') {
    frontEndItems[id] = new Armor({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo:{amount:backendItem.iteminfo.amount }
    })
  } else if (backendItem.itemtype==='scope') {
    frontEndItems[id] = new Scope({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo:{scopeDist:backendItem.iteminfo.scopeDist}
    })
  } else if (backendItem.itemtype==='placeable') {
    frontEndItems[id] = new Placeable({groundx:backendItem.groundx, 
      groundy:backendItem.groundy, 
      size:backendItem.size, 
      name:backendItem.name, 
      onground: backendItem.onground, 
      color: backendItem.color,
      iteminfo:{variantName:backendItem.iteminfo.variantName }
    })
    return true
  } else{
    console.log("not implemented item or invalid name")
    // undefined or etc.
    return false
  }
}