class Projectile {
    constructor({x, y, radius,velocity, color = 'black',gunName}) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.velocity = velocity
      this.gunName = gunName
    }
  
    draw(canvas, camX, camY) {
        if (this.gunName==='flareGun'){
          canvas.fillStyle = this.color
          canvas.beginPath()
          canvas.arc(this.x-camX, this.y-camY, this.radius , 0, Math.PI * 2, false)
          canvas.fill()
          this.radius+=0.1
          return
        }
        canvas.beginPath()
        canvas.moveTo(this.x - this.velocity.x - camX, this.y - this.velocity.y - camY)
        canvas.lineTo(this.x - camX,this.y - camY)
        canvas.stroke()
    }

  }
  