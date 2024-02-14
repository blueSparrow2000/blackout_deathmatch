class Vehicle {
    constructor({x, y, radius, color, warningcolor, velocity, damage, health=1,occupied,ridingPlayerID, type}) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.warningcolor = warningcolor
      this.velocity = velocity
      this.damage = damage
      this.health = health
      this.occupied = occupied
      this.ridingPlayerID = ridingPlayerID
      this.type = type
    }
  
    draw(canvas, camX, camY) {
      canvas.beginPath()
      if (this.health<8){
        canvas.fillStyle = this.warningcolor
      }else{
        canvas.fillStyle = this.color
      }

      canvas.arc(this.x-camX, this.y-camY, this.radius, 0, Math.PI * 2, false)
      canvas.fill()

      canvas.beginPath()
      canvas.arc(this.x-camX, this.y-camY, this.radius, 0, Math.PI * 2, false)
      canvas.stroke()

    }
  }

class Car extends Vehicle{
    constructor({x, y, radius, color,warningcolor, velocity, damage, health=1,occupied,ridingPlayerID, type}) {
        super({x, y, radius, color,warningcolor, velocity, damage, health,occupied,ridingPlayerID,type})
    }
}


// BRDM-like vehicle (no cannon)
class Fennek extends Vehicle{
  constructor({x, y, radius, color,warningcolor, velocity, damage, health=1,occupied,ridingPlayerID, type}) {
      super({x, y, radius, color,warningcolor, velocity, damage, health,occupied,ridingPlayerID,type})
  }
}

class APC extends Vehicle{
  constructor({x, y, radius, color,warningcolor, velocity, damage, health=1,occupied,ridingPlayerID, type,turretName}) {
      super({x, y, radius, color,warningcolor, velocity, damage, health,occupied,ridingPlayerID,type})
      this.turretName = turretName
  }
  // draw(canvas, camX, camY) {
  //   canvas.beginPath()
  //   if (this.health<8){
  //     canvas.fillStyle = this.warningcolor
  //   }else{
  //     canvas.fillStyle = this.color
  //   }

  //   canvas.arc(this.x-camX, this.y-camY, this.radius, 0, Math.PI * 2, false)
  //   canvas.fill()

  //   canvas.beginPath()
  //   canvas.lineWidth = 4
  //   canvas.arc(this.x-camX, this.y-camY, this.radius, 0, Math.PI * 2, false)
  //   canvas.stroke()

  // }
  // drawGun(canvas, camX, camY, locX, locY,canvasEl){// this should be drawn first than the tank
  //   canvas.strokeStyle = 'black'

  //   let xReal = locX
  //   let yReal = locY
  //   if (locX===-1){ // other player
  //     xReal = this.x - camX 
  //     yReal = this.y - camY
  //   }

  //   const itemlength = 40
  //   const gunmainwidth = 10
  //   let angle = Math.atan2(
  //     (this.cursorPos.y) - canvasEl.height/2,
  //     (this.cursorPos.x) - canvasEl.width/2
  //   )
  //   const direction = { 
  //     x: Math.cos(angle),
  //     y: Math.sin(angle) 
  //   }
  //   canvas.beginPath()
  //   canvas.moveTo(xReal, yReal)
  //   canvas.lineTo(xReal + direction.x * itemlength, yReal + direction.y * itemlength)
  //   canvas.lineWidth = gunmainwidth
  //   canvas.stroke()
  // }

}

class TANK extends Vehicle{
  constructor({x, y, radius, color,warningcolor, velocity, damage, health=1,occupied,ridingPlayerID, type,turretName}) {
      super({x, y, radius, color,warningcolor, velocity, damage, health,occupied,ridingPlayerID,type})
      this.turretName = turretName
  }
}

class TURRET extends Vehicle{
  constructor({x, y, radius, color,warningcolor, velocity, damage, health=1,occupied,ridingPlayerID, type,turretName}) {
      super({x, y, radius, color,warningcolor, velocity, damage, health,occupied,ridingPlayerID,type})
      this.turretName = turretName
  }
}

class RAPTOR extends Vehicle{
  constructor({x, y, radius, color,warningcolor, velocity, damage, health=1,occupied,ridingPlayerID, type,turretName}) {
      super({x, y, radius, color,warningcolor, velocity, damage, health,occupied,ridingPlayerID,type})
      this.turretName = turretName
  }
}

class B2 extends Vehicle{
  constructor({x, y, radius, color,warningcolor, velocity, damage, health=1,occupied,ridingPlayerID, type,turretName}) {
      super({x, y, radius, color,warningcolor, velocity, damage, health,occupied,ridingPlayerID,type})
      this.turretName = turretName
  }
}