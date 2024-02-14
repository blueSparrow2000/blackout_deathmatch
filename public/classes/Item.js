class Item {
    constructor({ groundx, groundy, size, name, onground = true , color = 'white'}) {
      this.groundx = groundx
      this.groundy = groundy
      this.size = size
      this.length = size.length
      this.width = size.width
      this.name = name
      this.color = color
      this.onground = onground // before pickup: true
      this.haloRadius = Math.max(this.length,this.width)/2 + 5
    }
    draw(canvas, camX, camY, {img,offset}) { // on the ground
      if (this.onground){
        canvas.drawImage(img, this.groundx-camX-offset, this.groundy-camY-offset)
        
        // canvas.beginPath()
        // canvas.arc(this.groundx-camX, this.groundy-camY, this.haloRadius, 0, Math.PI * 2, false)
        // canvas.lineWidth = 3
        // canvas.strokeStyle = 'gray'
        // canvas.stroke()

        // // name
        // canvas.fillStyle = 'white'
        // canvas.fillText(this.name,this.groundx - 4*this.name.length-camX,this.groundy+3-camY)
      }
    }
  }


class Gun extends Item {
    constructor({groundx, groundy, size, name, onground = true, color = 'white',iteminfo = {ammo,ammotype}}) {
        super({groundx, groundy, size, name,onground, color})
        this.ammo = iteminfo.ammo
        this.ammotype = iteminfo.ammotype
        this.itemtype = 'gun'
        this.magSize = 0//gunInfoFrontEnd[name].magSize
        this.reloadTime = 0//gunInfoFrontEnd[name].reloadTime
    }

    restock(playerId){
      this.ammo = this.magSize
    }
}


class Consumable extends Item {
  constructor({groundx, groundy, size, name, onground=true, color = 'white',iteminfo = {amount , healamount}}) {
      super({groundx, groundy, size, name, onground, color})
      this.amount = iteminfo.amount
      this.healamount = iteminfo.healamount
      this.itemtype = 'consumable'
      this.gap = 2
      this.barlen = 4
  }
  // draw(canvas, camX, camY, {img,offset}) { // on the ground
  //   if (this.onground){

  //     canvas.beginPath()
  //     canvas.arc(this.groundx-camX, this.groundy-camY, this.length, 0, Math.PI * 2, false)
  //     canvas.fillStyle = this.color
  //     canvas.fill()


  //     if (this.name == 'medkit'){
  //       canvas.beginPath()
  //       canvas.moveTo(this.groundx - this.barlen-camX,this.groundy-camY)
  //       canvas.lineTo(this.groundx + this.barlen-camX,this.groundy-camY)
  //       canvas.strokeStyle = 'red'
  //       canvas.lineWidth = this.gap
  //       canvas.stroke()

  //       canvas.beginPath()
  //       canvas.moveTo(this.groundx-camX,this.groundy - this.barlen-camY)
  //       canvas.lineTo(this.groundx-camX,this.groundy + this.barlen-camY)
  //       canvas.stroke()
  //     }
  //   }
  // }
}


class Melee extends Item {
  constructor({groundx, groundy, size, name, onground = true, color = 'white',iteminfo = {ammo,ammotype}}) {
      super({groundx, groundy, size, name,onground, color})
      this.itemtype = 'melee'
      this.ammo = iteminfo.ammo
      this.ammotype = iteminfo.ammotype
  }
}



let armorImages = {}
const armorKeys = ['reduce','absorb']
for (let i=0;i<armorKeys.length;i++){
  const armorkey = armorKeys[i]
  armorImages[armorkey] = new Image()
  armorImages[armorkey].src = `/images/${armorkey}.png`
}

class Armor extends Item {
  constructor({groundx, groundy, size, name, onground=true, color = 'white',iteminfo = {amount}}) {
      super({groundx, groundy, size, name, onground, color})
      this.amount = iteminfo.amount
      this.itemtype = 'armor'
  }
  draw(canvas, camX, camY,{img,offset}) { // on the ground
    if (this.onground){
      canvas.drawImage(armorImages[this.name], this.groundx-camX-offset, this.groundy-camY-offset)

      // canvas.beginPath()
      // canvas.arc(this.groundx-camX, this.groundy-camY, this.haloRadius, 0, Math.PI * 2, false)
      // canvas.lineWidth = 3
      // canvas.strokeStyle = 'gray'
      // canvas.stroke()

      // // name
      // canvas.fillStyle = this.color
      // canvas.fillText(this.name,this.groundx - 4*this.name.length-camX,this.groundy+3-camY)
    }
  }
}



let scopeImages = {}
const scopeKeys = ["1","2","3","4"]
for (let i=0;i<scopeKeys.length;i++){
  const scopekey = scopeKeys[i]
  scopeImages[scopekey] = new Image()
  scopeImages[scopekey].src = `/images/${scopekey}.png`
}


class Scope extends Item {
  constructor({groundx, groundy, size, name, onground=true, color = 'white',iteminfo = {scopeDist}}) {
      super({groundx, groundy, size, name, onground, color})
      this.scopeDist = iteminfo.scopeDist
      this.itemtype = 'scope'
  }
  draw(canvas, camX, camY, {img,offset}) { // on the ground
    if (this.onground){
      canvas.drawImage(scopeImages[this.name], this.groundx-camX-offset, this.groundy-camY-offset)

    }
  }

}

let placeableItemImages = {}
const placeableItemkeys = ['barrel','SaharaBarrel','mine','SaharaMine']
for (let i=0;i<placeableItemkeys.length;i++){
  const placeablekey = placeableItemkeys[i]
  placeableItemImages[placeablekey] = new Image()
  placeableItemImages[placeablekey].src = `/images/${placeablekey}_item.png`
}

class Placeable extends Item {
  constructor({groundx, groundy, size, name, onground=true, color = 'white',iteminfo = {variantName}}) {
      super({groundx, groundy, size, name, onground, color})
      this.variantName = iteminfo.variantName
      this.imgName = name
      if (this.variantName !== ''){
        this.imgName = this.variantName
      }
      this.itemtype = 'placeable'

  }
  draw(canvas, camX, camY, {img,offset}) { // on the ground
    if (this.onground){
      canvas.drawImage(placeableItemImages[this.imgName], this.groundx-camX-offset, this.groundy-camY-offset)

    }
  }
}