class Particle {
    constructor({x, y, velocity, color}) {
      this.x = x
      this.y = y
      this.color = color
      this.velocity = velocity
      this.FRICTION = 0.97
      this.alpha = 1 // experimental feature. If too laggy, then will be removed
      this.deleteRequest = false
    }
  
    move(){
        this.velocity.x *= this.FRICTION
        this.velocity.y *= this.FRICTION
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.02

        if (this.alpha < 0.05){
            this.deleteRequest = true
        }
    }

    draw(canvas, camX, camY) {
        // line
        //const saveAlpha = canvas.globalAlpha // does this work?
        canvas.save()

        canvas.globalAlpha = this.alpha
        canvas.beginPath()
        canvas.moveTo(this.x - this.velocity.x*3 - camX, this.y - this.velocity.y*3 - camY)
        canvas.lineTo(this.x - camX,this.y - camY)
        canvas.stroke()

        canvas.restore()
        //canvas.globalAlpha = saveAlpha // does this work?

        this.move()
    }

  }
  