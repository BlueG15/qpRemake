//import zone from "../baseClass/zone";
import Position from "../abstract/generics/position";

import utils from "../../utils";
import zone_grid from "../abstract/gameComponents/zone_gridBased";
import type { dry_card, dry_position } from "../../data/systemRegistry";
import { Positionable } from "../misc";

//[0][1][2][3][4]
//[5][6][7][8][9]

//flipped if enemy

class field extends zone_grid {
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

    override getFrontPos(c: Positionable): dry_position {
        return new Position(this.id, this.name, c.pos.x, c.pos.y - 1)
    }

    override getBackPos(c: Positionable): dry_position {
        return new Position(this.id, this.name, c.pos.x, c.pos.y + 1)
    }
}

export default field