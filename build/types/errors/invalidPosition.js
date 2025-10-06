"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class invalidPosition extends error_1.default {
    constructor(cid, p) {
        super(cid);
        this.messege = `Cannot place card with id ${cid} on position ${p.toString()}`;
    }
}
exports.default = invalidPosition;
