"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class effectNotExist extends error_1.default {
    constructor(eid_or_index, cid) {
        super();
        this.messege = `The effect with id / index ${eid_or_index} doesnt exist on the card reference with id ${cid}, wrong activation time perhaps?`;
    }
}
exports.default = effectNotExist;
