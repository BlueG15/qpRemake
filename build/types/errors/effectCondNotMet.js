"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class effectCondNotMet extends error_1.default {
    constructor(eid, cid) {
        super(cid);
        this.messege = `The card with id ${cid} cannot activate the effect with id ${eid}`;
    }
}
exports.default = effectCondNotMet;
