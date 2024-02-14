const tmx = require('tmx-parser');

async function loadMap(mapname) {
    const map = await new Promise((resolve, reject)=>{
        tmx.parseFile(`./src/${mapname}.tmx`, function(err, loadedMap) {
            if (err) return reject(err);
            //console.log(loadedMap);
            resolve(loadedMap);
          });
    })
    
    const groundtiles = map.layers[0].tiles;
    const decaltiles = map.layers[1].tiles;
    const ground2D = [];
    const decals2D = [];
    for (let row=0;row<map.height;row++){
        const tileRow=[];
        const decaltileRow=[];
        for (let col=0;col<map.width;col++){
            const tile = groundtiles[row*map.height+col] 
            const decaltile = decaltiles[row*map.height+col] 
            tileRow.push({id:tile.id, gid: tile.gid});
            if (decaltile){
                decaltileRow.push({id:decaltile.id, gid: decaltile.gid});
            }else{
                decaltileRow.push(undefined);
            }
            
        }
        ground2D.push(tileRow);
        decals2D.push(decaltileRow);
    }
    //console.log("ground2D", ground2D)
    return {ground2D, decals2D};
}

module.exports = loadMap;