"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import zone from "../baseClass/zone";
const position_1 = __importDefault(require("../abstract/generics/position"));
const zone_gridBased_1 = __importDefault(require("../abstract/gameComponents/zone_gridBased"));
//[0][1][2][3][4]
//[5][6][7][8][9]
//flipped if enemy
class field extends zone_gridBased_1.default {
    getEmptyPosArr() {
        let res = [];
        for (let i = 0; i < this.capacity; i++) {
            if (this.cardArr[i])
                continue;
            let p = new position_1.default(this.id, this.name, ...Utils.indexToPosition(i, this.shape));
            res.push(p);
        }
        return res;
    }
    getRandomEmptyPos() {
        let posArr = this.getEmptyPosArr();
        let idx = Utils.rng(posArr.length - 1, 0, true);
        return posArr[idx];
    }
    getFrontPos(c) {
        return new position_1.default(this.id, this.name, c.pos.x, c.pos.y - 1);
    }
    getBackPos(c) {
        return new position_1.default(this.id, this.name, c.pos.x, c.pos.y + 1);
    }
}
exports.default = field;
