//import zone from "../baseClass/zone";
import Position from "../abstract/generics/position";

import utils from "../../utils";
import zone_grid from "../abstract/gameComponents/zone_gridBased";
import type { dry_card } from "../../data/systemRegistry";

//[0][1][2][3][4]
//[5][6][7][8][9]

//flipped if enemy

class field extends zone_grid {
    // constructor(isPlayerField : boolean);
    // constructor(keyStr : string);
    // constructor(param : boolean | string = true){
    //     if(typeof param == "string") super(param);
    //     else if(param) super("playerField");
    //     else super("enemyField");
    // }

    getEmptyPosArr(){
        let res : Position[] = [];
        for(let i = 0; i < this.capacity; i++){
            if(this.cardArr[i]) continue;
            let p = new Position(this.id, this.name, ...utils.indexToPosition(i, this.shape))
            res.push(p);
        }
        return res;
    }

    getRandomEmptyPos(){
        let posArr = this.getEmptyPosArr()
        let idx = utils.rng(posArr.length - 1, 0, true)
        return posArr[idx]
    }

    isCardExposed(c : dry_card){
        let idx = utils.positionToIndex(c.pos.flat(), this.shape);
        if(!this.cardArr[idx] || this.cardArr[idx].id !== c.id) return false;
        if(idx < 0) return false
        if(idx < 5) return true
        if(this.cardArr[idx - 5]) return false;
        return true
    }
}

export default field