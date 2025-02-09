//import zone from "../baseClass/zone";
import position from "../baseClass/position";

import utils from "../baseClass/util";
import zone_grid from "../baseClass/zone_gridBased";

//[0][1][2][3][4]
//[5][6][7][8][9]

//flipped if enemy

class field extends zone_grid {
    constructor(isPlayerField : boolean);
    constructor(keyStr : string);
    constructor(param : boolean | string = true){
        if(typeof param == "string") super(param);
        else if(param) super("playerField");
        else super("enemyField");
    }

    getEmptyPosArr(){
        let res : position[] = [];
        for(let i = 0; i < this.capacity; i++){
            if(this.cardArr[i]) continue;
            let p = new position(this.id, ...utils.indexToPosition(i, this.shape))
            res.push(p);
        }
        return res;
    }

    getRandomEmptyPos(){
        let posArr = this.getEmptyPosArr()
        let idx = utils.rng(posArr.length - 1, 0, true)
        return posArr[idx]
    }

    isCardExposed(cid : string){
        let idx = this.findIndex(cid)
        if(idx < 0) return false
        if(idx < 5) return true
        if(this.cardArr[idx - 5]) return false;
        return true
    }
}

export default field