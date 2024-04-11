class Particle {
    constructor({x, y, velocity, color}) {
      this.x = x
      this.y = y
      this.color = color
      this.velocity = velocity
      this.FRICTION = 0.97
      this.alpha = 1 // experimental feature. If too laggy, then will be removed
      this.deleteRequest = false
      this.type = 'particle'
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
  


  class FireworkRocket {
    constructor({x, y, Yvelocity, color}) {
      this.x = x
      this.y = y
      this.color = color
      this.Yvelocity = Yvelocity
      this.FRICTION = 0.92
      this.deleteRequest = false
      this.type = 'fireworkRocket'
    }
  
    move(){
        this.Yvelocity *= this.FRICTION
        this.y -= this.Yvelocity

        if (this.Yvelocity < 1){
            this.deleteRequest = true
        }
    }

    draw(canvas, camX, camY) {
        // line
        canvas.beginPath()
        canvas.moveTo(this.x - camX, this.y - this.Yvelocity*3 - camY)
        canvas.lineTo(this.x - camX,this.y - camY)
        canvas.stroke()

        this.move()
    }

  }
  

  class Blood {
    constructor({x, y, velocity, name}) {
      this.x = x
      this.y = y
      this.color = 'Crimson'
      this.velocity = velocity
      this.name = name
      this.deleteRequest = false
      this.radius = 7
      this.duration = 10 // ticks
    }
    draw(canvas, camX, camY) {
      // canvas.fillStyle = this.color // should be done outside
      canvas.beginPath()
      canvas.arc(this.x-camX, this.y-camY, this.radius , 0, Math.PI * 2, false)
      canvas.fill()

      // update
      this.duration -= 1
      // this.x += this.velocity.x
      // this.y += this.velocity.y

      if (this.duration < 0){
          this.deleteRequest = true
      }

    }
  }

  
class Ping {
  constructor({x, y, x_map, y_map}) {
    this.x = x
    this.y = y
    this.x_map = x_map
    this.y_map = y_map
    this.color = 'Aqua'
    this.deleteRequest = false
    this.duration = 520 // ticks
  }
  draw(canvas, camX, camY,centerX,centerY) { // a line that links player and a ping (player location is the center!)
      // line
      canvas.beginPath()
      canvas.moveTo(centerX,centerY)
      canvas.lineTo(this.x - camX,this.y - camY)
      canvas.stroke()

      this.duration -= 1

      if (this.duration < 0){
          this.deleteRequest = true
      }
  }
  // this is done on the code
  // draw_on_minimap(){
  // }
}