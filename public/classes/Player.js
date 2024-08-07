const HEALTHBARHALFLEN = 16

class Player{
    constructor({x, y, radius, color,username, health, currentSlot = 1,inventory, cursorPos = {y:0,x:0}, score, wearingarmorID=-1,wearingscopeID=-1,ridingVehicleID=-1,getinhouse,canvasHeight,canvasWidth,skin, healthboost}) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.username = username
      this.health = health
      this.currentSlot = currentSlot
      this.inventory = inventory
      this.cursorPos = cursorPos
      this.ammoList = {'45ACP':50,'5mm':30,'7mm':10,'12G':14,'battery':2, 'bolt':8,'superconductor':10} //default amount of ammos
      this.reloading = false
      this.score = score
      this.wearingarmorID = wearingarmorID
      this.wearingscopeID = wearingscopeID
      this.ridingVehicleID = ridingVehicleID
      this.getinhouse = getinhouse // in house initially false
      this.canvasHeight = canvasHeight
      this.canvasWidth = canvasWidth
      this.skin = skin
      // calculate relative rotation vector
      this.start_offset =  16
      this.rotation_alpha = Math.PI/6
      this.healthboost = healthboost
      this.recoil = 0
      
    }
    drawPlayer(canvas, skin, xloc, yloc){
      canvas.drawImage(skin, xloc, yloc)

      // draw armor if exist
      if (this.wearingarmorID>0){
        canvas.lineWidth = 4
        canvas.beginPath()
        canvas.arc(xloc+this.radius, yloc+this.radius, this.radius, 0, Math.PI * 2, false)
        canvas.stroke()
      }


    }

    getMinimapLoc(MiniMapRatio){
      return {x:Math.round(this.x*MiniMapRatio), y:Math.round(this.y*MiniMapRatio)}
    }

    IsVisible(mychunkloc,otherchunkloc,refChunk){ // chunk based
      if (Math.abs(mychunkloc.rowNum-otherchunkloc.rowNum) <= refChunk && Math.abs(mychunkloc.colNum-otherchunkloc.colNum) <= refChunk){
        return true
      }else{
        return false
      }
    }

    displayName(canvas, camX, camY) {
      canvas.fillText(this.username,this.x - 6*this.username.length - camX ,this.y - this.radius*4 - camY)
    }

    displayHealth(canvas, camX, camY, locX, locY){
      // player with socket.id (me)
      let xReal = locX
      let yReal = locY
      if (locX===-1){ // other player
        xReal = Math.round(this.x - camX) 
        yReal = Math.round(this.y - this.radius*2 - camY)
      }

      //canvas.fillText(`HP: ${Math.round(this.health * 100) / 100}`,xReal,yReal)

      const HPlen = parseInt( HEALTHBARHALFLEN * this.health / 4) // max health is 8
      canvas.strokeStyle = 'gray'
      canvas.beginPath()
      canvas.moveTo(xReal - HEALTHBARHALFLEN, yReal)
      canvas.lineTo(xReal + HEALTHBARHALFLEN, yReal)
      canvas.stroke()

      canvas.strokeStyle = 'red'
      canvas.beginPath()
      canvas.moveTo(xReal - HEALTHBARHALFLEN, yReal)
      canvas.lineTo(xReal - HEALTHBARHALFLEN + HPlen, yReal)
      canvas.stroke()

      // Display health boost if exists
      if (this.healthboost > 0){
        const yReal_below = yReal + 8
        canvas.strokeStyle = '#E2F516'
        canvas.beginPath()
        canvas.moveTo(xReal - HEALTHBARHALFLEN, yReal_below)
        canvas.lineTo(xReal - HEALTHBARHALFLEN + this.healthboost, yReal_below)
        canvas.stroke()
      }

    }

    drawGun(canvas, camX, camY, locX, locY, currentHoldingItem, thisguninfo){
      if (this.ridingVehicleID>0){ // if riding a vehicle, dont draw vehicle's a gun!
        return
      }

      //canvas.strokeStyle = 'black'
      // player with socket.id (me)
      let xReal = locX
      let yReal = locY
      if (locX===-1){ // other player
        xReal = this.x - camX 
        yReal = this.y - camY
      }

      if (currentHoldingItem.itemtype==='gun'){
        const itemSize = currentHoldingItem.size
        const itemlength = itemSize.length*2 - this.recoil
        if (this.recoil<0.05){
          this.recoil =0
        }else{
          this.recoil -= this.recoil/10
        }
        
        const gunmainwidth = itemSize.width*2
        let angle = Math.atan2(
          (this.cursorPos.y) - this.canvasHeight/2,
          (this.cursorPos.x) - this.canvasWidth/2
        )
        const direction = { 
          x: Math.cos(angle) ,
          y: Math.sin(angle) 
        }
        canvas.beginPath()
        canvas.moveTo(xReal, yReal)
        canvas.lineTo(xReal + direction.x * itemlength, yReal + direction.y * itemlength)
        canvas.lineWidth = gunmainwidth
        canvas.stroke()

        if (thisguninfo.ammotype === '12G'){ // 12 gauge shotgun - draw one more rect
          const bodysize = itemlength - 4
          const bodywidth = gunmainwidth + thisguninfo.num*2
          canvas.beginPath()
          canvas.moveTo(xReal, yReal)
          canvas.lineTo(xReal + direction.x * bodysize, yReal + direction.y * bodysize)
          canvas.lineWidth = bodywidth
          canvas.stroke()

        } else if(thisguninfo.projectileSpeed >= 30){ // snipters except VSS (can shoot all across the screen)
          const tipsize = 4
          const tipstart = itemlength- tipsize
          const damage = thisguninfo.damage
          let tipwidth = parseInt(gunmainwidth + damage/2)
          if (currentHoldingItem.name==='Lynx'){//Lynx
            tipwidth = 16
          }
          
          const bodylen = itemlength - 40

          // body part
          canvas.beginPath()
          canvas.moveTo(xReal, yReal)
          canvas.lineTo(xReal + direction.x * bodylen, yReal + direction.y * bodylen)
          canvas.lineWidth = gunmainwidth + 2
          canvas.stroke()

          // tip part
          canvas.beginPath()
          canvas.moveTo(xReal + direction.x * tipstart, yReal + direction.y * tipstart)
          canvas.lineTo(xReal + direction.x * itemlength, yReal + direction.y * itemlength)
          canvas.lineWidth = tipwidth
          canvas.stroke()

        } else if(thisguninfo.ammotype==='5mm'){
          const cylotip = 4
          const tipstart = 24
          const tipwidth = gunmainwidth + (thisguninfo.projectileSpeed-22)

          canvas.beginPath()
          canvas.moveTo(xReal + direction.x * tipstart, yReal + direction.y * tipstart)
          canvas.lineTo(xReal + direction.x * (itemlength-cylotip), yReal + direction.y * (itemlength-cylotip))

          canvas.lineWidth = tipwidth
          canvas.stroke()
        } else if(thisguninfo.ammotype==='fragment'){
          const cylotip = 5
          const tipstart = 36
          const tipwidth = gunmainwidth + 3

          canvas.beginPath()
          canvas.moveTo(xReal + direction.x * tipstart, yReal + direction.y * tipstart)
          canvas.lineTo(xReal + direction.x * (itemlength-cylotip), yReal + direction.y * (itemlength-cylotip))

          canvas.lineWidth = tipwidth
          canvas.stroke()

        } else if(thisguninfo.ammotype==='rocket'){
          if (currentHoldingItem.ammo>0){
            const rocketHeadLength = 10
            const rocketWidth = 5
            canvas.beginPath()
            canvas.moveTo(xReal + direction.x * itemlength, yReal + direction.y * itemlength)
            canvas.lineTo(xReal + direction.x * (itemlength+rocketHeadLength), yReal + direction.y * (itemlength+rocketHeadLength))
  
            canvas.lineWidth = rocketWidth
            canvas.stroke()
          }
        } else if(currentHoldingItem.name==='flareGun' && (currentHoldingItem.ammo>0)){
          const tipsize = 4
          const tipstart = itemlength - tipsize

          canvas.strokeStyle = currentHoldingItem.ammotype
          // tip part
          canvas.beginPath()
          canvas.moveTo(xReal + direction.x * tipstart, yReal + direction.y * tipstart)
          canvas.lineTo(xReal + direction.x * itemlength, yReal + direction.y * itemlength)
          canvas.stroke()
          canvas.strokeStyle = 'black'
        }

      }else{ // draw circle 
        if (currentHoldingItem.itemtype === 'melee'){
          //pass
        }
        else{
          let angle = Math.atan2(
            (this.cursorPos.y) - this.canvasHeight/2,
            (this.cursorPos.x) - this.canvasWidth/2
          )
          const direction_of_hand = { 
            x: Math.cos(angle+this.rotation_alpha),
            y: Math.sin(angle+this.rotation_alpha) 
          }

          canvas.fillStyle = currentHoldingItem.color
          canvas.beginPath()
          canvas.arc(this.x-camX + this.start_offset*direction_of_hand.x, this.y-camY+this.start_offset*direction_of_hand.y, 5 , 0, Math.PI * 2, false)
          canvas.fill()
          canvas.fillStyle = 'white'
        }

      }


    }

    displayAttribute(canvas, camX, camY, currentHoldingItem){
      // inventory display
      //const itemName = currentHoldingItem.name
      //canvas.fillText(`[${this.currentSlot}] ${itemName}`,this.x - 50 - camX ,this.y + this.radius*3- camY)
      
      if (currentHoldingItem){
        if (currentHoldingItem.itemtype === 'gun'){
          if (this.reloading){
            canvas.fillText('reloading...',this.x - camX - 50,this.y + this.radius*5- camY)
          } else{
            canvas.fillText(`${currentHoldingItem.ammo}/${currentHoldingItem.magSize}`,this.x - camX - 20,this.y + this.radius*5- camY)
          }
        }
      }
    }

  }
  