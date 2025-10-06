"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
//For accessing effect using idx instead of eid
class wrongEffectIdx extends error_1.default {
    constructor(eidx, cid) {
        super(cid);
        this.messege = `The card with id ${cid} do not have the effect at index ${eidx}`;
    }
}
exports.default = wrongEffectIdx;
