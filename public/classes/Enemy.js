class Enemy {
    constructor({x, y, radius, color, velocity, damage, health=1,wearingarmorID = -1}) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.velocity = velocity
      this.damage = damage
      this.health = health
      this.wearingarmorID = wearingarmorID
    }
  
    draw(canvas, camX, camY) {
      canvas.beginPath()
      // canvas.fillStyle = this.color
      canvas.arc(this.x-camX, this.y-camY, this.radius, 0, Math.PI * 2, false)
      canvas.fill()
    }
  }
  
  