class ObjectEntity {
    constructor({objecttype, health,name}) {
      this.objecttype = objecttype
      this.health = health
      this.originalHealth = health
      this.name = name
    }
    draw(canvas, camX, camY) {
    }
  }
  
class Wall extends ObjectEntity {
  constructor({objecttype, health, objectinfo,name}) {
    super({objecttype, health,name})
    this.linewidth = objectinfo.width
    this.start = objectinfo.start
    this.end = objectinfo.end
    this.color = objectinfo.color
    this.orientation = objectinfo.orientation
    this.x = Math.round((this.start.x + this.end.x) /2)
    this.y = Math.round((this.start.y + this.end.y) /2)

  }
  draw(canvas, camX, camY) { // on the ground
    canvas.beginPath()
    canvas.moveTo(this.start.x-camX,this.start.y-camY)
    canvas.lineTo(this.end.x-camX,this.end.y-camY)
    // canvas.lineWidth = this.linewidth * (this.health)/this.originalHealth
    canvas.lineWidth = this.linewidth
    canvas.stroke()
  }
}
  
  
class Hut extends ObjectEntity {
  constructor({objecttype, health, objectinfo,name}) {
    super({objecttype, health,name})
    this.x = objectinfo.center.x
    this.y = objectinfo.center.y
    this.radius = objectinfo.radius
    this.color = objectinfo.color
  }
  draw(canvas, camX, camY) { // on the ground
    canvas.beginPath()
    canvas.arc(this.x-camX, this.y-camY, this.radius , 0, Math.PI * 2, false)
    canvas.fill()
  }
}


let placeableObjectImages = {}
const placeableObjectKeys = ['SaharaBarrel','barrel','mine','SaharaMine']
for (let i=0;i<placeableObjectKeys.length;i++){
  const placeableObjectkey = placeableObjectKeys[i]
  placeableObjectImages[placeableObjectkey] = new Image()
  placeableObjectImages[placeableObjectkey].src = `/images/${placeableObjectkey}.png`
}


class PlaceableObject extends ObjectEntity {
  constructor({objecttype, health, objectinfo,name}) {
    super({objecttype, health,name})
    this.x = objectinfo.center.x
    this.y = objectinfo.center.y
    this.radius = objectinfo.radius
    this.color = objectinfo.color
    this.offset = 24
  }
  draw(canvas, camX, camY) { // on the ground
    canvas.drawImage(placeableObjectImages[this.name], this.x-camX-this.offset, this.y-camY-this.offset)
  }
}
  